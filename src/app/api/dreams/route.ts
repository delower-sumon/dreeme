import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
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
        const { title, content, dreamDate, moodIds, hoursSlept, interpretation } = body

        // Create dream
        const { data: dream, error } = await supabase
            .from('dreams')
            .insert({
                user_id: session.user.id,
                title,
                content,
                snippet: content.substring(0, 140) + (content.length > 140 ? '...' : ''),
                dream_date: dreamDate,
                hours_slept: hoursSlept,
                interpretation,
                interpretation_generated_at: interpretation ? new Date().toISOString() : null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating dream:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Add moods
        if (moodIds && moodIds.length > 0) {
            const { error: moodError } = await supabase
                .from('dream_moods')
                .insert(moodIds.map((moodId: string) => ({
                    dream_id: dream.id,
                    mood_id: moodId,
                })))

            if (moodError) {
                console.error('Error adding moods:', moodError)
            }
        }

        // Fetch complete dream with moods
        const { data: completeDream, error: fetchError } = await supabase
            .from('dreams')
            .select(`
        *,
        dream_moods(
          mood:moods(*)
        )
      `)
            .eq('id', dream.id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        return NextResponse.json(completeDream)
    } catch (error: any) {
        console.error('API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (id) {
            // Fetch single dream
            const { data, error } = await supabase
                .from('dreams')
                .select(`
            *,
            dream_moods(
              mood:moods(*)
            )
          `)
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return NextResponse.json(null) // Not found
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            // Check access: must be owner OR dream must be shared
            if (data.user_id !== userId && !data.is_shared) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }

            return NextResponse.json(data)
        }

        // Fetch user's dreams (requires auth)
        if (!userId) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('dreams')
            .select(`
        *,
        dream_moods(
          mood:moods(*)
        )
      `)
            .eq('user_id', userId)
            .order('dream_date', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || [])
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
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('dreams')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const { id, updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Dream ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (updates.title) updateData.title = updates.title
        if (updates.content) {
            updateData.content = updates.content
            updateData.snippet = updates.content.substring(0, 140) + (updates.content.length > 140 ? '...' : '')
        }
        if (updates.dreamDate) updateData.dream_date = updates.dreamDate
        if (updates.hoursSlept !== undefined) updateData.hours_slept = updates.hoursSlept
        if (updates.sleepQuality !== undefined) updateData.sleep_quality = updates.sleepQuality
        if (updates.interpretation !== undefined) {
            updateData.interpretation = updates.interpretation
            updateData.interpretation_generated_at = new Date().toISOString()
        }
        if (updates.is_shared !== undefined) {
            updateData.is_shared = updates.is_shared
            updateData.shared_at = updates.is_shared ? new Date().toISOString() : null
        }

        const { error } = await supabase
            .from('dreams')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', session.user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Update moods if provided
        if (updates.moodIds) {
            // Delete existing moods
            await supabase
                .from('dream_moods')
                .delete()
                .eq('dream_id', id)

            // Add new moods
            if (updates.moodIds.length > 0) {
                const { error: moodError } = await supabase
                    .from('dream_moods')
                    .insert(updates.moodIds.map((moodId: string) => ({
                        dream_id: id,
                        mood_id: moodId,
                    })))

                if (moodError) {
                    console.error('Error updating moods:', moodError)
                }
            }
        }

        // Fetch updated dream
        const { data: updatedDream, error: fetchError } = await supabase
            .from('dreams')
            .select(`
        *,
        dream_moods(
          mood:moods(*)
        )
      `)
            .eq('id', id)
            .single()

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        return NextResponse.json(updatedDream)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
