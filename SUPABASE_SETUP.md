# Supabase Database Setup Guide

This guide will help you push the database schema to your Supabase project.

## Prerequisites

- Supabase account
- Supabase project created
- Database credentials from `supabase.txt`

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://jollosbyfwdrdqvaqqrm.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the contents of each migration file in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Second: `supabase/migrations/002_rls_policies.sql`
   - Third: `supabase/migrations/003_functions.sql`
5. Click **Run** for each migration

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref jollosbyfwdrdqvaqqrm

# Push migrations
supabase db push
```

## Option 3: Manual SQL Execution

You can also connect to your database using any PostgreSQL client with these credentials:

- Host: `db.jollosbyfwdrdqvaqqrm.supabase.co`
- Database: `postgres`
- Port: `5432`
- User: `postgres`
- Password: `62LYmcgkS146OzNN`

Then execute each migration file in order.

## Verification

After running the migrations, verify that the tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - profiles
   - moods
   - dreams
   - dream_moods
   - dream_tags
   - dream_likes
   - dream_comments
   - articles
   - article_likes
   - user_streaks

3. Check that RLS is enabled on all tables
4. Verify that the default moods were inserted into the `moods` table

## Next Steps

After the database is set up:
1. Test user registration
2. Create a test dream entry
3. Verify data appears in the database
