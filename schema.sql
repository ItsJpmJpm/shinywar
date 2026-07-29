-- Run this in Supabase SQL Editor to add the method column
ALTER TABLE targets ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'wild';

-- Run this to add is_alpha column
ALTER TABLE targets ADD COLUMN IF NOT EXISTS is_alpha BOOLEAN DEFAULT FALSE;

-- Run this to add is_secret column
ALTER TABLE targets ADD COLUMN IF NOT EXISTS is_secret BOOLEAN DEFAULT FALSE;

-- Migrate old tier values
UPDATE targets SET tier = 'tier' || tier WHERE tier ~ '^[0-7]$';

-- Migrate old 'secret' method to is_secret flag
UPDATE targets SET is_secret = TRUE, method = 'wild' WHERE method = 'secret';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Targets table (new)
CREATE TABLE IF NOT EXISTS targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pokemon_name TEXT NOT NULL,
  tier TEXT DEFAULT 'tier7',
  method TEXT DEFAULT 'wild',
  is_alpha BOOLEAN DEFAULT FALSE,
  is_secret BOOLEAN DEFAULT FALSE,
  caught BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add sort_order column for target reordering
ALTER TABLE targets ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Backfill sort_order for existing targets (by created_at per user)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS n
  FROM targets WHERE sort_order IS NULL
)
UPDATE targets SET sort_order = numbered.n
FROM numbered WHERE targets.id = numbered.id;

-- Pokemon data overrides (admin-editable seasons + tier)
DROP TABLE IF EXISTS pokemon_seasons;
CREATE TABLE IF NOT EXISTS pokemon_data (
  name TEXT PRIMARY KEY,
  seasons TEXT DEFAULT 'all',
  tier TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for pokemon_data
ALTER TABLE pokemon_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon key) to read pokemon_data
DROP POLICY IF EXISTS "Anyone can read pokemon_data" ON pokemon_data;
CREATE POLICY "Anyone can read pokemon_data"
  ON pokemon_data FOR SELECT
  USING (true);

-- Allow anyone (anon key) to insert/update pokemon_data
-- (frontend already restricts edit UI to admin users)
DROP POLICY IF EXISTS "Anyone can upsert pokemon_data" ON pokemon_data;
CREATE POLICY "Anyone can upsert pokemon_data"
  ON pokemon_data FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update pokemon_data" ON pokemon_data;
CREATE POLICY "Anyone can update pokemon_data"
  ON pokemon_data FOR UPDATE
  USING (true);
