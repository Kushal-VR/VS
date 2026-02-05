'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    HomeIcon,
    QueueListIcon,
    GiftIcon,
    ClockIcon,
    VideoCameraIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    QueueListIcon as QueueListIconSolid,
    GiftIcon as GiftIconSolid,
    ClockIcon as ClockIconSolid,
    VideoCameraIcon as VideoCameraIconSolid
} from '@heroicons/react/24/solid'
import { signOut, useSession } from 'next-auth/react'

// Custom Diamond/Sparkle Icon for Premium
const DiamondIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
    </svg>
)

const DiamondIconSolid = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path
            fillRule="evenodd"
            d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
            clipRule="evenodd"
        />
    </svg>
)

const navigation = [
    { name: 'Home', href: '/home', icon: HomeIcon, iconActive: HomeIconSolid },
    { name: 'Premium', href: '/premium', icon: DiamondIcon, iconActive: DiamondIconSolid },
    { name: 'Free Videos', href: '/free', icon: GiftIcon, iconActive: GiftIconSolid },
    { name: 'Watch Later', href: '/watch-later', icon: ClockIcon, iconActive: ClockIconSolid },
    { name: 'Playlists', href: '/playlists', icon: QueueListIcon, iconActive: QueueListIconSolid },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isPlaylistContext = searchParams.get('playlistId')
    const user = session?.user as any
    const isAdmin = user?.role === 'ADMIN'

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-white/10 overflow-y-auto z-40 transition-all duration-300 transform shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="space-y-6 flex-1">
                        <div>
                            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Sections</h2>
                            <nav className="space-y-1">
                                {navigation.map((item) => {
                                    const isActive = item.href === '/home'
                                        ? (pathname === '/home' || pathname === '/') && !isPlaylistContext
                                        : item.href === '/playlists'
                                            ? pathname.startsWith('/playlists') || isPlaylistContext
                                            : pathname.startsWith(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => {
                                                // Only close sidebar on mobile (below lg breakpoint)
                                                if (window.innerWidth < 1024) {
                                                    onClose()
                                                }
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${isActive
                                                ? 'border-primary text-black dark:text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] font-bold'
                                                : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-smooth ${isActive ? 'text-black dark:text-white' : 'group-hover:text-primary'}`} />
                                            <span className="font-medium text-inherit">{item.name}</span>
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black dark:bg-white rounded-r-full" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {isAdmin && (
                            <div>
                                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-3">Admin</h2>
                                <nav className="space-y-1">
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group relative border-2 ${pathname.startsWith('/admin')
                                            ? 'border-primary text-black dark:text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] font-bold'
                                            : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'
                                            }`}
                                    >
                                        <VideoCameraIcon className={`w-5 h-5 transition-smooth ${pathname.startsWith('/admin') ? 'text-black dark:text-white' : 'group-hover:text-primary'}`} />
                                        <span className="font-medium">Admin Dashboard</span>
                                        {pathname.startsWith('/admin') && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black dark:bg-white rounded-r-full" />
                                        )}
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* User Section at Bottom */}
                    <div className="mt-auto pt-6 border-t border-gray-200 space-y-4">
                        <div className="flex items-center gap-3 px-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-primary/30">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg uppercase bg-gray-100">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <Link
                                href="/profile"
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group border-2 ${pathname === '/profile' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-transparent text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary'}`}
                            >
                                <UserIcon className={`w-5 h-5 transition-smooth ${pathname === '/profile' ? 'text-primary' : 'group-hover:text-primary'}`} />
                                <span className="font-medium">Profile Settings</span>
                            </Link>

                            {/* Upgrade to Premium - Only show for free users */}
                            {!isAdmin && user?.subscriptionStatus !== 'ACTIVE' && (
                                <Link
                                    href="/pricing"
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-3 px-3 py-3 rounded-xl transition-all group bg-black hover:bg-gray-800 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.4)]"
                                >
                                    <span className="font-bold text-white uppercase tracking-wider text-xs">Upgrade to Premium</span>
                                </Link>
                            )}

                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth group text-gray-700 dark:text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-white/5"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </aside>
        </>
    )
}
