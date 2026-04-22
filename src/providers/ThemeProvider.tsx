'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─── Theme Context ────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

// ─── Theme Provider ───────────────────────────────────────────────────────────

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read from DOM — the inline script already set the class before React loads,
  // so we read from documentElement to initialise state without flash.
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = saved || (prefersDark ? 'dark' : 'light')
    setTheme(resolved)
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    // Update DOM directly — fast, no React cycle needed
    document.documentElement.dataset.theme = next
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(next)
    localStorage.setItem('theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <SessionProvider>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header theme={theme} onToggleTheme={toggleTheme} />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryProvider>
      </SessionProvider>
    </ThemeContext.Provider>
  )
}
