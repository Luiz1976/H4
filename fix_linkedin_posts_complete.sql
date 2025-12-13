-- Complete fix for linkedin_posts table
-- Run this in Supabase SQL Editor

-- Add all missing columns to linkedin_posts
ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Post';

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS image_index INTEGER DEFAULT 1;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ready';

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS engagement_likes INTEGER DEFAULT 0;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS engagement_comments INTEGER DEFAULT 0;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS engagement_shares INTEGER DEFAULT 0;

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add status constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'linkedin_posts_status_check'
    ) THEN
        ALTER TABLE public.linkedin_posts
        ADD CONSTRAINT linkedin_posts_status_check 
        CHECK (status IN ('ready', 'scheduled', 'published', 'failed'));
    END IF;
END $$;

-- Update existing NULL titles to have a default value
UPDATE public.linkedin_posts
SET title = 'Untitled Post'
WHERE title IS NULL;

-- Now make title NOT NULL if it isn't already
DO $$
BEGIN
    ALTER TABLE public.linkedin_posts
    ALTER COLUMN title SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if already NOT NULL
END $$;
