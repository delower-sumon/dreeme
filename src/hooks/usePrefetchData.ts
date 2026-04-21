import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserDreams, getSharedDreams } from '@/lib/services/dreams'
import { getAllMoods } from '@/lib/services/moods'
import { getUserDreamStats, getUserMoodDistribution, getWeeklyDreamFrequency, getSleepVsDreams } from '@/lib/services/analytics'

/**
 * Prefetch data for Journal, Tracker, and DreamSpace pages
 * This runs in the background on the homepage to make navigation feel instantaneous
 */
export function usePrefetchData() {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    useEffect(() => {
        // Only prefetch if user is authenticated
        if (!user) return

        // Use a small delay to ensure homepage renders first
        const timer = setTimeout(() => {
            // Prefetch Journal page data
            queryClient.prefetchQuery({
                queryKey: ['user-dreams'],
                queryFn: getUserDreams,
                staleTime: 60 * 1000, // 1 minute
            })

            queryClient.prefetchQuery({
                queryKey: ['moods'],
                queryFn: getAllMoods,
                staleTime: 5 * 60 * 1000, // 5 minutes (moods rarely change)
            })

            // Prefetch DreamSpace page data
            queryClient.prefetchQuery({
                queryKey: ['shared-dreams'],
                queryFn: getSharedDreams,
                staleTime: 30 * 1000, // 30 seconds
            })

            // Prefetch Tracker page data
            queryClient.prefetchQuery({
                queryKey: ['dream-stats'],
                queryFn: getUserDreamStats,
                staleTime: 60 * 1000, // 1 minute
            })

            queryClient.prefetchQuery({
                queryKey: ['mood-distribution'],
                queryFn: getUserMoodDistribution,
                staleTime: 60 * 1000, // 1 minute
            })

            queryClient.prefetchQuery({
                queryKey: ['weekly-frequency'],
                queryFn: getWeeklyDreamFrequency,
                staleTime: 60 * 1000, // 1 minute
            })

            queryClient.prefetchQuery({
                queryKey: ['sleep-vs-dreams'],
                queryFn: getSleepVsDreams,
                staleTime: 60 * 1000, // 1 minute
            })
        }, 500) // 500ms delay to let homepage render first

        return () => clearTimeout(timer)
    }, [user, queryClient])
}
