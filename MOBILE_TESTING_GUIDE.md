# How to Test Google Sign-In on Mobile

Google's security policies block private IP addresses (like `192.168.x.x`) for OAuth. To test Google Sign-In on your mobile device, you need a public URL.

## Option 1: The Easy Way (Email/Password)
For simple testing on mobile, just use the **Email/Password** signup method. It works instantly without any configuration!

## Option 2: The Pro Way (Ngrok Tunnel)
If you specifically need to test Google Sign-In, use **Ngrok** to create a secure, public tunnel to your local PC.

### 1. Install & Run Ngrok
1. Download Ngrok from [ngrok.com](https://ngrok.com/download)
2. Open a new terminal and run:
   ```bash
   ngrok http 3000
   ```
   *This will give you a URL like `https://a1b2-c3d4.ngrok-free.app`*

### 2. Configure Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Open your project's **Credentials**
3. Add your Ngrok URL to specific lists:
   - **Authorized JavaScript Origins**: `https://a1b2-c3d4.ngrok-free.app`
   - **Authorized Redirect URIs**: `https://a1b2-c3d4.ngrok-free.app/api/auth/callback/google`

### 3. Update Local Config
Update your `.env.local` file with the new URL:

```env
NEXT_PUBLIC_APP_URL="https://a1b2-c3d4.ngrok-free.app"
NEXTAUTH_URL="https://a1b2-c3d4.ngrok-free.app"
```

### 4. Restart Server
Restart your Next.js server (`npm run dev`) and open the Ngrok URL on your phone!
