import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export interface TrackerData {
  stats: {
    totalDreams: number
    avgSleep: number
    dreamsThisWeek: number
    currentStreak: number
  }
  moodDistribution: Array<{ mood: string; count: number; emoji: string }>
  weeklyFrequency: number[]
  sleepVsDreams: Array<{ hours: number; dreams: number }>
}

export async function getTrackerData(): Promise<TrackerData | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const supabase = await createClient()
  const userId = session.user.id

  const [statsRes, moodRes, weeklyRes, sleepRes] = await Promise.all([
    supabase.rpc('get_user_dream_stats', { p_user_id: userId }).single(),
    supabase.rpc('get_user_mood_distribution', { p_user_id: userId }),
    supabase.rpc('get_weekly_dream_frequency', { p_user_id: userId }),
    supabase.rpc('get_sleep_vs_dreams', { p_user_id: userId })
  ])

  // Process Stats
  const statsData = (statsRes.data as any) || {}
  const stats = {
    totalDreams: statsData.total_dreams || 0,
    avgSleep: statsData.avg_sleep_hours || 0,
    dreamsThisWeek: statsData.dreams_this_week || 0,
    currentStreak: statsData.current_streak || 0,
  }

  // Process Moods
  const moodDistribution = (moodRes.data || []).map((m: any) => ({
    mood: m.mood_name,
    emoji: m.mood_emoji,
    count: Number(m.count)
  }))

  // Process Weekly
  const weeklyFrequency = new Array(7).fill(0)
  ;(weeklyRes.data || []).forEach((day: any) => {
    const index = day.day_of_week === 0 ? 6 : day.day_of_week - 1
    weeklyFrequency[index] = Number(day.dream_count)
  })

  // Process Sleep
  const sleepVsDreams = (sleepRes.data || []).map((s: any) => ({
    hours: s.hours_bucket,
    dreams: Number(s.dream_count)
  }))

  return {
    stats,
    moodDistribution,
    weeklyFrequency,
    sleepVsDreams
  }
}
