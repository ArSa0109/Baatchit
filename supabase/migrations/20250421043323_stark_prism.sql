/*
  # Initial schema setup for Baatchit Chat Application

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `username` (text, unique)
      - `email` (text, unique)
      - `avatar_url` (text, nullable)
      - `last_seen` (timestamp with time zone, nullable)
    - `messages`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `sender_id` (uuid, foreign key to users.id)
      - `receiver_id` (uuid, foreign key to users.id)
      - `content` (text, nullable)
      - `file_url` (text, nullable)
      - `file_type` (text, nullable)
      - `file_size` (integer, nullable)
      - `read` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own user data
      - Read other users' basic profile information
      - Create, read, and update messages they send or receive
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  last_seen timestamptz
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text,
  file_url text,
  file_type text,
  file_size integer,
  read boolean DEFAULT false NOT NULL,
  CONSTRAINT either_content_or_file CHECK (content IS NOT NULL OR file_url IS NOT NULL)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can read other users' basic profile data
CREATE POLICY "Users can read other users' profile data"
  ON users
  FOR SELECT
  USING (true);

-- Messages policies
-- Users can read messages they've sent or received
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create messages where they are the sender
CREATE POLICY "Users can create their own messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they've sent or received (to mark as read)
CREATE POLICY "Users can update messages they've sent or received"
  ON messages
  FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_files', 'chat_files', true);

-- Storage policies for chat files
CREATE POLICY "Users can upload files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'chat_files' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can access any chat file"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat_files');