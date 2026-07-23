-- Run this in Supabase SQL Editor to add the method column
ALTER TABLE targets ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'wild';

-- Migrate old tier values
UPDATE targets SET tier = 'tier' || tier WHERE tier ~ '^[0-7]$';

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
  caught BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
