'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { getUserDreamStats, getUserMoodDistribution, getWeeklyDreamFrequency, getSleepVsDreams } from '@/lib/services/analytics'

export default function TrackerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalDreams: 0,
    avgSleep: 0,
    dreamsThisWeek: 0,
    currentStreak: 0,
  })

  const [weeklyFrequency, setWeeklyFrequency] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [moodDistribution, setMoodDistribution] = useState<Array<{ mood: string; count: number; emoji: string }>>([])
  const [sleepVsDreams, setSleepVsDreams] = useState<Array<{ hours: number; dreams: number }>>([])

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load analytics data
  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      const [statsData, moodData, weeklyData, sleepData] = await Promise.all([
        getUserDreamStats(),
        getUserMoodDistribution(),
        getWeeklyDreamFrequency(),
        getSleepVsDreams()
      ])

      if (statsData) {
        setStats({
          totalDreams: statsData.total_dreams || 0,
          avgSleep: statsData.avg_sleep_hours || 0,
          dreamsThisWeek: statsData.dreams_this_week || 0,
          currentStreak: statsData.current_streak || 0,
        })
      }

      // Process mood distribution
      const moods = moodData.map(m => ({
        mood: m.mood_name,
        emoji: m.mood_emoji,
        count: Number(m.count)
      }))
      setMoodDistribution(moods)

      // Process weekly frequency (convert to Mon-Sun order)
      const weeklyArray = new Array(7).fill(0)
      weeklyData.forEach(day => {
        // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
        const index = day.day_of_week === 0 ? 6 : day.day_of_week - 1
        weeklyArray[index] = Number(day.dream_count)
      })
      setWeeklyFrequency(weeklyArray)

      // Process sleep vs dreams
      const sleepArray = sleepData.map(s => ({
        hours: s.hours_bucket,
        dreams: Number(s.dream_count)
      }))
      setSleepVsDreams(sleepArray)

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const maxFreq = Math.max(...weeklyFrequency, 1)
  const maxMood = Math.max(...moodDistribution.map(m => m.count), 1)

  return (
    <div className="min-h-full pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2">Dream Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400">Visualize patterns and trends in your dreams over time</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Total Dreams</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.totalDreams}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <BarChart3 className="text-violet-600 dark:text-violet-400" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Avg. Sleep</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats.avgSleep.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <Moon className="text-sky-600 dark:text-sky-400" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">This Week</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.dreamsThisWeek} new</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Frequency Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Dreams This Week</h2>
            <div className="flex items-end justify-around h-48 gap-2">
              {weeklyFrequency.map((freq, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${(freq / maxFreq) * 180}px`, minHeight: freq > 0 ? '4px' : '0px' }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white bg-slate-900/90 dark:bg-slate-900/80 px-2 py-1 rounded whitespace-nowrap">
                      {freq} dreams
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">{daysLabels[idx]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Mood Distribution</h2>
            <div className="space-y-4">
              {moodDistribution.length > 0 ? (
                moodDistribution.map(({ mood, count, emoji }) => (
                  <div key={mood}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{emoji} {mood}</p>
                      <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{count}</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800/60 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-400 rounded-full transition-all"
                        style={{ width: `${(count / maxMood) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">No mood data yet. Start journaling to see your mood patterns!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sleep Duration vs Dream Count */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Sleep Duration vs Dream Count</h2>
          {sleepVsDreams.length > 0 ? (
            <div className="flex items-end justify-around h-48 gap-3">
              {sleepVsDreams.map(({ hours, dreams }) => (
                <div key={hours} className="flex flex-col items-center flex-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 dark:from-sky-500 dark:to-cyan-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                    style={{ height: `${(dreams / Math.max(...sleepVsDreams.map(s => s.dreams))) * 180}px`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-white bg-slate-900/90 dark:bg-slate-900/80 px-2 py-1 rounded">
                      {dreams} dreams
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">{hours}h sleep</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">No sleep data yet. Add sleep hours to your dreams to see correlations!</p>
          )}
        </div>

        {/* Blog Articles */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6">Sleep & Dream Science</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'REM Sleep & Dreams', desc: 'Understanding the connection between REM sleep and vivid dreams' },
              { title: 'Sleep Cycles Explained', desc: 'How sleep cycles affect dream patterns and memory formation' },
              { title: 'Dreams & Healing', desc: 'The role of dreams in emotional processing and mental health' },
              { title: 'Lucid Dreaming Basics', desc: 'Techniques to become aware during dreams' },
              { title: 'Dream Symbols', desc: 'Common symbols and their psychological meanings' },
              { title: 'Sleep Optimization', desc: 'Tips for better sleep and more vivid dreams' },
              { title: 'Nightmares & Anxiety', desc: 'Understanding and managing stress-related dreams' },
              { title: 'Dreams Across Cultures', desc: 'How different cultures interpret dreams' },
              { title: 'Creativity & Dreams', desc: 'How dreams inspire artistic and creative breakthroughs' },
            ].map((article, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-lg dark:hover:bg-slate-900/50 transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{article.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{article.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Moon({ className, size }: any) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
}
