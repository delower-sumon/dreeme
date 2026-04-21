'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Camera, User, Mail, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const { user, profile, updateProfile } = useAuth()
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    if (!user) {
        router.push('/auth/login')
        return null
    }

    const getAvatarUrl = () => {
        if (profile?.avatar_url) {
            return profile.avatar_url
        }
        if (user?.user_metadata?.avatar_url) {
            return user.user_metadata.avatar_url
        }
        return null
    }

    const getUserInitials = () => {
        if (profile?.full_name) {
            const names = profile.full_name.split(' ')
            return names.length > 1
                ? `${names[0][0]}${names[1][0]}`.toUpperCase()
                : names[0].substring(0, 2).toUpperCase()
        }
        const email = user.email || ''
        return email.substring(0, 2).toUpperCase()
    }

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError('')
            setSuccess('')
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}-${Math.random()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update profile
            await updateProfile({ avatar_url: publicUrl })
            setSuccess('Profile picture updated successfully!')
        } catch (error: any) {
            setError(error.message || 'Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleUseGoogleAvatar = async () => {
        try {
            setError('')
            setSuccess('')

            const googleAvatar = user?.user_metadata?.avatar_url
            if (!googleAvatar) {
                setError('No Google profile picture found')
                return
            }

            await updateProfile({ avatar_url: googleAvatar })
            setSuccess('Using Google profile picture!')
        } catch (error: any) {
            setError(error.message || 'Error updating profile')
        }
    }

    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [isSaving, setIsSaving] = useState(false)

    // Update local state when profile loads
    React.useEffect(() => {
        if (profile?.full_name) {
            setFullName(profile.full_name)
        }
    }, [profile])

    const handleUpdateProfile = async () => {
        try {
            setError('')
            setSuccess('')
            setIsSaving(true)

            if (!fullName.trim()) {
                setError('Full name cannot be empty')
                return
            }

            await updateProfile({ full_name: fullName.trim() })
            setSuccess('Profile updated successfully!')
        } catch (error: any) {
            setError(error.message || 'Error updating profile')
        } finally {
            setIsSaving(false)
        }
    }

    const avatarUrl = getAvatarUrl()

    return (
        <div className="min-h-full pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Profile Card */}
                <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/30 overflow-hidden">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getUserInitials()
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-violet-500 hover:bg-violet-600 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Camera size={20} />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {profile?.full_name || fullName || 'Dreamer'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {user.email}
                        </p>

                        {user?.user_metadata?.avatar_url && (
                            <button
                                onClick={handleUseGoogleAvatar}
                                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium"
                            >
                                Use Google Profile Picture
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-200 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Profile Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 cursor-not-allowed opacity-75"
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Email cannot be changed as it is linked to your Google account.
                            </p>
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSaving || fullName === profile?.full_name}
                                className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
