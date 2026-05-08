'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    updateProfile: async () => { },
    refreshProfile: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    // Track which userId we've already fetched a profile for — prevents re-fetching on every navigation
    const profileFetchedFor = useRef<string | null>(null)

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            if (!res.ok) {
                // If it's a 404 or other error, we don't want to keep retrying or showing a broken state
                console.warn(`Profile fetch returned ${res.status}`)
                return
            }
            const data: Profile = await res.json()
            if (data) {
                setProfile(data)
            }
        } catch (error) {
            console.error('Profile fetch failed:', error)
        }
    }

    useEffect(() => {
        if (status === 'loading') return

        if (session?.user) {
            // Map NextAuth user to the shape the rest of the app expects
            const mappedUser: any = {
                id: (session.user as any).id,
                email: session.user.email,
                user_metadata: {
                    // session.user.image is guaranteed by our updated JWT/session callbacks
                    avatar_url: session.user.image ?? null,
                    full_name: session.user.name ?? null,
                },
                app_metadata: { provider: 'google' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                role: 'authenticated',
            }
            setUser(mappedUser)

            // Only fetch the DB profile once per user session
            if (mappedUser.id && profileFetchedFor.current !== mappedUser.id) {
                profileFetchedFor.current = mappedUser.id
                fetchProfile()
            }
        } else {
            setUser(null)
            setProfile(null)
            profileFetchedFor.current = null
        }
        setLoading(false)
    }, [session, status])

    const signOut = async () => {
        await nextAuthSignOut({ redirect: false })
        setUser(null)
        setProfile(null)
        profileFetchedFor.current = null
        window.location.href = '/'
    }

    const updateProfile = async (updates: Partial<Profile>) => {
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown error' }))
                throw new Error(err.error || 'Failed to update profile')
            }
            const updated: Profile = await res.json()
            setProfile(updated)
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    const refreshProfile = async () => {
        await fetchProfile()
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile, refreshProfile }}>
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
