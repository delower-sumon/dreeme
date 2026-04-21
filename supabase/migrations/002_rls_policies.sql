-- Migration: Row Level Security Policies
-- Description: Enable RLS and create security policies for all tables
-- Created: 2025-11-19

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Moods table is public read-only
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view public profiles
CREATE POLICY "Anyone can view public profiles"
  ON profiles FOR SELECT
  USING (profile_visibility = 'public');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- MOODS POLICIES
-- =====================================================

-- Everyone can read moods
CREATE POLICY "Anyone can view moods"
  ON moods FOR SELECT
  TO authenticated, anon
  USING (true);

-- =====================================================
-- DREAMS POLICIES
-- =====================================================

-- Users can view their own dreams
CREATE POLICY "Users can view own dreams"
  ON dreams FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view shared dreams
CREATE POLICY "Anyone can view shared dreams"
  ON dreams FOR SELECT
  USING (is_shared = true);

-- Users can insert their own dreams
CREATE POLICY "Users can insert own dreams"
  ON dreams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own dreams
CREATE POLICY "Users can update own dreams"
  ON dreams FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own dreams
CREATE POLICY "Users can delete own dreams"
  ON dreams FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- DREAM_MOODS POLICIES
-- =====================================================

-- Users can view moods for their own dreams
CREATE POLICY "Users can view own dream moods"
  ON dream_moods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_moods.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- Users can view moods for shared dreams
CREATE POLICY "Anyone can view shared dream moods"
  ON dream_moods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_moods.dream_id
      AND dreams.is_shared = true
    )
  );

-- Users can insert moods for their own dreams
CREATE POLICY "Users can insert own dream moods"
  ON dream_moods FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_moods.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- Users can delete moods from their own dreams
CREATE POLICY "Users can delete own dream moods"
  ON dream_moods FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_moods.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- =====================================================
-- DREAM_TAGS POLICIES
-- =====================================================

-- Users can view tags for their own dreams
CREATE POLICY "Users can view own dream tags"
  ON dream_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_tags.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- Users can view tags for shared dreams
CREATE POLICY "Anyone can view shared dream tags"
  ON dream_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_tags.dream_id
      AND dreams.is_shared = true
    )
  );

-- Users can insert tags for their own dreams
CREATE POLICY "Users can insert own dream tags"
  ON dream_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_tags.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- Users can delete tags from their own dreams
CREATE POLICY "Users can delete own dream tags"
  ON dream_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_tags.dream_id
      AND dreams.user_id = auth.uid()
    )
  );

-- =====================================================
-- DREAM_LIKES POLICIES
-- =====================================================

-- Anyone can view likes on shared dreams
CREATE POLICY "Anyone can view dream likes"
  ON dream_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_likes.dream_id
      AND dreams.is_shared = true
    )
  );

-- Authenticated users can like shared dreams
CREATE POLICY "Users can like shared dreams"
  ON dream_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_likes.dream_id
      AND dreams.is_shared = true
    )
  );

-- Users can unlike dreams they liked
CREATE POLICY "Users can unlike dreams"
  ON dream_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- DREAM_COMMENTS POLICIES
-- =====================================================

-- Anyone can view comments on shared dreams
CREATE POLICY "Anyone can view dream comments"
  ON dream_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_comments.dream_id
      AND dreams.is_shared = true
    )
  );

-- Authenticated users can comment on shared dreams
CREATE POLICY "Users can comment on shared dreams"
  ON dream_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM dreams
      WHERE dreams.id = dream_comments.dream_id
      AND dreams.is_shared = true
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON dream_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON dream_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ARTICLES POLICIES
-- =====================================================

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (published = true);

-- Authors can view their own unpublished articles
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = author_id);

-- Only authenticated users can create articles (can add admin check later)
CREATE POLICY "Authenticated users can create articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own articles
CREATE POLICY "Authors can delete own articles"
  ON articles FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- ARTICLE_LIKES POLICIES
-- =====================================================

-- Anyone can view article likes
CREATE POLICY "Anyone can view article likes"
  ON article_likes FOR SELECT
  USING (true);

-- Authenticated users can like articles
CREATE POLICY "Users can like articles"
  ON article_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike articles
CREATE POLICY "Users can unlike articles"
  ON article_likes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER_STREAKS POLICIES
-- =====================================================

-- Users can view their own streaks
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own streaks
CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own streaks
CREATE POLICY "Users can update own streaks"
  ON user_streaks FOR UPDATE
  USING (auth.uid() = user_id);
