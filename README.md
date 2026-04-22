# 🌙 Dreeme — Your Personal Dream Journal

Dreeme is a premium, AI-powered dream journaling application designed to help you capture, interpret, and explore the hidden depths of your subconscious.

![Dreeme Preview](public/logo.svg)

## ✨ Core Features

### 📝 Intelligent Journaling
- **Rich Input**: Capture your dreams with ease using text or voice recording.
- **Mood Tracking**: Tag your dreams with emotional context (Calm, Anxious, Inspired, etc.).
- **Metadata**: Log sleep duration, quality, and specific dream dates.

### 🔮 AI Interpretation (Groq-Powered)
- **Instant Insights**: Get empathetic and analytical interpretations of your dreams in seconds.
- **Symbol Analysis**: Identify recurring themes and symbols in your subconscious.
- **Oracle Experience**: A premium, "Consulting the Oracle" UI with smooth animations.

### 🌌 DreamSpace (Community)
- **Shared Wisdom**: Discover and like dreams shared by the community.
- **Sleep Science**: Read curated articles about dream theory, lucid dreaming, and sleep hygiene.

### 📊 Dream Tracker
- **Visual Analytics**: Interactive charts showing your dream frequency and mood distribution.
- **Patterns**: Correlate sleep hours with dream recall and emotional state.

### 🌓 Premium Aesthetics
- **Zero-Flash Theme**: Seamless switching between light and dark modes.
- **Modern UI**: Built with Framer Motion, Tailwind CSS, and glassmorphism.
- **Optimized Performance**: Server-side rendering and smart caching for an "instant" feel.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/) & [NextAuth.js](https://next-auth.js.org/)
- **AI Engine**: [Groq](https://groq.com/) (Llama 3.3 70B)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **Deployment**: Optimized for Vercel

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+
- A Supabase Project (PostgreSQL)
- A Groq API Key

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google Auth (Optional for Social Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase (Secret)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_api_key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## 📂 Project Structure

- `src/app/`: Next.js App Router (Pages & API routes)
- `src/components/`: Shared UI components
- `src/lib/services/`: Core logic (AI, database access)
- `src/lib/prompts/`: AI system prompts and instructions
- `src/providers/`: Context providers (Auth, Theme, Query)
- `supabase/migrations/`: SQL database schema and RPC functions

---

## 🛡️ Security & Performance
- **Deterministic IDs**: Bridging NextAuth Google IDs to Supabase UUIDs for consistency.
- **Server Components**: Minimized client-side JS for faster initial loads.
- **RPC Functions**: Database logic pushed to the server for maximum efficiency.

---

**Happy dreaming! 🌙✨**
