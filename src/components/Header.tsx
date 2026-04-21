'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import Logo from '@/components/Logo'

interface HeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  const links = [
    { id: 'home', label: 'Home', href: '/', protected: false },
    { id: 'journal', label: 'Journal', href: '/journal', protected: true },
    { id: 'dreamspace', label: 'DreamSpace', href: '/dreamspace', protected: true },
    { id: 'tracker', label: 'Tracker', href: '/tracker', protected: true },
    { id: 'pricing', label: 'Pricing', href: '/pricing', protected: false },
    { id: 'about', label: 'About', href: '/about', protected: false },
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  const getUserInitials = () => {
    if (!user) return 'ID'
    if (profile?.full_name) {
      const names = profile.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase()
    }
    const email = user.email || ''
    return email.substring(0, 2).toUpperCase()
  }

  const getAvatarUrl = () => {
    // First check if user has custom avatar
    if (profile?.avatar_url) {
      return profile.avatar_url
    }
    // Then check for Google profile picture
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    return null
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const avatarUrl = getAvatarUrl()

  // Prevent hydration mismatch by not rendering user-specific content until mounted
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/10 dark:bg-slate-950/10 border-b border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="md" showText={true} />
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/10 dark:bg-slate-950/10 border-b border-slate-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size="md" showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-1.5 text-xs">
            {links.map(link => (
              <Link
                key={link.id}
                href={link.href}
                className="nav-link relative text-sm px-3 py-1.5 rounded-full transition-colors duration-200 text-slate-200/80 hover:text-white hover:bg-slate-800/20"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle */}
          <label className="theme-switch" style={{ transform: 'scale(0.70)' }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={onToggleTheme}
              aria-label="Toggle theme"
            />
            <div className="theme-slider">
              <div className="theme-sun-moon">
                <svg id="theme-moon-dot-1" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-moon-dot-2" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-moon-dot-3" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-1" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-2" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-3" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-1" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-2" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-3" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-4" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-5" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-6" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
              </div>
              <div className="theme-stars">
                <svg id="theme-star-1" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-2" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-3" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-4" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
              </div>
            </div>
          </label>

          {/* User Button */}
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="ml-1 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-800 dark:text-white shadow-md hover:shadow-lg transition-all hover:scale-105 overflow-hidden"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900/95 border border-slate-700/60 shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-slate-700/60">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm text-slate-200 truncate">
                          {profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/50 transition-colors flex items-center gap-2"
                      >
                        <UserIcon size={16} />
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/50 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-1 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <label className="theme-switch" style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={onToggleTheme}
              aria-label="Toggle theme"
            />
            <div className="theme-slider">
              <div className="theme-sun-moon">
                <svg id="theme-moon-dot-1-mobile" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-moon-dot-2-mobile" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-moon-dot-3-mobile" className="theme-moon-dot" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-1-mobile" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-2-mobile" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-light-ray-3-mobile" className="theme-light-ray" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-1-mobile" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-2-mobile" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-3-mobile" className="theme-cloud-dark" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-4-mobile" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-5-mobile" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
                <svg id="theme-cloud-6-mobile" className="theme-cloud-light" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="50"></circle>
                </svg>
              </div>
              <div className="theme-stars">
                <svg id="theme-star-1-mobile" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-2-mobile" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-3-mobile" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
                <svg id="theme-star-4-mobile" className="theme-star" viewBox="0 0 20 20">
                  <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z"></path>
                </svg>
              </div>
            </div>
          </label>
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="w-8 h-8 rounded-full border border-violet-300 dark:border-slate-600/70 flex items-center justify-center text-violet-600 dark:text-slate-200 hover:border-violet-400 hover:text-violet-500 dark:hover:text-violet-200 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          {!loading && user && (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 overflow-hidden"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getUserInitials()
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden relative border-t border-slate-800/40 backdrop-blur-xl ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Background blur orbs matching hero section */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-violet-500/25 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-sky-400/25 blur-3xl rounded-full"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-4 space-y-1">
          {links.map((link, index) => (
            <Link
              key={link.id}
              href={link.href}
              className="block w-full py-3 px-4 text-base font-medium text-gray-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* User Actions */}
          {!loading && user && (
            <>
              <Link
                href="/profile"
                className="block w-auto mx-auto py-2 px-6 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
                className="block w-auto mx-auto py-2 px-6 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </>
          )}

          {!loading && !user && (
            <Link
              href="/auth/login"
              className="block w-24 mx-auto py-1.5 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile User Menu */}
      {!loading && user && userMenuOpen && (
        <div className="md:hidden border-t border-slate-800/70 bg-slate-900/90">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <p className="text-xs text-slate-400 mb-1">Signed in as</p>
            <p className="text-sm text-slate-200 mb-3">{profile?.full_name || user.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/50 text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
