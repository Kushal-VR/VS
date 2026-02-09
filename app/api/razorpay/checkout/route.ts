import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPaymentOrder } from '../actions'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { plan } = await request.json()

        if (!plan || (plan !== 'MONTHLY' && plan !== 'YEARLY')) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        const paymentData = await createPaymentOrder(plan)

        return NextResponse.json(paymentData)
    } catch (error) {
        console.error('Error creating payment order:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
