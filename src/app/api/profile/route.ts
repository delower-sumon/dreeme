import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Admin client — bypasses RLS so NextAuth users can read/write their own profile
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/profile  — fetch the current user's profile row
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
        return NextResponse.json({ error: 'No user ID in session' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        console.error('❌ Profile GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no profile row yet, seed one from the session and return it
    if (!data) {
        const seedPayload = {
            id: userId,
            full_name: session.user.name ?? null,
            avatar_url: session.user.image ?? null,
            updated_at: new Date().toISOString(),
        }
        const { data: seeded, error: seedErr } = await supabaseAdmin
            .from('profiles')
            .upsert(seedPayload, { onConflict: 'id' })
            .select('id, username, full_name, avatar_url')
            .single()

        if (seedErr) {
            console.error('❌ Profile seed error:', seedErr)
            // Return a minimal profile from session data as fallback
            return NextResponse.json({
                id: userId,
                username: null,
                full_name: session.user.name ?? null,
                avatar_url: session.user.image ?? null,
            })
        }
        return NextResponse.json(seeded)
    }

    return NextResponse.json(data)
}

// PATCH /api/profile  — update profile fields (full_name, avatar_url, etc.)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
        return NextResponse.json({ error: 'No user ID in session' }, { status: 400 })
    }

    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Only allow safe fields to be patched
    const allowed = ['full_name', 'avatar_url', 'username']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
        if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select('id, username, full_name, avatar_url')
        .single()

    if (error) {
        console.error('❌ Profile PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
