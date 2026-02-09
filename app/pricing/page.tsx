'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Script from 'next/script'
import { createPaymentOrder, verifyPayment, type RazorpayResponseType } from '@/app/api/razorpay/actions'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const user = session?.user as any

    const handleSubscribe = async (plan: 'MONTHLY' | 'YEARLY') => {
        if (!session) {
            window.location.href = '/api/auth/signin'
            return
        }

        setLoading(true)
        try {
            const paymentData = await createPaymentOrder(plan)

            const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: "INR",
                name: "Quira Stream",
                description: `${plan === "MONTHLY" ? "Monthly" : "Yearly"} Subscription`,
                order_id: paymentData.orderId,
                handler: async function (response: RazorpayResponseType) {
                    try {
                        const success = await verifyPayment(
                            paymentData.paymentId,
                            response
                        )
                        if (success) {
                            toast.success("Payment successful! Welcome to Premium!")
                            router.push("/")
                        } else {
                            toast.error("Payment verification failed")
                        }
                    } catch {
                        toast.error("Payment verification failed")
                    }
                },
                prefill: {
                    email: session.user?.email,
                    name: session.user?.name || "",
                },
                theme: {
                    color: "#9333EA",
                    backdrop_color: "#1F2937",
                },
            }

            // @ts-expect-error Razorpay types
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error) {
            console.error('Error creating payment order:', error)
            toast.error('Failed to start checkout')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 bg-white dark:bg-transparent">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <main className="max-w-6xl mx-auto pt-10 pb-16">
                <div className="text-center mb-16 border-b border-gray-200 dark:border-white/10 pb-12">
                    <h1 className="text-6xl font-black text-black dark:text-white mb-4 uppercase tracking-tight">Choose Your Plan</h1>
                    <p className="text-xl text-gray-700 dark:text-gray-400 font-medium">Unlock exclusive high-fidelity content and elite features</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-gray-200 dark:border-white/10 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">Free</h3>
                        <div className="text-6xl font-black text-black dark:text-white mb-8 flex items-baseline">
                            ₹0<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-1">/month</span>
                        </div>
                        <ul className="space-y-5 mb-10">
                            {[
                                'Watch trailers of premium videos',
                                'Full access to free videos',
                                'Free shorts only',
                                'Watch history tracking',
                                'Basic analytics',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 font-bold text-sm">
                                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            disabled
                            className="w-full py-4 px-6 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-black rounded-2xl cursor-not-allowed uppercase tracking-widest text-xs"
                        >
                            Current Plan
                        </button>
                    </div>

                    {/* Monthly Premium Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-gray-200 dark:border-white/10 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">Monthly</h3>
                        <div className="text-6xl font-black text-black dark:text-white mb-8 flex items-baseline line-clamp-1">
                            ₹99<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-1">/month</span>
                        </div>
                        <ul className="space-y-5 mb-10">
                            {[
                                'Full access to ALL premium videos',
                                'All free content included',
                                'Premium + free shorts feed',
                                'Advanced analytics',
                                'Watch history tracking',
                                'Cancel anytime',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 font-bold text-sm">
                                    <CheckIcon className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe('MONTHLY')}
                            disabled={loading || user?.subscriptionStatus === 'ACTIVE'}
                            className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-[0_12px_30px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_12px_30px_-5px_rgba(255,255,255,0.1)] uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : user?.subscriptionStatus === 'ACTIVE' ? 'Current Plan' : 'Subscribe Monthly'}
                        </button>
                    </div>

                    {/* Yearly Premium Plan */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border-2 border-primary relative shadow-xl transform scale-105">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            BEST VALUE
                        </div>
                        <h3 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-tight">Yearly</h3>
                        <div className="text-6xl font-black text-black dark:text-white mb-2 flex items-baseline line-clamp-1">
                            ₹999<span className="text-lg text-gray-500 dark:text-gray-400 font-bold ml-1">/year</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-6">Save over 16%!</p>
                        <ul className="space-y-5 mb-10">
                            {[
                                'Full access to ALL premium videos',
                                'All free content included',
                                'Premium + free shorts feed',
                                'Advanced analytics',
                                'Watch history tracking',
                                'Cancel anytime',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start text-gray-700 dark:text-gray-300 font-bold text-sm">
                                    <CheckIcon className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe('YEARLY')}
                            disabled={loading || user?.subscriptionStatus === 'ACTIVE'}
                            className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-[0_12px_30px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_12px_30px_-5px_rgba(255,255,255,0.1)] uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : user?.subscriptionStatus === 'ACTIVE' ? 'Current Plan' : 'Subscribe Yearly'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
