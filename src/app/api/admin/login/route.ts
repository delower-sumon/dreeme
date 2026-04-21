import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        // Hardcoded credentials as requested for temporary access
        if (username === 'delowersumon' && password === 'Hyperlocal@365') {
            const cookieStore = await cookies()
            
            // Set an admin session cookie that lasts for 24 hours
            cookieStore.set('admin_session', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
