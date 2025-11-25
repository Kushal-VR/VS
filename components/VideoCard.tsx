import Link from 'next/link'
import { motion } from 'framer-motion'

interface VideoCardProps {
    video: {
        id: string
        title: string
        description: string
        thumbnailUrl: string | null
        accessType: 'FREE' | 'PREMIUM'
        videoType: 'LONG' | 'SHORT'
    }
}

export default function VideoCard({ video }: VideoCardProps) {
    return (
        <Link href={`/video/${video.id}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
            >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                            <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                        </div>
                    )}

                    {/* Premium Badge */}
                    {video.accessType === 'PREMIUM' && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded">
                            PREMIUM
                        </div>
                    )}
                </div>

                <div className="mt-3">
                    <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-purple-400 transition">
                        {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {video.description}
                    </p>
                </div>
            </motion.div>
        </Link>
    )
}
