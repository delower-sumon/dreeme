import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/providers/ThemeProvider'

// ─── Phase 3-A: next/font (replaces CDN loading) ─────────────────────────────
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Dreeme — Your Personal Dream Journal',
  description: 'Record, interpret, and explore your dreams with AI-powered insights.',
  icons: { icon: '/logo.svg' },
}

// ─── Root Layout (Server Component) ──────────────────────────────────────────
// This is intentionally a Server Component — no 'use client' directive.
// All client-side state (theme, auth, query cache) lives in ThemeProvider.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <head>
        {/* Phase 1-B: Inline script — sets theme class BEFORE hydration, eliminates flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||((window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="dream-gradient-bg min-h-screen text-black dark:text-slate-50 transition-colors duration-500"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
