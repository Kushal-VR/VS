"use server";

import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type RazorpayResponseType = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

// Plan prices in rupees
const PLAN_PRICES = {
    MONTHLY: 99.0,
    YEARLY: 999.0,
};

// Function to ensure last decimal is 0
function adjustAmount(amount: number): number {
    // Convert to paise and ensure last digit is 0
    const amountInPaise = Math.floor(amount * 100);
    return amountInPaise - (amountInPaise % 10);
}

export async function createPaymentOrder(plan: "MONTHLY" | "YEARLY") {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error("User not authenticated");
    }

    // Check if environment variables are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay credentials missing:", {
            keyId: process.env.RAZORPAY_KEY_ID ? "present" : "missing",
            keySecret: process.env.RAZORPAY_KEY_SECRET ? "present" : "missing",
        });
        throw new Error("Razorpay credentials not configured");
    }

    // Initialize Razorpay with explicit credentials
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Get user profile
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const baseAmount = PLAN_PRICES[plan];
    const adjustedAmount = adjustAmount(baseAmount);

    const options = {
        amount: adjustedAmount, // Already in paise with last digit as 0
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId: user.id,
                plan,
                amount: baseAmount, // Store original amount
                orderId: order.id,
                status: "PENDING",
                name: user.name || "Unknown",
                email: user.email,
                phone: "N/A",
                address: "N/A",
            },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID,
            paymentId: payment.id,
        };
    } catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw error;
    }
}

export async function verifyPayment(
    paymentId: string,
    response: RazorpayResponseType
) {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.orderId !== response.razorpay_order_id) {
        throw new Error("Order ID mismatch");
    }

    const isValidSignature = validateWebhookSignature(
        `${response.razorpay_order_id}|${response.razorpay_payment_id}`,
        response.razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET!
    );

    if (isValidSignature) {
        // Update payment status
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "COMPLETED",
                paymentId: response.razorpay_payment_id,
            },
        });

        // Calculate subscription period
        const now = new Date();
        const periodEnd = new Date(now);

        if (payment.plan === "MONTHLY") {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Update user subscription status
        await prisma.user.update({
            where: { id: payment.userId },
            data: {
                subscriptionStatus: "ACTIVE",
            },
        });

        // Create or update subscription record
        await prisma.subscription.upsert({
            where: { razorpaySubscriptionId: response.razorpay_payment_id },
            create: {
                userId: payment.userId,
                razorpaySubscriptionId: response.razorpay_payment_id,
                razorpayPlanId: payment.plan,
                plan: payment.plan,
                status: "active",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
            update: {
                status: "active",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
        });

        return true;
    }

    return false;
}
