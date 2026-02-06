'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar({ onMenuClick, isSidebarOpen }: { onMenuClick: () => void; isSidebarOpen: boolean }) {
    const pathname = usePathname()
    const router = useRouter()
    const { theme, toggleTheme } = useTheme()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollDelta = Math.abs(currentScrollY - lastScrollY)

            // Only trigger if scroll delta is significant (prevents jitter)
            if (scrollDelta < 5) return

            // Show navbar when scrolling up (anywhere on page), hide when scrolling down
            if (currentScrollY < lastScrollY) {
                // Scrolling up - show navbar
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and past 100px - hide navbar
                setIsVisible(false)
            }

            setLastScrollY(currentScrollY)
        }

        // Use requestAnimationFrame for smoother performance
        let ticking = false
        const scrollListener = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', scrollListener, { passive: true })

        return () => {
            window.removeEventListener('scroll', scrollListener)
        }
    }, [lastScrollY])

    // Don't show navbar on login/register
    if (pathname.startsWith('/auth')) return null

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-white/10 shadow-sm transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Menu Toggle + Logo */}
                    <div className="flex items-center gap-2">
                        {/* Menu Toggle - Absolute far left */}
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all hover:scale-105"
                            aria-label="Toggle menu"
                        >
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/home" className="flex items-center group">
                            <img 
                                src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                                alt="Quira Stream"
                                className="h-8 md:h-10 w-auto transition-all group-hover:scale-105"
                            />
                        </Link>
                    </div>

                    {/* Center: Search Bar (Desktop only) */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B]/50 transition-all duration-300 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchQuery.trim()) {
                                            handleSearch(searchQuery)
                                        }
                                    }}
                                    placeholder="Search videos and playlists..."
                                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Theme Switch */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="relative flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-all hover:scale-105 active:scale-95 group"
                            aria-label="Toggle theme"
                        >
                            <div className="relative w-14 h-7 flex items-center px-1">
                                {/* Moving knob */}
                                <motion.div
                                    animate={{ x: theme === 'dark' ? 28 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="z-10 w-5 h-5 rounded-full bg-white dark:bg-black shadow-md flex items-center justify-center border border-gray-200 dark:border-zinc-600"
                                >
                                    {theme === 'dark' ? (
                                        <Moon className="w-3 h-3 text-blue-400 fill-blue-400" />
                                    ) : (
                                        <Sun className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    )}
                                </motion.div>

                                {/* Background Icons */}
                                <div className="absolute inset-0 flex items-center justify-between px-2 text-gray-400 dark:text-gray-500">
                                    <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} />
                                    <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav >
    )
}
