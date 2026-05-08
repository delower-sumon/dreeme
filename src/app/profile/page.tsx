'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Camera, User, Mail, Loader2, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
    const { user, profile, updateProfile, refreshProfile } = useAuth()
    const [uploading, setUploading] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    React.useEffect(() => {
        if (!user) {
            router.push('/auth/login')
        }
    }, [user, router])

    if (!user) {
        return null
    }

    const getUserInitials = () => {
        const name = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
        if (name) {
            const parts = name.trim().split(/\s+/)
            return parts.length > 1
                ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                : parts[0].substring(0, 2).toUpperCase()
        }
        return (user.email || '').substring(0, 2).toUpperCase()
    }

    const avatarUrl = !imgError ? (profile?.avatar_url || user?.user_metadata?.avatar_url) : null

    // Upload a chosen file via the server-side avatar API route
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError('')
            setSuccess('')
            setUploading(true)
            setImgError(false)

            if (!event.target.files || event.target.files.length === 0) return

            const file = event.target.files[0]
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Upload failed' }))
                throw new Error(errData.error || 'Upload failed')
            }

            // Refresh the profile so the new avatar_url is shown immediately
            await refreshProfile()
            setSuccess('Profile picture updated successfully!')
        } catch (err: any) {
            setError(err.message || 'Error uploading image')
        } finally {
            setUploading(false)
            // Reset the file input so the same file can be picked again
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Save the Google profile picture URL into the DB profile row
    const handleUseGoogleAvatar = async () => {
        try {
            setError('')
            setSuccess('')
            setImgError(false)

            const googleAvatar = user?.user_metadata?.avatar_url
            if (!googleAvatar) {
                setError('No Google profile picture found')
                return
            }

            await updateProfile({ avatar_url: googleAvatar })
            setSuccess('Using Google profile picture!')
        } catch (err: any) {
            setError(err.message || 'Error updating profile')
        }
    }

    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [isSaving, setIsSaving] = useState(false)

    // Sync local state when the profile loads from the DB
    React.useEffect(() => {
        if (profile?.full_name) setFullName(profile.full_name)
    }, [profile])

    const handleUpdateProfile = async () => {
        try {
            setError('')
            setSuccess('')
            setImgError(false)
            setIsSaving(true)

            if (!fullName.trim()) {
                setError('Full name cannot be empty')
                return
            }

            await updateProfile({ full_name: fullName.trim() })
            setSuccess('Profile updated successfully!')
        } catch (err: any) {
            setError(err.message || 'Error updating profile')
        } finally {
            setIsSaving(false)
        }
    }

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
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    getUserInitials()
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-violet-500 hover:bg-violet-600 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                                title="Upload new profile picture"
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

                        {/* Quick-action buttons */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {user?.user_metadata?.avatar_url && (
                                <button
                                    onClick={handleUseGoogleAvatar}
                                    className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors font-medium flex items-center gap-1"
                                >
                                    <RefreshCw size={14} />
                                    Use Google Picture
                                </button>
                            )}
                        </div>
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
                                Email is linked to your account and cannot be changed here.
                            </p>
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <button
                                onClick={handleUpdateProfile}
                                disabled={isSaving || fullName === (profile?.full_name ?? '')}
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
