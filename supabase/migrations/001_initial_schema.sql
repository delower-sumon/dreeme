-- Migration: Initial Schema
-- Description: Create all tables for Dream Journal application
-- Created: 2025-11-19

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
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

-- Create index on username for lookups
CREATE INDEX idx_profiles_username ON profiles(username);

-- =====================================================
-- MOODS TABLE
-- =====================================================
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

-- =====================================================
-- DREAMS TABLE
-- =====================================================
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

-- Create indexes for performance
CREATE INDEX idx_dreams_user_id ON dreams(user_id);
CREATE INDEX idx_dreams_dream_date ON dreams(dream_date DESC);
CREATE INDEX idx_dreams_shared ON dreams(is_shared) WHERE is_shared = true;
CREATE INDEX idx_dreams_user_date ON dreams(user_id, dream_date DESC);
CREATE INDEX idx_dreams_created_at ON dreams(created_at DESC);

-- =====================================================
-- DREAM_MOODS TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE dream_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  mood_id UUID NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, mood_id)
);

CREATE INDEX idx_dream_moods_dream ON dream_moods(dream_id);
CREATE INDEX idx_dream_moods_mood ON dream_moods(mood_id);

-- =====================================================
-- DREAM_TAGS TABLE
-- =====================================================
CREATE TABLE dream_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, tag)
);

CREATE INDEX idx_dream_tags_dream ON dream_tags(dream_id);
CREATE INDEX idx_dream_tags_tag ON dream_tags(tag);

-- =====================================================
-- DREAM_LIKES TABLE
-- =====================================================
CREATE TABLE dream_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dream_id, user_id)
);

CREATE INDEX idx_dream_likes_dream ON dream_likes(dream_id);
CREATE INDEX idx_dream_likes_user ON dream_likes(user_id);

-- =====================================================
-- DREAM_COMMENTS TABLE
-- =====================================================
CREATE TABLE dream_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Nested comments support
  parent_comment_id UUID REFERENCES dream_comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_dream_comments_dream ON dream_comments(dream_id, created_at DESC);
CREATE INDEX idx_dream_comments_user ON dream_comments(user_id);
CREATE INDEX idx_dream_comments_parent ON dream_comments(parent_comment_id);

-- =====================================================
-- ARTICLES TABLE
-- =====================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  preview TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Metadata
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[]
);

CREATE INDEX idx_articles_published ON articles(published, published_at DESC);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_slug ON articles(slug);

-- =====================================================
-- ARTICLE_LIKES TABLE
-- =====================================================
CREATE TABLE article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(article_id, user_id)
);

CREATE INDEX idx_article_likes_article ON article_likes(article_id);
CREATE INDEX idx_article_likes_user ON article_likes(user_id);

-- =====================================================
-- USER_STREAKS TABLE (for tracking dream journaling streaks)
-- =====================================================
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
