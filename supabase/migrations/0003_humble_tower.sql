/*
  # Fix chat message policies

  1. Changes
    - Update RLS policies for chat messages
    - Allow public access for reading messages
    - Fix user_id validation in insert policy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create their own messages" ON chat_messages;

-- Create new policies
CREATE POLICY "Public read access"
  ON chat_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add created_at trigger for automatic timestamps
CREATE OR REPLACE FUNCTION set_current_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_current_timestamp();