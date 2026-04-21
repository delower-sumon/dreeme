-- Fix Analytics Functions to accept TEXT user_ids
-- This resolves the "invalid input syntax for type uuid" error when using Google IDs (which are numeric strings)

-- =====================================================
-- FUNCTION: Calculate user streak (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.calculate_user_streak(UUID);
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id TEXT)
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
      -- If we're checking today and no dream, streak is 0, unless user hasn't journaled yet today
      -- But simpler logic: if today missing, check yesterday. If yesterday missing, streak is 0.
      -- For now, strict streak: must have dream today or previous days.
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get dream statistics for user (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_dream_stats(UUID);
CREATE OR REPLACE FUNCTION public.get_user_dream_stats(p_user_id TEXT)
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
-- FUNCTION: Get mood distribution for user (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_user_mood_distribution(UUID);
CREATE OR REPLACE FUNCTION public.get_user_mood_distribution(p_user_id TEXT)
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
-- FUNCTION: Get weekly dream frequency (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_weekly_dream_frequency(UUID);
CREATE OR REPLACE FUNCTION public.get_weekly_dream_frequency(p_user_id TEXT)
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
-- FUNCTION: Get sleep vs dreams correlation (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.get_sleep_vs_dreams(UUID);
CREATE OR REPLACE FUNCTION public.get_sleep_vs_dreams(p_user_id TEXT)
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
-- FUNCTION: Check if user liked dream (Updated for TEXT ID)
-- =====================================================
DROP FUNCTION IF EXISTS public.user_liked_dream(UUID, UUID);
CREATE OR REPLACE FUNCTION public.user_liked_dream(p_dream_id UUID, p_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dream_likes
    WHERE dream_id = p_dream_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;
