'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import {
  Home, Plus, Heart, MessageCircle, User, LogOut,
  Menu, X, ChevronDown, Bell, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHome = pathname === '/'

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || !isHome
        ? 'bg-white shadow-md'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-nepal-red rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              'font-bold text-xl',
              scrolled || !isHome ? 'text-gray-900' : 'text-white'
            )}>
              कोठा Nepal
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/listings"
              className={cn(
                'text-sm font-medium hover:text-nepal-red transition-colors',
                scrolled || !isHome ? 'text-gray-700' : 'text-white'
              )}
            >
              Find Room
            </Link>
            <Link
              href="/listings?listingType=roommate"
              className={cn(
                'text-sm font-medium hover:text-nepal-red transition-colors',
                scrolled || !isHome ? 'text-gray-700' : 'text-white'
              )}
            >
              Find Flatmate
            </Link>
            {session ? (
              <>
                <Link
                  href="/listings/create"
                  className="bg-nepal-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium hover:text-nepal-red transition-colors',
                      scrolled || !isHome ? 'text-gray-700' : 'text-white'
                    )}
                  >
                    <div className="w-8 h-8 bg-nepal-red rounded-full flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {session.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <Home className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/favorites" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <Heart className="w-4 h-4" /> Saved
                      </Link>
                      <Link href="/messages" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <MessageCircle className="w-4 h-4" /> Messages
                      </Link>
                      <Link href={`/profile/${session.user?.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); setDropdownOpen(false) }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    'text-sm font-medium hover:text-nepal-red transition-colors',
                    scrolled || !isHome ? 'text-gray-700' : 'text-white'
                  )}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="bg-nepal-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg',
              scrolled || !isHome ? 'text-gray-700' : 'text-white'
            )}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link href="/listings" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Find Room
            </Link>
            <Link href="/listings?listingType=roommate" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Find Flatmate
            </Link>
            {session ? (
              <>
                <Link href="/listings/create" className="block py-2 text-nepal-red text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  + Post Ad
                </Link>
                <Link href="/dashboard" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/favorites" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Saved Listings
                </Link>
                <Link href="/messages" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Messages
                </Link>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                  className="block w-full text-left py-2 text-red-600 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-700 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/register" className="block py-2 text-nepal-red text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
