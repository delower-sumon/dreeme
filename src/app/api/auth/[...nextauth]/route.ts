import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"
import crypto from 'crypto'

// Helper to generate a deterministic UUID from a string (e.g., Google sub)
// This ensures we always get the same UUID for the same provider ID
const toUUID = (id: string) => {
    if (!id) return id
    // If it's already a valid UUID, return it
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id
    
    // Otherwise, create a deterministic hash and format as UUID
    const hash = crypto.createHash('sha256').update(id).digest('hex')
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
)

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials")
                }

                const { data: user } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single()

                if (!user || !user.password) {
                    throw new Error("Invalid credentials")
                }

                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error("Invalid credentials")
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                }
            }
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, account, profile, user }: any) {
            // Handle credentials login
            if (user) {
                token.id = toUUID(user.id)
                // Preserve image for credentials users
                if (user.image) token.picture = user.image
            }

            // On first social sign-in, sync user to Supabase
            if (account && profile) {
                const userId = toUUID(profile.sub)
                token.id = userId
                token.accessToken = account.access_token
                // Explicitly store Google picture so it persists in the JWT
                token.picture = profile.picture

                try {
                    // Check if user exists in Supabase
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', userId)
                        .single()

                    if (!existingUser) {
                        // Create new user
                        await supabase.from('users').insert({
                            id: userId,
                            email: profile.email,
                            name: profile.name,
                            image: profile.picture,
                            emailVerified: new Date().toISOString(),
                        })
                        console.log('✅ New user created in Supabase:', profile.email)
                    } else {
                        // Update existing user
                        await supabase.from('users').update({
                            name: profile.name,
                            image: profile.picture,
                        }).eq('id', userId)
                        console.log('✅ User updated in Supabase:', profile.email)
                    }

                    // Sync to profiles table (used by the app)
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userId,
                            full_name: profile.name,
                            avatar_url: profile.picture,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'id' })

                    if (profileError) {
                        console.error('❌ Error syncing profile:', profileError)
                    } else {
                        console.log('✅ Profile synced for:', profile.email)
                    }
                } catch (error) {
                    console.error('❌ Error syncing user to Supabase:', error)
                }
            }
            return token
        },
        async session({ session, token }: any) {
            // Send properties to the client
            if (session.user) {
                session.user.id = token.id
                // Forward the avatar URL from JWT so it's always available client-side
                if (token.picture) session.user.image = token.picture
                session.accessToken = token.accessToken
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
