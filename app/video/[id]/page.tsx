'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function VideoPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [video, setVideo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [playerError, setPlayerError] = useState<string | null>(null)
    const [watchStartTime, setWatchStartTime] = useState(Date.now())
    const [isPlaying, setIsPlaying] = useState(false)

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url?.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const user = session?.user as any
    const isPremium = user?.subscriptionStatus === 'ACTIVE'
    const canWatchFull = video?.accessType === 'FREE' || isPremium

    useEffect(() => {
        if (id) {
            fetchVideo()
        }
    }, [id])

    useEffect(() => {
        // Track watch time when component unmounts
        return () => {
            if (video) {
                trackWatchTime()
            }
        }
    }, [video])

    const fetchVideo = async () => {
        try {
            const response = await fetch(`/api/videos/${id}`)
            const data = await response.json()
            setVideo(data)
        } catch (error) {
            console.error('Error fetching video:', error)
            toast.error('Failed to load video')
        } finally {
            setLoading(false)
        }
    }

    const trackWatchTime = async () => {
        const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000)
        if (watchDuration > 5) { // Only track if watched for more than 5 seconds
            try {
                await fetch('/api/watch-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoId: id,
                        watchTimeSeconds: watchDuration,
                    }),
                })
            } catch (error) {
                console.error('Error tracking watch time:', error)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        )
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
                    <p className="text-white text-xl mb-4">Video not found</p>
                    <Link href="/home" className="text-purple-400 hover:text-purple-300">
                        Go back home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="glass rounded-2xl overflow-hidden">
                    {/* Video Player */}
                    <div className="aspect-video bg-black relative group">
                        {(() => {
                            const youtubeId = getYouTubeId(video.videoUrl)

                            if (youtubeId) {
                                if (!isPlaying) {
                                    return (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-cover bg-center cursor-pointer"
                                            style={{ backgroundImage: `url(${video.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`})` }}
                                            onClick={() => setIsPlaying(true)}
                                        >
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                            <button
                                                className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 group-hover:scale-110 transition-transform"
                                            >
                                                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
                                            </button>
                                        </div>
                                    )
                                }

                                return (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                )
                            }

                            return (
                                <ReactPlayer
                                    url={video.videoUrl}
                                    width="100%"
                                    height="100%"
                                    controls
                                    playing={false}
                                    onReady={() => console.log('Player Ready')}
                                    onStart={() => console.log('Player Started')}
                                    onError={(e: any) => {
                                        console.error('ReactPlayer Error:', e)
                                        setPlayerError(e?.message || 'Error playing video')
                                    }}
                                />
                            )
                        })()}
                    </div>

                    {/* Video Info */}
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
                                <div className="flex items-center gap-2">
                                    {video.accessType === 'PREMIUM' && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full">
                                            PREMIUM
                                        </span>
                                    )}
                                    {video.accessType === 'FREE' && (
                                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                                            FREE
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">{video.description}</p>

                        {/* Premium Content Warning */}
                        {!canWatchFull && (
                            <div className="glass rounded-lg p-6 border-2 border-purple-500">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    🔒 Premium Content
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    This is a premium video. You're currently watching the trailer (first {video.trailerDurationSeconds} seconds).
                                    Upgrade to Premium to watch the full video!
                                </p>
                                <Link
                                    href="/pricing"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                                >
                                    Upgrade to Premium
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
