'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const user = session?.user as any

    const isAdmin = user?.role === 'ADMIN'
    const isPremium = user?.subscriptionStatus === 'ACTIVE'

    return (
        <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/home" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold gradient-text">Kushal Stream</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/home"
                            className={`text-gray-300 hover:text-white transition ${pathname === '/home' ? 'text-white font-semibold' : ''
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/shorts"
                            className={`text-gray-300 hover:text-white transition ${pathname === '/shorts' ? 'text-white font-semibold' : ''
                                }`}
                        >
                            Shorts
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={`text-purple-400 hover:text-purple-300 transition ${pathname.startsWith('/admin') ? 'text-purple-300 font-semibold' : ''
                                    }`}
                            >
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {!isPremium && (
                            <Link
                                href="/pricing"
                                className="hidden sm:block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-full hover:from-purple-700 hover:to-blue-700 transition"
                            >
                                Upgrade
                            </Link>
                        )}

                        {/* User Menu */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <UserCircleIcon className="w-8 h-8" />
                                )}
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right glass rounded-lg shadow-lg py-1 focus:outline-none">
                                    <div className="px-4 py-2 border-b border-white/10">
                                        <p className="text-sm text-white font-semibold">{user?.name || 'User'}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                href="/profile"
                                                className={`${active ? 'bg-white/10' : ''
                                                    } block px-4 py-2 text-sm text-gray-300 hover:text-white`}
                                            >
                                                Profile
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className={`${active ? 'bg-white/10' : ''
                                                    } w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white flex items-center gap-2`}
                                            >
                                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                                Sign out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    )
}
