/*
  # Add admin role to users

  1. Changes
    - Add `is_admin` column to `users` table with default value of false
    - Add RLS policy for admin users to manage other users
    - Add RLS policy for admin users to manage all messages

  2. Security
    - Enable RLS policies for admin access
    - Regular users can still only access their own data
    - Admins can access and manage all data
*/

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add index for is_admin column for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Add RLS policies for admin access to users table
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ));

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ));

-- Add RLS policies for admin access to messages table
CREATE POLICY "Admins can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ));

CREATE POLICY "Admins can delete messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ));