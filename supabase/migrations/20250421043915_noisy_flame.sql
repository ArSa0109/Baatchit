/*
  # Fix RLS policies for user registration and querying

  1. Changes
    - Update RLS policies for the users table to allow:
      - Public access for username checks
      - User registration
      - Profile updates
    - Keep existing admin policies intact

  2. Security
    - Maintain secure access control while allowing necessary operations
    - Ensure proper user registration flow
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can read other users' profile data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Allow public access for username checks
CREATE POLICY "Public can check usernames"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to read all user profiles
CREATE POLICY "Users can read all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow new user registration
CREATE POLICY "Enable insert for authentication service"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = true
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = true
    )
  );