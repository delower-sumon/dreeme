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

        // Staggered prefetch to prevent hitting the DB with 7 simultaneous requests
        const prefetch = async () => {
            // Priority 1: Journal & Moods
            await queryClient.prefetchQuery({
                queryKey: ['user-dreams'],
                queryFn: getUserDreams,
                staleTime: 60 * 1000,
            })
            await queryClient.prefetchQuery({
                queryKey: ['moods'],
                queryFn: getAllMoods,
                staleTime: 5 * 60 * 1000,
            })

            // Priority 2: DreamSpace
            await new Promise(resolve => setTimeout(resolve, 300))
            await queryClient.prefetchQuery({
                queryKey: ['shared-dreams'],
                queryFn: getSharedDreams,
                staleTime: 30 * 1000,
            })

            // Priority 3: Analytics (Tracker)
            await new Promise(resolve => setTimeout(resolve, 300))
            await Promise.all([
                queryClient.prefetchQuery({
                    queryKey: ['dream-stats'],
                    queryFn: getUserDreamStats,
                    staleTime: 60 * 1000,
                }),
                queryClient.prefetchQuery({
                    queryKey: ['mood-distribution'],
                    queryFn: getUserMoodDistribution,
                    staleTime: 60 * 1000,
                }),
                queryClient.prefetchQuery({
                    queryKey: ['weekly-frequency'],
                    queryFn: getWeeklyDreamFrequency,
                    staleTime: 60 * 1000,
                }),
                queryClient.prefetchQuery({
                    queryKey: ['sleep-vs-dreams'],
                    queryFn: getSleepVsDreams,
                    staleTime: 60 * 1000,
                })
            ])
        }

        const timer = setTimeout(prefetch, 800)
        return () => clearTimeout(timer)
    }, [user, queryClient])
}
