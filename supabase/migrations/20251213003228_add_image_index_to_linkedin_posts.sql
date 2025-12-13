-- Add image_index column to linkedin_posts table
ALTER TABLE linkedin_posts
ADD COLUMN IF NOT EXISTS image_index INTEGER DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN linkedin_posts.image_index IS 'Index (1 or 2) indicating which promotional image to use with this post';
