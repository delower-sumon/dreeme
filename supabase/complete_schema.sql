-- =====================================================
-- COMPLETE DATABASE SCHEMA FOR DREAM JOURNAL
-- Execute this entire file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: TABLES
-- =====================================================

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Privacy settings
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
  allow_dream_sharing BOOLEAN DEFAULT true,
  
  -- Preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  timezone TEXT DEFAULT 'UTC',
  
  -- Stats (denormalized for performance)
  total_dreams INTEGER DEFAULT 0,
  total_shared_dreams INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_dream_date DATE
);

CREATE INDEX idx_profiles_username ON profiles(username);

-- MOODS TABLE
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  emoji TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default moods
INSERT INTO moods (name, emoji, color, description) VALUES
  ('Calm', '😌', '#10b981', 'Peaceful and serene'),
  ('Anxious', '😰', '#f59e0b', 'Worried or stressed'),
  ('Inspired', '✨', '#8b5cf6', 'Creative and motivated'),
  ('Curious', '🤔', '#3b82f6', 'Inquisitive and wondering'),
  ('Peaceful', '🕊️', '#06b6d4', 'Tranquil and harmonious'),
  ('Turbulent', '🌊', '#ef4444', 'Chaotic or unsettled');

-- DREAMS TABLE
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dream content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  snippet TEXT,
  
  -- Metadata
  dream_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Sleep data
  hours_slept DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  
  -- AI interpretation
  interpretation TEXT,
  interpretation_generated_at TIMESTAMPTZ,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_hours CHECK (hours_slept IS NULL OR (hours_slept >= 0 AND hours_slept <= 24))
);

CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_dream_date ON dreams(dream_date DESC);
CREATE INDEX idx_dreams_shared ON dreams(is_shared) WHERE is_shared = true;
CREATE INDEX idx_dreams_user_date ON dreams(user_id, dream_date DESC);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);

-- DREAM_MOODS TABLE
CREATE TABLE dream_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, mood_id)
);

CREATE INDEX idx_dream_moods_dream ON dream_moods(dream_id);
CREATE INDEX idx_dream_moods_mood ON dream_moods(mood_id);

-- DREAM_TAGS TABLE
CREATE TABLE dream_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, tag)
);

CREATE INDEX idx_dream_tags_dream ON dream_tags(dream_id);
CREATE INDEX idx_dream_tags_tag ON dream_tags(tag);

-- DREAM_LIKES TABLE
CREATE TABLE dream_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, user_id)
);

CREATE INDEX idx_dream_likes_dream ON dream_likes(dream_id);
CREATE INDEX idx_dream_likes_user ON dream_likes(user_id);

-- DREAM_COMMENTS TABLE
CREATE TABLE dream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  parent_comment_id UUID REFERENCES dream_comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_dream_comments_dream ON dream_comments(dream_id, created_at DESC);
CREATE INDEX idx_dream_comments_user ON dream_comments(user_id);
CREATE INDEX idx_dream_comments_parent ON dream_comments(parent_comment_id);

-- ARTICLES TABLE
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  preview TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  view_count INTEGER DEFAULT 0,
  
  meta_description TEXT,
  meta_keywords TEXT[]
);

CREATE INDEX idx_articles_published ON articles(published, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_slug ON articles(slug);

-- ARTICLE_LIKES TABLE
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_article_likes_article ON article_likes(article_id);
CREATE INDEX idx_article_likes_user ON article_likes(user_id);

-- USER_STREAKS TABLE
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_start_date DATE NOT NULL,
  streak_end_date DATE,
  streak_length INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_active ON user_streaks(user_id, is_active) WHERE is_active = true;

-- =====================================================
-- PART 2: ROW LEVEL SECURITY
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
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can view public profiles" ON profiles FOR SELECT USING (profile_visibility = 'public');
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- MOODS POLICIES
CREATE POLICY "Anyone can view moods" ON moods FOR SELECT TO authenticated, anon USING (true);

-- DREAMS POLICIES
CREATE POLICY "Users can view own dreams" ON dreams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shared dreams" ON dreams FOR SELECT USING (is_shared = true);
CREATE POLICY "Users can insert own dreams" ON dreams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dreams" ON dreams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dreams" ON dreams FOR DELETE USING (auth.uid() = user_id);

-- DREAM_MOODS POLICIES
CREATE POLICY "Users can view own dream moods" ON dream_moods FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_moods.dream_id AND dreams.user_id = auth.uid()));
CREATE POLICY "Anyone can view shared dream moods" ON dream_moods FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_moods.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can insert own dream moods" ON dream_moods FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_moods.dream_id AND dreams.user_id = auth.uid()));
CREATE POLICY "Users can delete own dream moods" ON dream_moods FOR DELETE
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_moods.dream_id AND dreams.user_id = auth.uid()));

