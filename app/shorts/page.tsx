'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

export default function ShortsPage() {
    const { data: session } = useSession()
    const [shorts, setShorts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchShorts()
    }, [])

    const fetchShorts = async () => {
        try {
            const response = await fetch('/api/videos?type=SHORT')
            const data = await response.json()
            setShorts(data)
        } catch (error) {
            console.error('Error fetching shorts:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            <Navbar />

            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Shorts</h1>
                    <p className="text-gray-300">Quick, engaging content</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : shorts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No shorts available yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {shorts.map((short: any) => (
                            <div key={short.id} className="glass rounded-2xl overflow-hidden">
                                <div className="aspect-[9/16] max-h-[80vh] bg-black">
                                    <ReactPlayer
                                        url={short.videoUrl}
                                        width="100%"
                                        height="100%"
                                        controls
                                        playing={false}
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1">{short.title}</h3>
                                            <p className="text-gray-300 text-sm">{short.description}</p>
                                        </div>
                                        {short.accessType === 'PREMIUM' && (
                                            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded">
                                                PREMIUM
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
