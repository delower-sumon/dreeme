import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const userId = session.user.id

        let data
        let error

        switch (type) {
            case 'stats':
                ({ data, error } = await supabase
                    .rpc('get_user_dream_stats', { p_user_id: userId })
                    .single())
                break
            case 'moods':
                ({ data, error } = await supabase
                    .rpc('get_user_mood_distribution', { p_user_id: userId }))
                break
            case 'weekly':
                ({ data, error } = await supabase
                    .rpc('get_weekly_dream_frequency', { p_user_id: userId }))
                break
            case 'sleep':
                ({ data, error } = await supabase
                    .rpc('get_sleep_vs_dreams', { p_user_id: userId }))
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        if (error) {
            console.error(`Error fetching ${type}:`, error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || (type === 'stats' ? null : []))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
