import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { videoId, watchTimeSeconds } = await request.json()
        const userId = (session.user as any).id

        // Upsert watch history
        const watchHistory = await prisma.watchHistory.upsert({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
            update: {
                lastWatchedAt: new Date(),
                totalWatchTimeSeconds: {
                    increment: watchTimeSeconds,
                },
            },
            create: {
                userId,
                videoId,
                totalWatchTimeSeconds: watchTimeSeconds,
            },
        })

        return NextResponse.json(watchHistory)
    } catch (error) {
        console.error('Error tracking watch history:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id

        const watchHistory = await prisma.watchHistory.findMany({
            where: { userId },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        accessType: true,
                        videoType: true,
                    },
                },
            },
            orderBy: {
                lastWatchedAt: 'desc',
            },
        })

        return NextResponse.json(watchHistory)
    } catch (error) {
        console.error('Error fetching watch history:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
