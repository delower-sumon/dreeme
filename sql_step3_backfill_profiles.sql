-- STEP 3: Backfill profiles for existing users (OPTIONAL)
-- This creates profiles for users who signed up before the trigger was added
-- Run this AFTER Step 1 and Step 2
INSERT INTO public.profiles (id, full_name, username, avatar_url, updated_at)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    'User'
  ) as full_name,
  COALESCE(
    u.raw_user_meta_data->>'username',
    split_part(u.email, '@', 1),
    'user_' || substring(u.id::text, 1, 8)
  ) as username,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  now() as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
