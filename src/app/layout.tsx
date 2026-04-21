'use client'

import React, { useState, useEffect } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initial = saved || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const applyTheme = (t: 'light' | 'dark') => {
    const html = document.documentElement
    html.dataset.theme = t
    if (t === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', t)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return (
      <html lang="en">
        <head>
          <title>dreeme</title>
          <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        </head>
        <body className="dream-gradient-bg min-h-screen text-black dark:text-slate-50">
          <div className="min-h-screen flex flex-col" />
        </body>
      </html>
    )
  }

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <title>dreeme</title>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`dream-gradient-bg min-h-screen text-black dark:text-slate-50 transition-colors duration-500 ${theme === 'dark' ? 'dark' : 'light'}`}>
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
      </body>
    </html>
  )
}

