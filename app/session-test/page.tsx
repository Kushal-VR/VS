'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function SessionTestPage() {
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const user = session?.user as any

    const handleRefreshSession = async () => {
        setLoading(true)
        console.log('🧪 Manual session refresh triggered')
        await update()
        console.log('🧪 Manual session refresh completed')
        setLoading(false)
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Session Debug Page</h1>

                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Current Session Data</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Subscription Status</h2>
                    <p className="text-lg">
                        <strong>Status:</strong> {user?.subscriptionStatus || 'NONE'}
                    </p>
                    <p className="text-lg">
                        <strong>Role:</strong> {user?.role || 'USER'}
                    </p>
                </div>

                <button
                    onClick={handleRefreshSession}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Session'}
                </button>

                <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Instructions</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Open browser console (F12)</li>
                        <li>Complete a payment</li>
                        <li>Watch the console logs for session update messages</li>
                        <li>Or click "Refresh Session" button to manually test</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
