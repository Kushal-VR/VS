export interface Video {
    id: string
    title: string
    description: string
    videoType: 'LONG' | 'SHORT'
    accessType: 'FREE' | 'PREMIUM'
    videoUrl: string
    trailerDurationSeconds: number | null
    thumbnailUrl: string | null
    createdById: string
    createdAt: Date
    updatedAt: Date
}

export interface WatchHistory {
    id: string
    userId: string
    videoId: string
    lastWatchedAt: Date
    totalWatchTimeSeconds: number
    video?: Video
}

export interface UserProfile {
    id: string
    name: string | null
    email: string
    image: string | null
    role: 'USER' | 'ADMIN'
    subscriptionStatus: 'NONE' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE'
}
