-- Migration: Add missing columns to align with application schema
-- Run this in Supabase SQL Editor

-- ── mismatch_items: replace old 'data JSONB' schema with normalized columns ──

-- First add all the new columns
ALTER TABLE mismatch_items
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS match_key TEXT,
  ADD COLUMN IF NOT EXISTS field_name TEXT,
  ADD COLUMN IF NOT EXISTS tally_value TEXT,
  ADD COLUMN IF NOT EXISTS gst_value TEXT,
  ADD COLUMN IF NOT EXISTS normalized_tally TEXT,
  ADD COLUMN IF NOT EXISTS normalized_gst TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- Drop old data column if it still exists
ALTER TABLE mismatch_items DROP COLUMN IF EXISTS data;
ALTER TABLE mismatch_items DROP COLUMN IF EXISTS status;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS mismatch_items_category_idx ON mismatch_items(category);
CREATE INDEX IF NOT EXISTS mismatch_items_match_key_idx ON mismatch_items(match_key);
