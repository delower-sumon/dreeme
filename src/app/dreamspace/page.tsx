import React from 'react'
import { getSharedDreamsServer } from '@/lib/data/dreams'
import DreamSpaceClient from '@/components/dreamspace/DreamSpaceClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'

export default async function DreamSpacePage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect('/auth/login')
    }

    const sharedDreams = await getSharedDreamsServer()

    const articles = [
        {
            id: 'art-1',
            title: 'Why Your Brain Loves Dreaming',
            preview: 'Explore the fascinating neuroscience behind dreams and why they matter for your wellbeing.',
            category: 'Science',
            loves: 156,
        },
        {
            id: 'art-2',
            title: 'The Science of Lucid Dreaming',
            preview: 'Learn techniques to achieve lucid dreams and explore your inner world consciously.',
            category: 'Techniques',
            loves: 142,
        },
        {
            id: 'art-3',
            title: 'Nightmares as Emotional Detox',
            preview: 'Understanding how nightmares help your mind process and release emotional tension.',
            category: 'Psychology',
            loves: 134,
        },
    ]

    return (
        <div className="min-h-full pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-2 font-outfit">DreamSpace</h1>
                    <p className="text-slate-600 dark:text-slate-400">Explore dreams shared by our community</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Shared Dreams */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 font-outfit">Shared Dreams</h2>
                        <DreamSpaceClient initialDreams={sharedDreams} currentUser={session.user} />
                    </div>

                    {/* Sidebar - Articles */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-6 font-outfit">Dream Articles</h2>
                            <div className="space-y-4">
                                {articles.map(article => (
                                    <div
                                        key={article.id}
                                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 hover:shadow-lg transition-all group"
                                    >
                                        <div className="mb-3">
                                            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                                {article.category}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 font-outfit group-hover:text-violet-600 transition-colors">{article.title}</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{article.preview}</p>

                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Heart size={14} className="text-slate-400" />
                                                <span>{article.loves}</span>
                                            </div>
                                            <button className="ml-auto text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-200 transition-colors text-xs font-bold uppercase tracking-wide">
                                                Read More
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/20">
                                    <h3 className="font-bold mb-2 font-outfit">Join the Oracle</h3>
                                    <p className="text-xs text-violet-100 mb-4 opacity-90 leading-relaxed">Share your dreams and let the collective wisdom of the community guide your journey.</p>
                                    <button className="w-full py-2 bg-white text-violet-600 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
