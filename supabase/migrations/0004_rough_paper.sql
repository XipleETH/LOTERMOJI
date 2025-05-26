/*
  # Fix chat message policies and authentication

  1. Changes
    - Remove authentication requirement for reading messages
    - Allow message creation with wallet addresses
    - Add proper indexing for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON chat_messages;

-- Create new policies that don't require authentication
CREATE POLICY "Anyone can read messages"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- Add index for user_id for better performance
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);