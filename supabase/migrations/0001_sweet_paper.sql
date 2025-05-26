/*
  # Initial Schema Setup for LottoMoji

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `numbers` (text array, stores emoji selections)
      - `created_at` (timestamp)
      - `game_id` (uuid, for grouping tickets in same game)
    
    - `game_results`
      - `id` (uuid, primary key)
      - `winning_numbers` (text array, stores winning emojis)
      - `timestamp` (timestamp)
      - `first_prize_tickets` (uuid array, references tickets)
      - `second_prize_tickets` (uuid array, references tickets)
      - `third_prize_tickets` (uuid array, references tickets)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `emojis` (text array, stores message emojis)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Tickets table
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  numbers text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  game_id uuid NOT NULL
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own tickets"
  ON tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Game results table
CREATE TABLE game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  winning_numbers text[] NOT NULL,
  timestamp timestamptz DEFAULT now(),
  first_prize_tickets uuid[] DEFAULT '{}',
  second_prize_tickets uuid[] DEFAULT '{}',
  third_prize_tickets uuid[] DEFAULT '{}'
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game results"
  ON game_results FOR SELECT
  TO authenticated
  USING (true);

-- Chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  emojis text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX tickets_user_id_idx ON tickets(user_id);
CREATE INDEX tickets_game_id_idx ON tickets(game_id);
CREATE INDEX game_results_timestamp_idx ON game_results(timestamp DESC);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at DESC);