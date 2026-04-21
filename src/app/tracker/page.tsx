import React from 'react'
import { BarChart3, TrendingUp, Moon } from 'lucide-react'
import { getTrackerData } from '@/lib/data/tracker'
import { redirect } from 'next/navigation'

export default async function TrackerPage() {
  const data = await getTrackerData()

  if (!data) {
    redirect('/auth/login')
  }

  const { stats, moodDistribution, weeklyFrequency, sleepVsDreams } = data
  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxFreq = Math.max(...weeklyFrequency, 1)
  const maxMood = Math.max(...moodDistribution.map(m => m.count), 1)

  return (
    <div className="min-h-full pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2 font-outfit">Dream Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400">Visualize patterns and trends in your dreams over time</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Total Dreams</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 font-outfit">{stats.totalDreams}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="text-violet-600 dark:text-violet-400" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Avg. Sleep</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-outfit">{stats.avgSleep.toFixed(1)}h</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Moon className="text-sky-600 dark:text-sky-400" size={24} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">This Week</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-outfit">{stats.dreamsThisWeek} new</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Frequency Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 font-outfit">Dreams This Week</h2>
            <div className="flex items-end justify-around h-48 gap-2">
              {weeklyFrequency.map((freq, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${(freq / maxFreq) * 180}px`, minHeight: freq > 0 ? '4px' : '0px' }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-white bg-slate-900/90 dark:bg-slate-900/80 px-2 py-1 rounded whitespace-nowrap z-10">
                      {freq} dreams
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium uppercase tracking-wider">{daysLabels[idx]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Distribution */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 font-outfit">Mood Distribution</h2>
            <div className="space-y-4">
              {moodDistribution.length > 0 ? (
                moodDistribution.map(({ mood, count, emoji }) => (
                  <div key={mood}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{emoji} {mood}</p>
                      <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{count}</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-500 dark:to-violet-400 rounded-full transition-all"
                        style={{ width: `${(count / maxMood) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                   <p className="text-sm text-slate-600 dark:text-slate-400">No mood data yet. Start journaling to see your mood patterns!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sleep Duration vs Dream Count */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-md mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 font-outfit">Sleep Duration vs Dream Count</h2>
          {sleepVsDreams.length > 0 ? (
            <div className="flex items-end justify-around h-48 gap-3">
              {sleepVsDreams.map(({ hours, dreams }) => (
                <div key={hours} className="flex flex-col items-center flex-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 dark:from-sky-500 dark:to-cyan-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative"
                    style={{ height: `${(dreams / Math.max(...sleepVsDreams.map(s => s.dreams), 1)) * 180}px`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-white bg-slate-900/90 dark:bg-slate-900/80 px-2 py-1 rounded whitespace-nowrap z-10">
                      {dreams} dreams
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-medium">{hours}h</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">No sleep data yet. Add sleep hours to your dreams to see correlations!</p>
            </div>
          )}
        </div>

        {/* Blog Articles */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 font-outfit">Sleep & Dream Science</h2>
            <span className="text-xs text-violet-500 font-medium px-2 py-1 bg-violet-100 dark:bg-violet-900/30 rounded-full">Coming Soon</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
            {[
              { title: 'REM Sleep & Dreams', desc: 'Understanding the connection between REM sleep and vivid dreams' },
              { title: 'Sleep Cycles Explained', desc: 'How sleep cycles affect dream patterns and memory formation' },
              { title: 'Dreams & Healing', desc: 'The role of dreams in emotional processing and mental health' },
              { title: 'Lucid Dreaming Basics', desc: 'Techniques to become aware during dreams' },
              { title: 'Dream Symbols', desc: 'Common symbols and their psychological meanings' },
              { title: 'Sleep Optimization', desc: 'Tips for better sleep and more vivid dreams' },
            ].map((article, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:border-violet-300 dark:hover:border-violet-500/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">✨</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 font-outfit">{article.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{article.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