-- DREAM_TAGS POLICIES
CREATE POLICY "Users can view own dream tags" ON dream_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_tags.dream_id AND dreams.user_id = auth.uid()));
CREATE POLICY "Anyone can view shared dream tags" ON dream_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_tags.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can insert own dream tags" ON dream_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_tags.dream_id AND dreams.user_id = auth.uid()));
CREATE POLICY "Users can delete own dream tags" ON dream_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_tags.dream_id AND dreams.user_id = auth.uid()));

-- DREAM_LIKES POLICIES
CREATE POLICY "Anyone can view dream likes" ON dream_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_likes.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can like shared dreams" ON dream_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_likes.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can unlike dreams" ON dream_likes FOR DELETE USING (auth.uid() = user_id);

-- DREAM_COMMENTS POLICIES
CREATE POLICY "Anyone can view dream comments" ON dream_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_comments.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can comment on shared dreams" ON dream_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_comments.dream_id AND dreams.is_shared = true));
CREATE POLICY "Users can update own comments" ON dream_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON dream_comments FOR DELETE USING (auth.uid() = user_id);

-- ARTICLES POLICIES
CREATE POLICY "Anyone can view published articles" ON articles FOR SELECT USING (published = true);
CREATE POLICY "Authors can view own articles" ON articles FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create articles" ON articles FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own articles" ON articles FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own articles" ON articles FOR DELETE USING (auth.uid() = author_id);

-- ARTICLE_LIKES POLICIES
CREATE POLICY "Anyone can view article likes" ON article_likes FOR SELECT USING (true);
CREATE POLICY "Users can like articles" ON article_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike articles" ON article_likes FOR DELETE USING (auth.uid() = user_id);

-- USER_STREAKS POLICIES
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PART 3: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON dreams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON dream_comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate dream snippet
CREATE OR REPLACE FUNCTION public.generate_dream_snippet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.snippet IS NULL OR NEW.snippet = '' THEN
    NEW.snippet := LEFT(NEW.content, 140);
    IF LENGTH(NEW.content) > 140 THEN
      NEW.snippet := NEW.snippet || '...';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dream_snippet BEFORE INSERT OR UPDATE ON dreams FOR EACH ROW EXECUTE FUNCTION public.generate_dream_snippet();

-- Update profile stats on dream insert
CREATE OR REPLACE FUNCTION public.update_profile_stats_on_dream_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    total_dreams = total_dreams + 1,
    last_dream_date = NEW.dream_date
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_dream_insert AFTER INSERT ON dreams FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats_on_dream_insert();

-- Update profile stats on dream delete
CREATE OR REPLACE FUNCTION public.update_profile_stats_on_dream_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    total_dreams = GREATEST(total_dreams - 1, 0),
    total_shared_dreams = CASE 
      WHEN OLD.is_shared THEN GREATEST(total_shared_dreams - 1, 0)
      ELSE total_shared_dreams
    END
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_dream_delete AFTER DELETE ON dreams FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats_on_dream_delete();

-- Update shared dream count
CREATE OR REPLACE FUNCTION public.update_shared_dream_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_shared != OLD.is_shared THEN
    UPDATE profiles
    SET total_shared_dreams = total_shared_dreams + CASE 
      WHEN NEW.is_shared THEN 1 
      ELSE -1 
    END
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shared_count AFTER UPDATE ON dreams FOR EACH ROW EXECUTE FUNCTION public.update_shared_dream_count();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready to use.
-- Next steps:
-- 1. Test user registration at /auth/login
-- 2. Create a test dream entry
-- 3. Verify data in the Table Editor
-- =====================================================
