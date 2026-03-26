'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Home, Eye, Heart, MessageCircle, Edit, Trash2,
  ToggleLeft, ToggleRight, TrendingUp, Star, BadgeCheck, Loader2
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DashboardData {
  listings: any[]
  stats: {
    totalListings: number
    activeListings: number
    totalViews: number
    favorites: number
    conversations: number
    unreadMessages: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/dashboard')
        .then(r => r.json())
        .then(setData)
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const toggleListing = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      setData(prev => prev ? {
        ...prev,
        listings: prev.listings.map(l => l.id === id ? { ...l, isActive: !isActive } : l)
      } : null)
      toast.success(isActive ? 'Listing deactivated' : 'Listing activated')
    } catch { toast.error('Failed to update') }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      setData(prev => prev ? { ...prev, listings: prev.listings.filter(l => l.id !== id) } : null)
      toast.success('Listing deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-nepal-red" />
      </div>
    )
  }

  if (!session) return null

  const stats = data?.stats
  const listings = data?.listings || []

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-0.5">Welcome back, {session.user?.name?.split(' ')[0]}</p>
          </div>
          <Link href="/listings/create"
            className="flex items-center gap-2 bg-nepal-red text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Post New Ad
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Ads', value: stats?.totalListings || 0, icon: Home, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active Ads', value: stats?.activeListings || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'text-purple-600 bg-purple-50' },
            { label: 'Saved by', value: stats?.favorites || 0, icon: Heart, color: 'text-red-600 bg-red-50' },
            { label: 'Messages', value: stats?.conversations || 0, icon: MessageCircle, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Unread', value: stats?.unreadMessages || 0, icon: MessageCircle, color: 'text-nepal-red bg-red-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/listings/create', label: 'Post New Ad', icon: Plus, color: 'bg-nepal-red text-white' },
            { href: '/messages', label: 'Messages' + (stats?.unreadMessages ? ` (${stats.unreadMessages})` : ''), icon: MessageCircle, color: 'bg-blue-600 text-white' },
            { href: '/favorites', label: 'Saved Listings', icon: Heart, color: 'bg-pink-600 text-white' },
            { href: `/profile/${session.user?.id}`, label: 'Edit Profile', icon: BadgeCheck, color: 'bg-gray-700 text-white' },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm ${color} hover:opacity-90 transition-opacity`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Your Listings ({listings.length})</h2>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-500 mb-1">No listings yet</h3>
              <p className="text-gray-400 text-sm mb-5">Start by posting your first room or property ad</p>
              <Link href="/listings/create" className="bg-nepal-red text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
                Post First Ad
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.map((listing: any) => (
                <div key={listing.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                  {/* Image */}
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/listings/${listing.id}`}
                          className="font-semibold text-gray-900 hover:text-nepal-red transition-colors text-sm line-clamp-1">
                          {listing.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="font-semibold text-nepal-red">रू {listing.price.toLocaleString()}/mo</span>
                          <span>{listing.area}, {listing.city}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{listing._count.favorites}</span>
                          <span>{timeAgo(listing.createdAt)}</span>
                        </div>
                      </div>
                      <span className={cn('flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                        listing.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {listing.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleListing(listing.id, listing.isActive)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Toggle active">
                      {listing.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <Link href={`/listings/${listing.id}/edit`}
                      className="p-2 text-gray-400 hover:text-nepal-red transition-colors rounded-lg hover:bg-red-50">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteListing(listing.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
