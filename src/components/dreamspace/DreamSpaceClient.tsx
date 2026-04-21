'use client'

import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, Send } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { likeDream, unlikeDream } from '@/lib/services/dreams'
import { getComments, createComment, type Comment } from '@/lib/services/comments'

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
    moods?: any[]
    dream_moods?: any[]
    interpretation: string | null
    likeCount: number
    isLiked: boolean
}

// Dream Comments Component
function DreamComments({
    dreamId,
    currentUser
}: {
    dreamId: string
    currentUser: any
}) {
    const [commentText, setCommentText] = useState('')
    const queryClient = useQueryClient()

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', dreamId],
        queryFn: () => getComments(dreamId),
    })

    const commentMutation = useMutation({
        mutationFn: (content: string) => createComment(dreamId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', dreamId] })
            setCommentText('')
        },
    })

    const getAuthorName = (profile: any) => profile.full_name || profile.username || 'Anonymous'

    return (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && commentMutation.mutate(commentText)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                    onClick={() => commentMutation.mutate(commentText)}
                    disabled={!commentText.trim() || commentMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    <Send size={14} />
                    {commentMutation.isPending ? '...' : 'Send'}
                </button>
            </div>

            {isLoading ? (
                <div className="text-sm text-slate-400">Loading comments...</div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-2">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-sky-300 flex items-center justify-center text-slate-950 text-[10px] font-semibold">
                                {getAuthorName(comment.profile).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{getAuthorName(comment.profile)}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function DreamCard({ dream, currentUser }: { dream: SharedDream, currentUser: any }) {
    const [isLiked, setIsLiked] = useState(dream.isLiked)
    const [likeCount, setLikeCount] = useState(dream.likeCount)
    const [showComments, setShowComments] = useState(false)

    const toggleLike = async () => {
        if (!currentUser) return
        const prevLiked = isLiked
        setIsLiked(!isLiked)
        setLikeCount(prev => prev + (isLiked ? -1 : 1))
        
        try {
            if (prevLiked) await unlikeDream(dream.id)
            else await likeDream(dream.id)
        } catch (e) {
            setIsLiked(prevLiked)
            setLikeCount(dream.likeCount)
        }
    }

    const getAuthorName = (profile: any) => profile.full_name || profile.username || 'Anonymous'

    return (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-sky-300 flex items-center justify-center text-slate-950 text-xs font-semibold">
                    {getAuthorName(dream.profile).charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{dream.title}</h3>
                    <p className="text-xs text-slate-500">by {getAuthorName(dream.profile)} • {new Date(dream.dream_date).toLocaleDateString()}</p>
                </div>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 leading-relaxed">{dream.snippet}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {(dream.dream_moods || []).map(({ mood }: any) => (
                    <span key={mood.id} className="px-2 py-1 text-xs rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200">
                        {mood.emoji} {mood.name}
                    </span>
                ))}
            </div>

            {dream.interpretation && (
                <div className="p-3 rounded-lg bg-violet-50 dark:bg-slate-950/40 border border-violet-200 dark:border-slate-800/40 mb-4 text-sm italic text-slate-700 dark:text-slate-300">
                    {dream.interpretation}
                </div>
            )}

            <div className="flex items-center gap-4">
                <button onClick={toggleLike} className={`flex items-center gap-1 text-sm font-medium ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}>
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likeCount}</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-slate-500 hover:text-violet-600 text-sm font-medium">
                    <MessageCircle size={16} />
                    <span>Comment</span>
                </button>
                <button className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium">
                    <Share2 size={16} />
                    <span>Share</span>
                </button>
            </div>

            {showComments && <DreamComments dreamId={dream.id} currentUser={currentUser} />}
        </div>
    )
}

export default function DreamSpaceClient({ initialDreams, currentUser }: { initialDreams: any[], currentUser: any }) {
    return (
        <div className="space-y-6">
            {initialDreams.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-400">No shared dreams yet</p>
                </div>
            ) : (
                initialDreams.map(dream => (
                    <DreamCard key={dream.id} dream={dream} currentUser={currentUser} />
                ))
            )}
        </div>
    )
}
