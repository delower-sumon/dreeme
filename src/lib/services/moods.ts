import { createClient } from '@/lib/supabase/client'

export interface Mood {
    id: string
    name: string
    emoji: string
    color: string
    description: string
}

/**
 * Get all available moods
 */
export async function getAllMoods(): Promise<Mood[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('name')

    if (error) throw error
    return data || []
}

/**
 * Get mood by ID
 */
export async function getMoodById(moodId: string): Promise<Mood | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('id', moodId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }

    return data
}

/**
 * Get mood by name
 */
export async function getMoodByName(name: string): Promise<Mood | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('name', name)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }

    return data
}
