# DreemeSpace - Setup Instructions

## Google OAuth Setup

To enable Google Sign-In, you need to configure Google OAuth in your Supabase project:

### 1. Configure Google OAuth in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and enable it
5. You'll need to create a Google OAuth application:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Set the application type to **Web application**
   - Add authorized redirect URIs:
     - `https://jollosbyfwdrdqvaqqrm.supabase.co/auth/v1/callback` (your Supabase project URL)
     - `http://localhost:3000/auth/callback` (for local development)
   - Copy the **Client ID** and **Client Secret**
6. Back in Supabase, paste the Client ID and Client Secret
7. Save the configuration

### 2. Database Setup for Avatars

You need to create a storage bucket for user avatars:

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket called `avatars`
3. Set the bucket to **Public** (so avatars can be displayed)
4. Add a policy to allow authenticated users to upload:
   ```sql
   -- Allow authenticated users to upload their own avatars
   CREATE POLICY "Users can upload their own avatar"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Allow public read access
   CREATE POLICY "Avatar images are publicly accessible"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

### 3. Update Profile Table

Make sure your `profiles` table has an `avatar_url` column:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Logo Replacement

To replace the placeholder logo with your actual logo:

### Option 1: Using an Image File

1. Place your logo image in the `public` folder (e.g., `public/logo.png`)
2. Open `src/components/Logo.tsx`
3. Uncomment the `<img>` tag section (lines 27-32)
4. Comment out or remove the placeholder `<div>` (lines 24-26)
5. Update the `src` path to match your logo file name

Example:
```tsx
// Replace this:
<div className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-violet-400 via-sky-300 to-emerald-300 shadow-lg shadow-violet-500/40 flex items-center justify-center text-slate-950 font-bold`}>
    dr
</div>

// With this:
<img 
    src="/logo.png" 
    alt="dreeme Logo" 
    className={sizes[size]}
/>
```

### Option 2: Using an SVG Component

1. Create a new file `src/components/LogoIcon.tsx`
2. Export your SVG as a React component
3. Import and use it in `Logo.tsx`

## Features Implemented

✅ **Google Sign-In**: Users can sign up/sign in with their Google account
✅ **Email/Password Auth**: Traditional email/password authentication (no email verification required)
✅ **Profile Pictures**: 
   - Automatically fetches Google profile picture for Google users
   - Users can upload custom profile pictures
   - Profile settings page at `/profile`
✅ **Improved Sign In Button**: Better visibility with gradient background
✅ **Reusable Logo Component**: Easy to replace across the entire app

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`

3. Try signing in with:
   - Google OAuth (click "Sign in with Google")
   - Email/Password (use the form)

4. After signing in, check:
   - Your profile picture appears in the header
   - Click on your avatar to access the profile menu
   - Visit `/profile` to update your profile picture

## Next Steps

1. **Add your logo**: Follow the "Logo Replacement" instructions above
2. **Configure Google OAuth**: Follow the "Google OAuth Setup" instructions
3. **Test the authentication flow**: Make sure Google sign-in works properly
4. **Customize profile settings**: Add more fields to the profile page if needed
