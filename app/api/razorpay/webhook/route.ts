import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-razorpay-signature')!

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    try {
        // Verify webhook signature
        const isValidSignature = validateWebhookSignature(
            body,
            signature,
            process.env.RAZORPAY_KEY_SECRET!
        )

        if (!isValidSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const event = JSON.parse(body)

        // Handle different webhook events
        switch (event.event) {
            case 'payment.captured': {
                const paymentEntity = event.payload.payment.entity

                // Find payment by order ID
                const payment = await prisma.payment.findUnique({
                    where: { orderId: paymentEntity.order_id },
                })

                if (payment) {
                    // Update payment status
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'COMPLETED',
                            paymentId: paymentEntity.id,
                        },
                    })

                    // Calculate subscription period
                    const now = new Date()
                    const periodEnd = new Date(now)

                    if (payment.plan === 'MONTHLY') {
                        periodEnd.setMonth(periodEnd.getMonth() + 1)
                    } else {
                        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
                    }

                    // Update user subscription status
                    await prisma.user.update({
                        where: { id: payment.userId },
                        data: {
                            subscriptionStatus: 'ACTIVE',
                        },
                    })

                    // Create subscription record
                    await prisma.subscription.create({
                        data: {
                            userId: payment.userId,
                            razorpaySubscriptionId: paymentEntity.id,
                            razorpayPlanId: payment.plan,
                            plan: payment.plan,
                            status: 'active',
                            currentPeriodStart: now,
                            currentPeriodEnd: periodEnd,
                        },
                    })
                }
                break
            }

            case 'payment.failed': {
                const paymentEntity = event.payload.payment.entity

                // Find payment by order ID
                const payment = await prisma.payment.findUnique({
                    where: { orderId: paymentEntity.order_id },
                })

                if (payment) {
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'FAILED',
                        },
                    })
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
