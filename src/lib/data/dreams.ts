import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

export async function getSharedDreamsServer() {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const supabase = await createClient()

    // Call the RPC that was already optimized for single-query fetching
    const { data, error } = await supabase.rpc('get_shared_dreams_with_likes', {
        p_user_id: userId
    })

    if (error) {
        console.error('Error fetching shared dreams:', error)
        return []
    }

    return data || []
}
