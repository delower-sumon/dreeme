export function StatCardSkeleton() {
    return (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>
    )
}

export function StatCardsSkeletonRow() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
    )
}
