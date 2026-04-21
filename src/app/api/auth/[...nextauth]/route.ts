import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

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
        async jwt({ token, account, profile }: any) {
            // On first sign-in, sync user to Supabase
            if (account && profile) {
                token.accessToken = account.access_token
                token.id = profile.sub

                try {
                    // Check if user exists in Supabase
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', profile.sub)
                        .single()

                    if (!existingUser) {
                        // Create new user
                        await supabase.from('users').insert({
                            id: profile.sub,
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
                        }).eq('id', profile.sub)
                        console.log('✅ User updated in Supabase:', profile.email)
                    }

                    // Sync to profiles table (used by the app)
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: profile.sub,
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
                session.accessToken = token.accessToken
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
