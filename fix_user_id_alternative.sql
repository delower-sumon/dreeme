-- Alternative approach: Create new columns instead of altering existing ones
-- This avoids the policy dependency issue

-- STEP 1: Add new text columns
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS user_id_new text;
ALTER TABLE dream_likes ADD COLUMN IF NOT EXISTS user_id_new text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_new text;

-- STEP 2: Copy existing data (convert UUID to text)
UPDATE dreams SET user_id_new = user_id::text WHERE user_id_new IS NULL;
UPDATE dream_likes SET user_id_new = user_id::text WHERE user_id_new IS NULL;
UPDATE profiles SET id_new = id::text WHERE id_new IS NULL;

-- STEP 3: Drop old columns (this will also drop the policies using CASCADE)
ALTER TABLE dreams DROP COLUMN user_id CASCADE;
ALTER TABLE dream_likes DROP COLUMN user_id CASCADE;
ALTER TABLE profiles DROP COLUMN id CASCADE;

-- STEP 4: Rename new columns to original names
ALTER TABLE dreams RENAME COLUMN user_id_new TO user_id;
ALTER TABLE dream_likes RENAME COLUMN user_id_new TO user_id;
ALTER TABLE profiles RENAME COLUMN id_new TO id;

-- STEP 5: Set NOT NULL constraints where needed
ALTER TABLE dreams ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE dream_likes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN id SET NOT NULL;

-- STEP 6: Add primary key back to profiles
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- STEP 7: Create simple RLS policies
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
