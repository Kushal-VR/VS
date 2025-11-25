'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import { formatWatchTime, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState('account')
    const [watchHistory, setWatchHistory] = useState([])
    const [totalWatchTime, setTotalWatchTime] = useState(0)
    const [name, setName] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const user = session?.user as any

    useEffect(() => {
        if (user) {
            setName(user.name || '')
        }
        fetchWatchHistory()
    }, [user])

    const fetchWatchHistory = async () => {
        try {
            const response = await fetch('/api/watch-history')
            const data = await response.json()
            setWatchHistory(data)

            const total = data.reduce((sum: number, item: any) => sum + item.totalWatchTimeSeconds, 0)
            setTotalWatchTime(total)
        } catch (error) {
            console.error('Error fetching watch history:', error)
        }
    }

    const handleUpdateName = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (response.ok) {
                toast.success('Name updated successfully!')
                setIsEditing(false)
            } else {
                toast.error('Failed to update name')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
                    <p className="text-gray-300">Manage your account and view your activity</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto">
                    {['account', 'subscription', 'history', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === tab
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : 'glass text-gray-300 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="glass rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                                        />
                                        <button
                                            onClick={handleUpdateName}
                                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-white text-lg">{user?.name || 'Not set'}</p>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                                <p className="text-white text-lg">{user?.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-200 mb-2">Role</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${user?.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'
                                    }`}>
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                    <div className="glass rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Subscription</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-200 mb-2">Current Plan</label>
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-2 rounded-full text-lg font-semibold ${user?.subscriptionStatus === 'ACTIVE'
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                        : 'bg-gray-600 text-white'
                                    }`}>
                                    {user?.subscriptionStatus === 'ACTIVE' ? 'Premium' : 'Free'}
                                </span>
                            </div>
                        </div>

                        {user?.subscriptionStatus !== 'ACTIVE' && (
                            <div className="mt-6">
                                <a
                                    href="/pricing"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700"
                                >
                                    Upgrade to Premium
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Watch History Tab */}
                {activeTab === 'history' && (
                    <div className="glass rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Watch History</h2>

                        {watchHistory.length === 0 ? (
                            <p className="text-gray-400">No watch history yet</p>
                        ) : (
                            <div className="space-y-4">
                                {watchHistory.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                                        <div className="w-32 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                            {item.video.thumbnailUrl && (
                                                <img src={item.video.thumbnailUrl} alt={item.video.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold">{item.video.title}</h3>
                                            <p className="text-gray-400 text-sm">
                                                Watched {formatWatchTime(item.totalWatchTimeSeconds)} • {formatDate(item.lastWatchedAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="glass rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Watch Time Analytics</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-lg p-6">
                                <p className="text-gray-400 text-sm mb-2">Total Watch Time</p>
                                <p className="text-4xl font-bold text-white">{formatWatchTime(totalWatchTime)}</p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-6">
                                <p className="text-gray-400 text-sm mb-2">Videos Watched</p>
                                <p className="text-4xl font-bold text-white">{watchHistory.length}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
