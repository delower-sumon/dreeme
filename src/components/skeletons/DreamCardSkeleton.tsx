export function DreamCardSkeleton() {
    return (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                    </div>
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
            </div>
            <div className="flex gap-2 mb-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
            </div>
            <div className="flex gap-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" />
            </div>
        </div>
    )
}

export function DreamCardSkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
                <DreamCardSkeleton key={i} />
            ))}
        </div>
    )
}
