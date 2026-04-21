-- Migration: Database Functions and Triggers
-- Description: Create helper functions, triggers, and analytics
-- Created: 2025-11-19

-- =====================================================
-- FUNCTION: Auto-create profile on user signup
-- =====================================================
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

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON dream_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCTION: Auto-generate dream snippet
-- =====================================================
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

CREATE TRIGGER set_dream_snippet
  BEFORE INSERT OR UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION public.generate_dream_snippet();

-- =====================================================
-- FUNCTION: Update profile stats on dream insert
-- =====================================================
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

CREATE TRIGGER update_stats_on_dream_insert
  AFTER INSERT ON dreams
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats_on_dream_insert();

-- =====================================================
-- FUNCTION: Update profile stats on dream delete
-- =====================================================
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

CREATE TRIGGER update_stats_on_dream_delete
  AFTER DELETE ON dreams
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats_on_dream_delete();

-- =====================================================
-- FUNCTION: Update shared dream count
-- =====================================================
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

CREATE TRIGGER update_shared_count
  AFTER UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION public.update_shared_dream_count();

-- =====================================================
-- FUNCTION: Calculate user streak
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from today and go backwards
  v_check_date := v_current_date;
  
  LOOP
    -- Check if user has a dream on this date
    IF EXISTS (
      SELECT 1 FROM dreams 
      WHERE user_id = p_user_id 
      AND dream_date = v_check_date
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      -- If we're checking today and no dream, streak is 0
      -- Otherwise, we've found the end of the streak
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get dream statistics for user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_dream_stats(p_user_id UUID)
RETURNS TABLE (
  total_dreams BIGINT,
  total_shared BIGINT,
  avg_sleep_hours NUMERIC,
  most_common_mood TEXT,
  dreams_this_week BIGINT,
  dreams_this_month BIGINT,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(d.id) as total_dreams,
    COUNT(d.id) FILTER (WHERE d.is_shared = true) as total_shared,
    ROUND(AVG(d.hours_slept), 1) as avg_sleep_hours,
    (
      SELECT m.name
      FROM dream_moods dm
      JOIN moods m ON m.id = dm.mood_id
      JOIN dreams d2 ON d2.id = dm.dream_id
      WHERE d2.user_id = p_user_id
      GROUP BY m.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_common_mood,
    COUNT(d.id) FILTER (WHERE d.dream_date >= CURRENT_DATE - INTERVAL '7 days') as dreams_this_week,
    COUNT(d.id) FILTER (WHERE d.dream_date >= CURRENT_DATE - INTERVAL '30 days') as dreams_this_month,
    public.calculate_user_streak(p_user_id) as current_streak
  FROM dreams d
  WHERE d.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get mood distribution for user
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_mood_distribution(p_user_id UUID)
RETURNS TABLE (
  mood_name TEXT,
  mood_emoji TEXT,
  mood_color TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.name,
    m.emoji,
    m.color,
    COUNT(dm.id) as count
  FROM moods m
  LEFT JOIN dream_moods dm ON dm.mood_id = m.id
  LEFT JOIN dreams d ON d.id = dm.dream_id AND d.user_id = p_user_id
  WHERE dm.id IS NOT NULL
  GROUP BY m.id, m.name, m.emoji, m.color
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get weekly dream frequency
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_weekly_dream_frequency(p_user_id UUID)
RETURNS TABLE (
  day_of_week INTEGER,
  day_name TEXT,
  dream_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT 
      generate_series(0, 6) as dow,
      ARRAY['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as day_names
  )
  SELECT 
    d.dow,
    d.day_names[d.dow + 1] as day_name,
    COALESCE(COUNT(dr.id), 0) as dream_count
  FROM days d
  LEFT JOIN dreams dr ON 
    EXTRACT(DOW FROM dr.dream_date) = d.dow
    AND dr.user_id = p_user_id
    AND dr.dream_date >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY d.dow, d.day_names[d.dow + 1]
  ORDER BY d.dow;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get sleep vs dreams correlation
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_sleep_vs_dreams(p_user_id UUID)
RETURNS TABLE (
  hours_bucket INTEGER,
  dream_count BIGINT,
  avg_sleep NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    FLOOR(hours_slept)::INTEGER as hours_bucket,
    COUNT(*) as dream_count,
    ROUND(AVG(hours_slept), 1) as avg_sleep
  FROM dreams
  WHERE user_id = p_user_id
    AND hours_slept IS NOT NULL
  GROUP BY FLOOR(hours_slept)
  ORDER BY hours_bucket;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get dream like count
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_dream_like_count(p_dream_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dream_likes
  WHERE dream_id = p_dream_id;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get dream comment count
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_dream_comment_count(p_dream_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dream_comments
  WHERE dream_id = p_dream_id;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check if user liked dream
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_liked_dream(p_dream_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dream_likes
    WHERE dream_id = p_dream_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;
