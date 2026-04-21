import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, username, fullName } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Generate a UUID for the user ID (since we're not using Supabase Auth's ID)
        const userId = crypto.randomUUID()

        // Create user in users table
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                password: hashedPassword,
                name: fullName || username || email.split('@')[0],
                image: null,
                emailVerified: null, // Email not verified yet
            })

        if (insertError) {
            console.error('Error creating user:', insertError)
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            )
        }

        // Create profile in profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username: username || email.split('@')[0],
                full_name: fullName,
                avatar_url: null,
                updated_at: new Date().toISOString(),
            })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // We don't fail the request here, as the user account is created
        }

        return NextResponse.json({ success: true, userId })
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
