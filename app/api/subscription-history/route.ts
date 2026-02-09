import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Fetch all completed payments with their corresponding subscriptions
        const payments = await prisma.payment.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED',
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Fetch all subscriptions for the user
        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Combine payment and subscription data
        const history = payments.map((payment) => {
            // Find the corresponding subscription (match by creation time proximity)
            const subscription = subscriptions.find(
                (sub) =>
                    Math.abs(sub.createdAt.getTime() - payment.createdAt.getTime()) < 60000 // Within 1 minute
            )

            return {
                id: payment.id,
                paymentDate: payment.createdAt,
                amount: payment.amount,
                plan: payment.plan,
                subscriptionEndDate: subscription?.currentPeriodEnd || null,
                status: payment.status,
            }
        })

        return NextResponse.json(history)
    } catch (error) {
        console.error('Error fetching subscription history:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subscription history' },
            { status: 500 }
        )
    }
}
