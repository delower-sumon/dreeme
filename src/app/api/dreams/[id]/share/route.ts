import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dreamId = params.id
        const body = await request.json()
        const { is_shared } = body

        // Update the dream to mark it as shared
        const { data, error } = await supabase
            .from('dreams')
            .update({
                is_shared: is_shared,
                shared_at: is_shared ? new Date().toISOString() : null
            })
            .eq('id', dreamId)
            .eq('user_id', session.user.id) // Ensure user owns the dream
            .select()
            .single()

        if (error) {
            console.error('Error sharing dream:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error sharing dream:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
