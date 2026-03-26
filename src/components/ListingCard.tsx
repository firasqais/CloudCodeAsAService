'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, Wifi, Car, Droplets, BadgeCheck, Eye } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import type { ListingWithDetails } from '@/types'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface ListingCardProps {
  listing: ListingWithDetails
  onFavoriteToggle?: (id: string, favorited: boolean) => void
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  room: 'Room', flat: 'Flat', house: 'House', pg: 'PG', roommate: 'Roommate', hostel: 'Hostel'
}

const FURNISHING_COLORS: Record<string, string> = {
  furnished: 'bg-green-100 text-green-700',
  'semi-furnished': 'bg-yellow-100 text-yellow-700',
  unfurnished: 'bg-gray-100 text-gray-700',
}

export default function ListingCard({ listing, onFavoriteToggle }: ListingCardProps) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(listing.isFavorited ?? false)
  const [loading, setLoading] = useState(false)

  const mainImage = listing.images?.[0]?.url || '/placeholder-room.jpg'

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error('Please login to save listings')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
      onFavoriteToggle?.(listing.id, data.favorited)
      toast.success(data.favorited ? 'Saved!' : 'Removed from saved')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.area)}&background=random&size=400`
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className="bg-nepal-red text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
            </span>
            {listing.isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            disabled={loading}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
          </button>

          {/* Views */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3" />
            {listing.views}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="text-xl font-bold text-nepal-red">
                रू {listing.price.toLocaleString('en-NP')}
              </span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            {listing.negotiable && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                Negotiable
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1.5">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{listing.area}, {listing.city.charAt(0).toUpperCase() + listing.city.slice(1)}</span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', FURNISHING_COLORS[listing.furnishing] || 'bg-gray-100 text-gray-600')}>
              {listing.furnishing.replace('-', ' ')}
            </span>
            {listing.bedrooms > 0 && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {listing.bedrooms} BHK
              </span>
            )}
            {listing.preferredGender && listing.preferredGender !== 'any' && (
              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full capitalize">
                {listing.preferredGender} only
              </span>
            )}
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
            {listing.wifi && <div className="flex items-center gap-0.5"><Wifi className="w-3 h-3" /> WiFi</div>}
            {listing.parking && <div className="flex items-center gap-0.5"><Car className="w-3 h-3" /> Parking</div>}
            {listing.water24hrs && <div className="flex items-center gap-0.5"><Droplets className="w-3 h-3" /> 24hr Water</div>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                {listing.user?.avatar ? (
                  <img src={listing.user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-gray-500">
                    {listing.user?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">{listing.user?.name}</span>
              {listing.user?.isVerified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            <span className="text-xs text-gray-400">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
