/*
  # Update chat messages table for wallet addresses

  1. Changes
    - Modify chat_messages table to use text for user_id instead of uuid
    - Update policies to handle wallet addresses
    - Add index for better performance
*/

-- Drop existing table and recreate with correct user_id type
DROP TABLE IF EXISTS chat_messages;

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  emojis text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Update policies for text-based user_id
CREATE POLICY "Anyone can read chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt()->>'sub' OR user_id = current_user);

-- Create index for better performance
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at DESC);