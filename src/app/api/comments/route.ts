import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch comments for a dream
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dreamId = searchParams.get('dreamId')

        if (!dreamId) {
            return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('dream_comments')
            .select(`
                id,
                content,
                created_at,
                user_id
            `)
            .eq('dream_id', dreamId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching comments:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Fetch user profiles for comments
        const userIds = [...new Set((data || []).map((comment: any) => comment.user_id))]
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds)

        // Create a map of profiles
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

        // Add profile data to comments
        const commentsWithProfiles = (data || []).map((comment: any) => ({
            ...comment,
            profile: profileMap.get(comment.user_id) || {
                id: comment.user_id,
                username: 'Anonymous',
                full_name: 'Anonymous User',
                avatar_url: null
            }
        }))

        return NextResponse.json(commentsWithProfiles)
    } catch (error: any) {
        console.error('Error in comments GET:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { dreamId, content } = body

        if (!dreamId || !content) {
            return NextResponse.json({ error: 'Dream ID and content are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('dream_comments')
            .insert({
                dream_id: dreamId,
                user_id: session.user.id,
                content: content.trim()
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating comment:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Fetch the user's profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', session.user.id)
            .single()

        return NextResponse.json({
            ...data,
            profile: profile || {
                id: session.user.id,
                username: 'Anonymous',
                full_name: 'Anonymous User',
                avatar_url: null
            }
        })
    } catch (error: any) {
        console.error('Error in comments POST:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const commentId = searchParams.get('commentId')

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('dream_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', session.user.id) // Ensure user owns the comment

        if (error) {
            console.error('Error deleting comment:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error in comments DELETE:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
