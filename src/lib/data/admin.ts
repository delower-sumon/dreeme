import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

export interface AdminStats {
    totalUsers: number
    totalDreams: number
    totalSharedDreams: number
    activeToday: number
}

export async function getAdminStats(): Promise<AdminStats | null> {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const supabase = await createClient()
    
    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

    if (profile?.role !== 'admin') {
        // For development/first-run, you might want to allow the first user or specific emails
        // if (session.user.email !== 'your-email@example.com') return null
        return null
    }

    const [usersCount, dreamsCount, sharedDreamsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('dreams').select('*', { count: 'exact', head: true }),
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('is_shared', true),
    ])

    return {
        totalUsers: usersCount.count || 0,
        totalDreams: dreamsCount.count || 0,
        totalSharedDreams: sharedDreamsCount.count || 0,
        activeToday: Math.floor((usersCount.count || 0) * 0.4), // Mock active users
    }
}
