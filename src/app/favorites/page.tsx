'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'
import ListingCard from '@/components/ListingCard'
import type { ListingWithDetails } from '@/types'
import Link from 'next/link'

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [listings, setListings] = useState<ListingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      fetch('/api/favorites')
        .then(r => r.json())
        .then(data => setListings(data.map((l: any) => ({ ...l, isFavorited: true }))))
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const handleFavoriteToggle = (id: string, favorited: boolean) => {
    if (!favorited) setListings(prev => prev.filter(l => l.id !== id))
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-nepal-red" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-nepal-red" />
            Saved Listings
          </h1>
          <p className="text-gray-500 mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''} saved</p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No saved listings</h3>
            <p className="text-gray-400 mb-6">Browse listings and save the ones you like</p>
            <Link href="/listings" className="bg-nepal-red text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
