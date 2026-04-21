import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const { dreamId } = body

        if (!dreamId) {
            return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('dream_likes')
            .insert({ dream_id: dreamId, user_id: session.user.id })

        if (error && error.code !== '23505') { // Ignore duplicate key error
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const dreamId = searchParams.get('dreamId')

        if (!dreamId) {
            return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('dream_likes')
            .delete()
            .eq('dream_id', dreamId)
            .eq('user_id', session.user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
