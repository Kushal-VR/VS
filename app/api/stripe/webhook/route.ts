import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error('Webhook signature verification failed:', error.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId

                if (userId && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    )

                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            subscriptionStatus: 'ACTIVE',
                        },
                    })

                    await prisma.subscription.create({
                        data: {
                            userId,
                            stripeSubscriptionId: subscription.id,
                            stripePriceId: subscription.items.data[0].price.id,
                            status: subscription.status,
                            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                        },
                    })
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription

                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: subscription.status,
                        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    },
                })

                const sub = await prisma.subscription.findUnique({
                    where: { stripeSubscriptionId: subscription.id },
                })

                if (sub) {
                    await prisma.user.update({
                        where: { id: sub.userId },
                        data: {
                            subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'CANCELED',
                        },
                    })
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription

                const sub = await prisma.subscription.findUnique({
                    where: { stripeSubscriptionId: subscription.id },
                })

                if (sub) {
                    await prisma.user.update({
                        where: { id: sub.userId },
                        data: {
                            subscriptionStatus: 'CANCELED',
                        },
                    })

                    await prisma.subscription.update({
                        where: { stripeSubscriptionId: subscription.id },
                        data: {
                            status: 'canceled',
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
