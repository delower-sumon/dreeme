'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import type { User } from '@supabase/supabase-js'

interface Profile {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (!error && data) {
                setProfile(data)
            }
        } catch (error) {
            console.log('Profile not found, using user metadata instead')
        }
    }

    useEffect(() => {
        if (status === 'loading') {
            // Don't set loading to true here to avoid flashing content
            // NextAuth's status handles the initial load
            return
        }

        if (session?.user) {
            // Map NextAuth user to Supabase User shape
            const mappedUser: any = {
                id: (session.user as any).id,
                email: session.user.email,
                user_metadata: {
                    avatar_url: session.user.image,
                    full_name: session.user.name,
                },
                app_metadata: {
                    provider: 'google'
                },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                role: 'authenticated'
            }
            setUser(mappedUser)

            // Fetch profile in background, don't block UI
            if (mappedUser.id) {
                // Only fetch if we don't have it or it's different
                if (!profile || profile.id !== mappedUser.id) {
                    fetchProfile(mappedUser.id)
                }
            }
        } else {
            setUser(null)
            setProfile(null)
        }
        setLoading(false)
    }, [session, status])

    const signOut = async () => {
        await nextAuthSignOut({ redirect: false })
        setUser(null)
        setProfile(null)
        window.location.href = '/'
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            setProfile(prev => prev ? { ...prev, ...updates } : null)
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
