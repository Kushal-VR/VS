'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import VideoCard from '@/components/VideoCard'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function SearchContent() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''

    const [videos, setVideos] = useState<any[]>([])
    const [playlists, setPlaylists] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'videos' | 'playlists'>('videos')

    useEffect(() => {
        if (query) {
            fetchResults()
        } else {
            setLoading(false)
        }
    }, [query])

    const fetchResults = async () => {
        setLoading(true)
        try {
            // Fetch videos
            const videosRes = await fetch(`/api/videos?type=LONG&q=${encodeURIComponent(query)}`)
            const videosData = await videosRes.json()
            setVideos(Array.isArray(videosData) ? videosData : [])

            // Fetch playlists
            const playlistsRes = await fetch(`/api/playlists?q=${encodeURIComponent(query)}`)
            const playlistsData = await playlistsRes.json()
            setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
        } catch (error) {
            console.error('Error fetching search results:', error)
            setVideos([])
            setPlaylists([])
        } finally {
            setLoading(false)
        }
    }

    if (!query) {
        return (
            <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <main className="max-w-7xl mx-auto pb-20">
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <MagnifyingGlassIcon className="w-24 h-24 text-gray-300 dark:text-gray-700 mb-6" />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Start Searching</h1>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Use the search bar above to find videos and playlists</p>
                    </div>
                </main>
            </div>
        )
    }

    const totalResults = videos.length + playlists.length

    return (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
            <main className="max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <MagnifyingGlassIcon className="w-6 h-6 text-primary" />
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                            Search Results
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                        {loading ? 'Searching...' : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === 'videos'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Videos ({videos.length})
                        {activeTab === 'videos' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === 'playlists'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Playlists ({playlists.length})
                        {activeTab === 'playlists' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-video bg-gray-200 dark:bg-zinc-800 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-full w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-full w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Videos Tab */}
                        {activeTab === 'videos' && (
                            <>
                                {videos.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-md">
                                        <div className="text-center py-20">
                                            <p className="text-gray-400 dark:text-gray-600 font-black text-2xl uppercase tracking-widest mb-3">
                                                No Videos Found
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-500 font-medium">
                                                Try searching with different keywords
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                        {videos.map((video: any) => (
                                            <VideoCard key={video.id} video={video} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Playlists Tab */}
                        {activeTab === 'playlists' && (
                            <>
                                {playlists.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-md">
                                        <div className="text-center py-20">
                                            <p className="text-gray-400 dark:text-gray-600 font-black text-2xl uppercase tracking-widest mb-3">
                                                No Playlists Found
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-500 font-medium">
                                                Try searching with different keywords
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {playlists.map((playlist: any) => (
                                            <Link
                                                key={playlist.id}
                                                href={`/home?playlistId=${playlist.id}`}
                                                className="group bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
                                                    {playlist.thumbnailUrl ? (
                                                        <img
                                                            src={playlist.thumbnailUrl}
                                                            alt={playlist.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary/40">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-3 py-1 rounded-lg text-xs font-bold">
                                                        {playlist._count?.videos || 0} videos
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {playlist.title}
                                                    </h3>
                                                    {playlist.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-medium">
                                                            {playlist.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    )
}
