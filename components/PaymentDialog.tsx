"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Zap } from "lucide-react";
import Script from "next/script";
import {
    createPaymentOrder,
    verifyPayment,
    type RazorpayResponseType,
} from "@/app/api/razorpay/actions";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface PricingCardProps {
    title: string;
    description: string;
    price: string;
    period: string;
    buttonText: string;
    isPopular?: boolean;
    plan: "MONTHLY" | "YEARLY";
    onPurchase: (plan: "MONTHLY" | "YEARLY") => Promise<void>;
}

const PricingCard: React.FC<PricingCardProps> = ({
    title,
    description,
    price,
    period,
    buttonText,
    isPopular = false,
    plan,
    onPurchase,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative group"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div
                className={`relative p-8 rounded-xl border ${isPopular
                    ? "border-purple-500 bg-gray-900/80 backdrop-blur-xl"
                    : "border-gray-700/50 bg-gray-900/80 backdrop-blur-xl"
                    }`}
            >
                {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg shadow-purple-900/25">
                            Most Popular
                        </span>
                    </div>
                )}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-lg">{description}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {price}
                        </span>
                        <span className="text-gray-400 text-lg">/{period}</span>
                    </div>
                    <button
                        onClick={() => onPurchase(plan)}
                        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-900/25"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {buttonText}
                            <Zap className="w-4 h-4" />
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const PaymentDialog: React.FC = () => {
    const router = useRouter();
    const { data: session, update } = useSession();

    const handlePurchase = async (plan: "MONTHLY" | "YEARLY") => {
        if (!session?.user) {
            toast.error("Please login to purchase a plan");
            router.push("/api/auth/signin");
            return;
        }

        try {
            const paymentData = await createPaymentOrder(plan);

            const options = {
                key: paymentData.key,
                amount: paymentData.amount,
                currency: "INR",
                name: "Quira Stream",
                description: `${plan === "MONTHLY" ? "Monthly" : "Yearly"} Subscription`,
                order_id: paymentData.orderId,
                handler: async function (response: RazorpayResponseType) {
                    try {
                        console.log('💳 Payment response received:', response.razorpay_payment_id);
                        const success = await verifyPayment(
                            paymentData.paymentId,
                            response
                        );
                        if (success) {
                            console.log('✅ Payment verified successfully');
                            toast.success("Payment successful! Activating your premium access...");

                            // Wait for database transaction to complete
                            console.log('⏳ Waiting for database transaction...');
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Force a full page reload to fetch fresh session
                            // This is more reliable than session.update() which can cause logout/login cycles
                            console.log('🔄 Reloading page to refresh session...');
                            window.location.href = "/";
                        } else {
                            console.log('❌ Payment verification failed');
                            toast.error("Payment verification failed");
                        }
                    } catch (error) {
                        console.error('❌ Payment handler error:', error);
                        toast.error("Payment verification failed");
                    }
                },
                prefill: {
                    email: session.user.email,
                    name: session.user.name || "",
                },
                theme: {
                    color: "#9333EA",
                    backdrop_color: "#1F2937",
                },
            };

            // @ts-expect-error Razorpay types
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            toast.error("Failed to initiate payment");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="relative max-w-6xl w-full">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1),transparent_50%)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-800/10 blur-3xl" />
                </div>

                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl p-8">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => router.push("/")}
                        className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 mb-8"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        <span className="text-lg">Back to Home</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Choose Your Plan
                        </h2>
                        <p className="text-xl text-gray-300">
                            Unlock premium content and features
                        </p>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <PricingCard
                            title="Monthly Plan"
                            description="Perfect for trying out premium features"
                            price="₹99"
                            period="month"
                            buttonText="Get Started"
                            plan="MONTHLY"
                            onPurchase={handlePurchase}
                        />
                        <PricingCard
                            title="Yearly Plan"
                            description="Best value - Save over 16%!"
                            price="₹999"
                            period="year"
                            buttonText="Get Started"
                            plan="YEARLY"
                            isPopular={true}
                            onPurchase={handlePurchase}
                        />
                    </div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-12 text-center"
                    >
                        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-purple-400" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-purple-400" />
                                <span>Instant Access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-purple-400" />
                                <span>Cancel Anytime</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDialog;
