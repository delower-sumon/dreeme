import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id

        // Get all shared dreams with their likes
        const { data, error } = await supabase
            .from('dreams')
            .select(`
        id,
        title,
        content,
        dream_date,
        hours_slept,
        user_id,
        shared_at,
        created_at,
        dream_moods(
          mood:moods(*)
        ),
        dream_likes(
          id,
          user_id
        )
      `)
            .eq('is_shared', true)
            .order('shared_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching shared dreams:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Fetch user profiles separately to handle missing profiles
        const userIds = [...new Set((data || []).map((dream: any) => dream.user_id))]
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds)

        // Create a map of profiles
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

        // Process the data to add like counts and check if user liked
        const processedData = (data || []).map((dream: any) => {
            // Count total likes
            const likeCount = dream.dream_likes?.length || 0

            // Check if current user liked this dream
            const isLiked = userId ? dream.dream_likes?.some((like: any) => like.user_id === userId) : false

            // Get profile or use fallback
            const profile = profileMap.get(dream.user_id) || {
                id: dream.user_id,
                username: 'Anonymous',
                full_name: 'Anonymous User',
                avatar_url: null
            }

            // Remove the dream_likes array and interpretation, add computed values
            const { dream_likes, interpretation, ...dreamWithoutSensitiveData } = dream
            return {
                ...dreamWithoutSensitiveData,
                profile,
                likeCount,
                isLiked
            }
        })

        return NextResponse.json(processedData)
    } catch (error: any) {
        console.error('Error in shared dreams endpoint:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
