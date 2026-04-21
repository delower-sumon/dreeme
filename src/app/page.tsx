'use client'

import Link from 'next/link'
import { Heart, Brain, Moon, Sparkles, TrendingUp, Share2, Lock, Zap } from 'lucide-react'
import { usePrefetchData } from '@/hooks/usePrefetchData'

export default function HomePage() {
  // Prefetch data for Journal, Tracker, and DreamSpace pages in the background
  usePrefetchData()
  const features = [
    { icon: Moon, title: 'Dream Journal', desc: 'Capture dreams the moment you wake' },
    { icon: Brain, title: 'AI Interpretation', desc: 'Angelic AI explains your dreams' },
    { icon: TrendingUp, title: 'Track Patterns', desc: 'Visualize trends over time' },
    { icon: Share2, title: 'Share Dreams', desc: 'Share with the community' },
    { icon: Lock, title: 'Private & Secure', desc: 'Your dreams stay encrypted' },
    { icon: Zap, title: 'Instant Insights', desc: 'Get interpretations instantly' },
  ]

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-10 sm:pb-10 flex flex-col lg:flex-row items-center gap-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-violet-500/25 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-sky-400/25 blur-3xl rounded-full"></div>
        </div>

        {/* Left Content */}
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/60 bg-slate-900/10 dark:bg-slate-900/40 px-2.5 py-1 text-[11px] text-violet-50 shadow-sm shadow-violet-500/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            <span className="hero-badge-text">Nightly reflections <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse align-middle mx-1" aria-hidden="true"></span> Gentle AI interpretations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Unlock the Wisdom of Your <span className="hero-title-dreams">Dreams</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl">
            Capture your dreams the moment you wake, and let an angelic, human-centered AI help you uncover
            the symbols, emotions, and gentle guidance hidden in every night story.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/journal" className="glow-button gradient-glow-btn px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2">
              <span>Start Dream Journal</span>
              <span className="text-xs">↗</span>
              <span className="gradient-container">
                <span className="gradient"></span>
              </span>
            </Link>
            <Link href="/dreamspace" className="glow-button gradient-glow-btn px-5 py-2.5 text-sm font-medium bg-transparent text-slate-100 inline-flex items-center gap-2">
              <span>DreamSpace</span>
              <span className="text-xs">✦</span>
              <span className="gradient-container">
                <span className="gradient"></span>
              </span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-fuchsia-400 to-sky-300 border border-slate-900"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-300 border border-slate-900"></div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-400 border border-slate-900 flex items-center justify-center text-[9px] text-slate-950 font-semibold">+9k</div>
            </div>
            <span>Dreamers already journaling with dreeme.</span>
          </div>
        </div>

        {/* Right Card */}
        <div className="relative z-10 flex-1 max-w-md w-full">
          <div className="dream-border-glow">
            <div className="dream-border-inner p-4 sm:p-5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="text-slate-800 dark:text-slate-200 font-medium">Tonight's reflection</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
                  AI Oracle ready
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 p-3 mb-3">
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  &ldquo;I was walking through a city floating among the clouds, every step lighting up the path beneath my feet...&rdquo;
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 dark:bg-slate-900/70 border border-violet-200 dark:border-violet-500/60 p-3 flex flex-col gap-1">
                <div className="text-[11px] text-violet-700 dark:text-violet-200 flex items-center gap-2 mb-1 font-medium">
                  <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-sky-400 rounded-full"></span>
                  <span>Angelic AI Interpretation</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-200">
                  Floating above the world hints at gaining perspective. The glowing path suggests you're ready to trust a gentler, more luminous direction in waking life.
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
                <span>Encrypted, private by default</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                  Send to DreamSpace
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-3">
            Everything you need to understand your dreams
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A complete platform for dream journaling, AI interpretation, tracking patterns, and sharing with a supportive community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="feature-card group p-6">
                <div className="feature-bg" aria-hidden></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-200/20 to-sky-200/12 flex items-center justify-center mb-4 group-hover:from-violet-300/40 group-hover:to-sky-300/40 transition-colors">
                    <Icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm transition-colors">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="cta-card max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 overflow-hidden">
          <div className="cta-bg" aria-hidden></div>
          <div className="relative z-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Ready to explore your dreams?</h2>
            <p className="text-sm mb-6 max-w-xl mx-auto">Start journaling your dreams today and discover the wisdom hidden in your subconscious.</p>
            <Link href="/journal" className="glow-button gradient-glow-btn px-6 py-3 text-sm font-medium inline-flex items-center gap-2">
              <span>Start Journaling Now</span>
              <span className="text-xs">→</span>
              <span className="gradient-container">
                <span className="gradient"></span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
