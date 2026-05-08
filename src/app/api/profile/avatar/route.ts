import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

// Admin client — bypasses RLS for storage uploads
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/profile/avatar  — upload an avatar image, return the public URL
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
        return NextResponse.json({ error: 'No user ID in session' }, { status: 400 })
    }

    // Parse multipart form data
    let formData: FormData
    try {
        formData = await req.formData()
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File must be smaller than 5 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    // Use a fixed path per user so repeated uploads overwrite the previous avatar
    const filePath = `avatars/${userId}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage (service role key bypasses RLS)
    const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
        })

    if (uploadError) {
        console.error('❌ Avatar upload error:', uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL (cache-bust with a timestamp so the browser fetches the new image)
    const { data: { publicUrl } } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(filePath)

    const bustedUrl = `${publicUrl}?t=${Date.now()}`

    // Also update the profile row
    await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: bustedUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)

    return NextResponse.json({ url: bustedUrl })
}
