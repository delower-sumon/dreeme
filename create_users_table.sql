-- Create users table for NextAuth
CREATE TABLE IF NOT EXISTS "users" (
  id text PRIMARY KEY,
  name text,
  email text UNIQUE,
  "emailVerified" timestamp,
  image text,
  created_at timestamp DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access (for NextAuth server-side operations)
CREATE POLICY "Service role has full access" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all user data (for displaying profiles, etc.)
CREATE POLICY "Authenticated users can read all users" ON users
  FOR SELECT
  TO authenticated
  USING (true);
