-- Check if dream_comments table exists and modify it to support text user_ids
-- This allows Google OAuth IDs (strings) to be stored

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view dream comments" ON dream_comments;
DROP POLICY IF EXISTS "Users can comment on shared dreams" ON dream_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON dream_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON dream_comments;

-- Drop the existing table if it exists
DROP TABLE IF EXISTS dream_comments CASCADE;

-- Recreate the table with TEXT user_id to support Google OAuth
CREATE TABLE dream_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- Changed from UUID to TEXT to support Google OAuth IDs
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    parent_comment_id UUID REFERENCES dream_comments(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_dream_comments_dream ON dream_comments(dream_id, created_at DESC);
CREATE INDEX idx_dream_comments_user ON dream_comments(user_id);
CREATE INDEX idx_dream_comments_parent ON dream_comments(parent_comment_id);

-- Enable RLS
ALTER TABLE dream_comments ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper type casting
CREATE POLICY "Anyone can view dream comments" 
ON dream_comments 
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM dreams
        WHERE dreams.id = dream_comments.dream_id
        AND dreams.is_shared = true
    )
);

CREATE POLICY "Authenticated users can comment on shared dreams" 
ON dream_comments 
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM dreams
        WHERE dreams.id = dream_comments.dream_id
        AND dreams.is_shared = true
    )
);

CREATE POLICY "Users can update own comments" 
ON dream_comments 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own comments" 
ON dream_comments 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create trigger for updated_at
CREATE TRIGGER set_dream_comments_updated_at 
BEFORE UPDATE ON dream_comments 
FOR EACH ROW 
EXECUTE FUNCTION public.handle_updated_at();
