

export interface DreamStats {
    total_dreams: number
    total_shared: number
    avg_sleep_hours: number | null
    most_common_mood: string | null
    dreams_this_week: number
    dreams_this_month: number
    current_streak: number
}

export interface MoodDistribution {
    mood_name: string
    mood_emoji: string
    mood_color: string
    count: number
}

export interface WeeklyFrequency {
    day_of_week: number
    day_name: string
    dream_count: number
}

export interface SleepVsDreams {
    hours_bucket: number
    dream_count: number
    avg_sleep: number
}

/**
 * Get comprehensive dream statistics for the current user
 */
export async function getUserDreamStats(): Promise<DreamStats | null> {
    const response = await fetch('/api/analytics?type=stats')
    if (!response.ok) return null
    return response.json()
}

/**
 * Get mood distribution for the current user
 */
export async function getUserMoodDistribution(): Promise<MoodDistribution[]> {
    const response = await fetch('/api/analytics?type=moods')
    if (!response.ok) return []
    return response.json()
}

/**
 * Get weekly dream frequency
 */
export async function getWeeklyDreamFrequency(): Promise<WeeklyFrequency[]> {
    const response = await fetch('/api/analytics?type=weekly')
    if (!response.ok) return []
    return response.json()
}

/**
 * Get sleep vs dreams correlation
 */
export async function getSleepVsDreams(): Promise<SleepVsDreams[]> {
    const response = await fetch('/api/analytics?type=sleep')
    if (!response.ok) return []
    return response.json()
}
