import React from 'react'

export default function TrackerLoading() {
  return (
    <div className="min-h-full pb-12 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30"></div>
          <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30"></div>
        </div>

        <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 mb-8"></div>
      </div>
    </div>
  )
}
