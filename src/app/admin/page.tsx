import React from 'react'
import { getAdminStats } from '@/lib/data/admin'
import { redirect } from 'next/navigation'
import { Users, BookOpen, Share2, Activity, Settings, ShieldAlert } from 'lucide-react'

export default async function AdminPage() {
    const stats = await getAdminStats()

    if (!stats) {
        redirect('/admin/login')
    }

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
        { title: 'Total Dreams', value: stats.totalDreams, icon: BookOpen, color: 'violet' },
        { title: 'Shared Dreams', value: stats.totalSharedDreams, icon: Share2, color: 'emerald' },
        { title: 'Active Today', value: stats.activeToday, icon: Activity, color: 'sky' },
    ]

    return (
        <div className="min-h-full pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-outfit">Admin Dashboard</h1>
                        <p className="text-slate-600 dark:text-slate-400">Manage your dream community and platform status</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <Settings size={18} />
                            Platform Settings
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">+12%</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-outfit tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity or User List placeholder */}
                    <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                             <Users size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 font-outfit mb-2">User Management</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">View and manage all registered dreamers, update roles, and moderate profiles.</p>
                        <button className="px-6 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all">
                            View Users
                        </button>
                    </div>

                    <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                             <Share2 size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 font-outfit mb-2">Content Moderation</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">Review shared dreams and comments to ensure community guidelines are followed.</p>
                        <button className="px-6 py-2 rounded-xl bg-sky-600 text-white text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-700 transition-all">
                            Review Content
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
