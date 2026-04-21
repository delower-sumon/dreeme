

export interface Dream {
    id: string
    user_id: string
    title: string
    content: string
    snippet: string
    dream_date: string
    hours_slept?: number
    sleep_quality?: number
    interpretation?: string
    interpretation_generated_at?: string
    is_shared: boolean
    shared_at?: string
    view_count: number
    created_at: string
    updated_at: string
}

export interface DreamWithMoods extends Dream {
    dream_moods: Array<{
        mood: {
            id: string
            name: string
            emoji: string
            color: string
        }
    }>
}

export interface CreateDreamData {
    title: string
    content: string
    dreamDate: string
    moodIds: string[]
    hoursSlept?: number
    sleepQuality?: number
    interpretation?: string
}

/**
 * Create a new dream entry
 */
export async function createDream(data: CreateDreamData): Promise<DreamWithMoods> {
    const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create dream')
    }

    return response.json()
}

/**
 * Get all dreams for the current user
 */
export async function getUserDreams(): Promise<DreamWithMoods[]> {
    const response = await fetch('/api/dreams')

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch dreams')
    }

    return response.json()
}

/**
 * Get a single dream by ID
 */
export async function getDreamById(dreamId: string): Promise<DreamWithMoods | null> {
    const response = await fetch(`/api/dreams?id=${dreamId}`)

    if (!response.ok) {
        if (response.status === 404) return null
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch dream')
    }

    const data = await response.json()
    return data
}

/**
 * Update a dream
 */
export async function updateDream(
    dreamId: string,
    updates: Partial<CreateDreamData>
): Promise<DreamWithMoods> {
    const response = await fetch('/api/dreams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dreamId, updates }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update dream')
    }

    return response.json()
}

/**
 * Delete a dream
 */
export async function deleteDream(dreamId: string): Promise<void> {
    const response = await fetch(`/api/dreams?id=${dreamId}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete dream')
    }
}

/**
 * Toggle dream sharing status
 */
export async function toggleDreamShare(dreamId: string, isShared: boolean): Promise<void> {
    const response = await fetch('/api/dreams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: dreamId,
            updates: { is_shared: isShared }
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update share status')
    }
}

/**
 * Get all shared dreams (for community feed) with like data in a single query
 * This eliminates the N+1 query problem
 */
export async function getSharedDreams(): Promise<any[]> {
    const response = await fetch('/api/dreams/shared')

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch shared dreams')
    }

    return response.json()
}

/**
 * Like a dream
 */
export async function likeDream(dreamId: string): Promise<void> {
    const response = await fetch('/api/dreams/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to like dream')
    }
}

/**
 * Unlike a dream
 */
export async function unlikeDream(dreamId: string): Promise<void> {
    const response = await fetch(`/api/dreams/like?dreamId=${dreamId}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to unlike dream')
    }
}

/**
 * Get like count for a dream - kept for compatibility but not used in optimized flow
 */

