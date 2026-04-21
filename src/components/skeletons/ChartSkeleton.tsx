export function ChartSkeleton() {
    return (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-6" />
            <div className="flex items-end justify-around h-48 gap-2">
                {[40, 70, 50, 90, 60, 80, 45].map((height, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                        <div
                            className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg"
                            style={{ height: `${height}%` }}
                        />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-8 mt-3" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ChartSkeletonRow() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartSkeleton />
            <ChartSkeleton />
        </div>
    )
}
