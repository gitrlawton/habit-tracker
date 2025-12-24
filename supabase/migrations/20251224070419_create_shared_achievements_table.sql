/*
  # Create shared achievements table

  1. New Tables
    - `shared_achievements`
      - `id` (uuid, primary key) - Unique identifier for the shared achievement
      - `share_code` (text, unique) - Short unique code for sharing URLs
      - `habit_name` (text) - Name of the habit being shared
      - `habit_color` (text) - Color of the habit
      - `current_streak` (integer) - Current streak at time of sharing
      - `longest_streak` (integer) - Longest streak at time of sharing
      - `total_completions` (integer) - Total completions at time of sharing
      - `completion_rate` (integer) - Completion rate percentage
      - `message` (text) - Optional custom message from user
      - `created_at` (timestamptz) - When the share was created
      - `expires_at` (timestamptz) - When the share link expires

  2. Security
    - Enable RLS on `shared_achievements` table
    - Add policy for anyone to read shared achievements (public sharing)
    - Add policy for anonymous inserts (no auth required for this app)

  3. Notes
    - Share codes are short random strings for easy sharing
    - Shares expire after 30 days by default
*/

CREATE TABLE IF NOT EXISTS shared_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code text UNIQUE NOT NULL,
  habit_name text NOT NULL,
  habit_color text NOT NULL DEFAULT '#3b82f6',
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  total_completions integer NOT NULL DEFAULT 0,
  completion_rate integer NOT NULL DEFAULT 0,
  message text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS idx_shared_achievements_share_code ON shared_achievements(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_achievements_expires_at ON shared_achievements(expires_at);

ALTER TABLE shared_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared achievements"
  ON shared_achievements
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

CREATE POLICY "Anyone can create shared achievements"
  ON shared_achievements
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
