-- Fix user_id type mismatch in all tables
-- This changes user_id from UUID to TEXT to match NextAuth's Google user IDs

-- STEP 1: Drop ALL existing policies on affected tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename IN ('dreams', 'dream_likes', 'dream_moods', 'dream_tags', 'profiles')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- STEP 2: Disable RLS on all tables temporarily
ALTER TABLE dreams DISABLE ROW LEVEL SECURITY;
ALTER TABLE dream_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE dream_moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE dream_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop foreign key constraints
ALTER TABLE dreams DROP CONSTRAINT IF EXISTS dreams_user_id_fkey;
ALTER TABLE dream_likes DROP CONSTRAINT IF EXISTS dream_likes_user_id_fkey;

-- STEP 3: Change user_id column types
ALTER TABLE dreams ALTER COLUMN user_id TYPE text;
ALTER TABLE dream_likes ALTER COLUMN user_id TYPE text;
ALTER TABLE profiles ALTER COLUMN id TYPE text;

-- STEP 4: Re-enable RLS
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create simple policies (allow all for authenticated users)
-- We validate permissions in the application layer with NextAuth

-- Dreams policies
CREATE POLICY "Allow all for authenticated users" ON dreams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Dream likes policies
CREATE POLICY "Allow all for authenticated users" ON dream_likes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Dream moods policies
CREATE POLICY "Allow all for authenticated users" ON dream_moods
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Dream tags policies
CREATE POLICY "Allow all for authenticated users" ON dream_tags
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Allow all for authenticated users" ON profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
