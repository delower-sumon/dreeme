-- Add password column to users table for Credentials authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password text;
