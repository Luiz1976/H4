-- Quick fix: Add image_index column directly
-- Run this in Supabase SQL Editor

ALTER TABLE public.linkedin_posts
ADD COLUMN IF NOT EXISTS image_index INTEGER DEFAULT 1;

COMMENT ON COLUMN public.linkedin_posts.image_index IS 'Index (1 or 2) indicating which promotional image to use with this post';
