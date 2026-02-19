-- Expand analyzed_images with modern wedding photography vision tags
-- Run this against your Supabase database

-- New text fields for expanded classification
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS subject_type TEXT NOT NULL DEFAULT 'couple';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS pose_direction TEXT NOT NULL DEFAULT 'candid';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS creative_techniques TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS color_toning TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS editorial_publishable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS emotional_narrative TEXT NOT NULL DEFAULT '';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS weather_conditions TEXT NOT NULL DEFAULT 'clear';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS cultural_elements TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS luxury_indicators TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS dress_visible BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE analyzed_images ADD COLUMN IF NOT EXISTS has_motion_blur BOOLEAN NOT NULL DEFAULT false;

-- Indexes for new commonly-filtered fields
CREATE INDEX IF NOT EXISTS analyzed_images_subject_type_idx ON analyzed_images(subject_type);
CREATE INDEX IF NOT EXISTS analyzed_images_editorial_idx ON analyzed_images(editorial_publishable);
