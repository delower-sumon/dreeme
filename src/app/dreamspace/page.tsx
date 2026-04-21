'use client'

import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSharedDreams, likeDream, unlikeDream } from '@/lib/services/dreams'
import { getComments, createComment, deleteComment, type Comment } from '@/lib/services/comments'
import { DreamCardSkeleton, DreamCardSkeletonList } from '@/components/skeletons/DreamCardSkeleton'

interface SharedDream {
    id: string
    title: string
    content: string
    snippet: string
    dream_date: string
    created_at: string
    profile: {
        id: string
        username: string | null
        full_name: string | null
        avatar_url: string | null
    }
    dream_moods: Array<{
        mood: {
            id: string
            name: string
            emoji: string
            color: string
        }
    }>
    interpretation: string | null
    likeCount: number
    isLiked: boolean
}

interface Article {
    id: string
    title: string
    preview: string
    category: string
    loves: number
    loved: boolean
}

// Dream Comments Component
function DreamComments({
    dreamId,
    commentText,
    onCommentChange,
    onSubmit,
    isSubmitting,
    currentUser
}: {
    dreamId: string
    commentText: string
    onCommentChange: (text: string) => void
    onSubmit: () => void
    isSubmitting: boolean
    currentUser: any
}) {
    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', dreamId],
        queryFn: () => getComments(dreamId),
    })

    const getAuthorName = (profile: Comment['profile']) => {
        return profile.full_name || profile.username || 'Anonymous'
    }

    return (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Comment Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => onCommentChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                    onClick={onSubmit}
                    disabled={!commentText.trim() || isSubmitting}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Send size={14} />
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="text-sm text-slate-400">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first to comment!</div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                            {comment.profile.avatar_url ? (
                                <img
                                    src={comment.profile.avatar_url}
                                    alt={getAuthorName(comment.profile)}
                                    className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-sky-300 flex items-center justify-center text-slate-950 text-[10px] font-semibold flex-shrink-0">
                                    {getAuthorName(comment.profile).charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                        {getAuthorName(comment.profile)}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 ml-3">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function DreamSpacePage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const queryClient = useQueryClient()

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login')
        }
    }, [user, authLoading, router])

    const [articles] = useState<Article[]>([
        {
            id: 'art-1',
            title: 'Why Your Brain Loves Dreaming',
            preview: 'Explore the fascinating neuroscience behind dreams and why they matter for your wellbeing.',
            category: 'Science',
            loves: 156,
            loved: false,
        },
        {
            id: 'art-2',
            title: 'The Science of Lucid Dreaming',
            preview: 'Learn techniques to achieve lucid dreams and explore your inner world consciously.',
            category: 'Techniques',
            loves: 142,
            loved: false,
        },
        {
            id: 'art-3',
            title: 'Nightmares as Emotional Detox',
            preview: 'Understanding how nightmares help your mind process and release emotional tension.',
            category: 'Psychology',
            loves: 134,
            loved: false,
        },
    ])

    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
    const [commentText, setCommentText] = useState<Record<string, string>>({})

    // Use React Query to fetch shared dreams with caching
    const { data: sharedDreams = [], isLoading } = useQuery({
        queryKey: ['shared-dreams'],
        queryFn: getSharedDreams,
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    })

    // Optimistic like mutation
    const likeMutation = useMutation({
        mutationFn: likeDream,
        onMutate: async (dreamId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['shared-dreams'] })

            // Snapshot previous value
            const previousDreams = queryClient.getQueryData(['shared-dreams'])

            // Optimistically update
            queryClient.setQueryData(['shared-dreams'], (old: any[]) =>
                old?.map(dream =>
                    dream.id === dreamId
                        ? { ...dream, isLiked: true, likeCount: dream.likeCount + 1 }
                        : dream
                )
            )

            return { previousDreams }
        },
        onError: (err, dreamId, context: any) => {
            // Rollback on error
            queryClient.setQueryData(['shared-dreams'], context.previousDreams)
        },
    })

    // Optimistic unlike mutation
    const unlikeMutation = useMutation({
        mutationFn: unlikeDream,
        onMutate: async (dreamId) => {
            await queryClient.cancelQueries({ queryKey: ['shared-dreams'] })
            const previousDreams = queryClient.getQueryData(['shared-dreams'])

            queryClient.setQueryData(['shared-dreams'], (old: any[]) =>
                old?.map(dream =>
                    dream.id === dreamId
                        ? { ...dream, isLiked: false, likeCount: Math.max(0, dream.likeCount - 1) }
                        : dream
                )
            )

            return { previousDreams }
        },
        onError: (err, dreamId, context: any) => {
            queryClient.setQueryData(['shared-dreams'], context.previousDreams)
        },
    })

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: ({ dreamId, content }: { dreamId: string; content: string }) => createComment(dreamId, content),
        onSuccess: (_, variables) => {
            // Invalidate comments query for this dream
            queryClient.invalidateQueries({ queryKey: ['comments', variables.dreamId] })
            // Clear the comment input
            setCommentText(prev => ({ ...prev, [variables.dreamId]: '' }))
        },
    })

    const toggleDreamLove = async (dreamId: string) => {
        if (!user) {
            alert('Please sign in to like dreams')
            return
        }

        const dream = sharedDreams.find((d: any) => d.id === dreamId)
        if (!dream) return

        try {
            if (dream.isLiked) {
                unlikeMutation.mutate(dreamId)
            } else {
                likeMutation.mutate(dreamId)
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    const toggleComments = (dreamId: string) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev)
            if (newSet.has(dreamId)) {
                newSet.delete(dreamId)
            } else {
                newSet.add(dreamId)
            }
            return newSet
        })
    }

    const handleSubmitComment = (dreamId: string) => {
        const content = commentText[dreamId]?.trim()
        if (!content) return

        if (!user) {
            alert('Please sign in to comment')
            return
        }

        commentMutation.mutate({ dreamId, content })
    }

    const getAuthorName = (profile: SharedDream['profile']) => {
        return profile.full_name || profile.username || 'Anonymous'
    }

    const getAuthorInitial = (profile: SharedDream['profile']) => {
        const name = getAuthorName(profile)
        return name.charAt(0).toUpperCase()
    }

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-full pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2">DreamSpace</h1>
                    <p className="text-slate-600 dark:text-slate-400">Explore dreams shared by our community</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Shared Dreams */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Shared Dreams</h2>

                        {isLoading ? (
                            <DreamCardSkeletonList count={3} />
                        ) : sharedDreams.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 mb-2">No shared dreams yet</p>
                                <p className="text-sm text-slate-500">Be the first to share your dreams with the community!</p>
                            </div>
                        ) : (
                            sharedDreams.map(dream => (
                                <div
                                    key={dream.id}
                                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-lg dark:hover:bg-slate-900/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {dream.profile.avatar_url ? (
                                                    <img
                                                        src={dream.profile.avatar_url}
                                                        alt={getAuthorName(dream.profile)}
                                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-sky-300 flex items-center justify-center text-slate-950 text-xs font-semibold">
                                                        {getAuthorInitial(dream.profile)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{dream.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        by {getAuthorName(dream.profile)} • {new Date(dream.dream_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-700 dark:text-slate-300 text-sm mb-4">{dream.snippet}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {dream.dream_moods?.map(({ mood }: { mood: { id: string; name: string; emoji: string; color: string } }) => (
                                            <span key={mood.id} className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200 font-medium">
                                                {mood.emoji} {mood.name}
                                            </span>
                                        ))}
                                    </div>

                                    {dream.interpretation && (
                                        <div className="p-3 rounded-lg bg-violet-50 dark:bg-slate-950/40 border border-violet-200 dark:border-slate-800/40 mb-4">
                                            <p className="text-xs text-violet-700 dark:text-slate-400 mb-1 font-medium">Interpretation</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-200">{dream.interpretation}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => toggleDreamLove(dream.id)}
                                            className={`flex items-center gap-1 text-sm transition-all font-medium ${dream.isLiked
                                                ? 'text-red-500'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart size={16} fill={dream.isLiked ? 'currentColor' : 'none'} />
                                            <span>{dream.likeCount || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => toggleComments(dream.id)}
                                            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition-colors font-medium"
                                        >
                                            <MessageCircle size={16} />
                                            <span>Comment</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-colors font-medium">
                                            <Share2 size={16} />
                                            <span>Share</span>
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    {expandedComments.has(dream.id) && (
                                        <DreamComments
                                            dreamId={dream.id}
                                            commentText={commentText[dream.id] || ''}
                                            onCommentChange={(text) => setCommentText(prev => ({ ...prev, [dream.id]: text }))}
                                            onSubmit={() => handleSubmitComment(dream.id)}
                                            isSubmitting={commentMutation.isPending}
                                            currentUser={user}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar - Articles */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-4">Dream Articles</h2>
                            <div className="space-y-4">
                                {articles.map(article => (
                                    <div
                                        key={article.id}
                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-md dark:hover:bg-slate-900/50 transition-all cursor-pointer"
                                    >
                                        <div className="mb-2">
                                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200">
                                                {article.category}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{article.title}</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{article.preview}</p>

                                        <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/40">
                                            <button
                                                className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                            >
                                                <Heart size={14} fill="none" />
                                                <span>{article.loves}</span>
                                            </button>
                                            <button className="ml-auto text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-xs font-medium">
                                                Read More →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
