-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Set initial admin (optional, can be done manually in Supabase dashboard)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
