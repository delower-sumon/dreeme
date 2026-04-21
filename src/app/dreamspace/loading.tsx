import React from 'react'
import { DreamCardSkeletonList } from '@/components/skeletons/DreamCardSkeleton'

export default function DreamSpaceLoading() {
  return (
    <div className="min-h-full pb-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
            <DreamCardSkeletonList count={3} />
          </div>
          <div className="lg:col-span-1">
             <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
             <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900"></div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
