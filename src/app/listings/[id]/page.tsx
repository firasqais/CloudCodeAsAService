'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Heart, Share2, MapPin, Phone, MessageCircle, BadgeCheck,
  Wifi, Car, Droplets, Zap, Wind, Tv, ChevronLeft, ChevronRight,
  Eye, Star, Calendar, Users, Home, Flame, TreePine, Shield,
  Dumbbell, Waves, Sun, CookingPot, Dog, Cigarette, Beer, Clock,
  Edit, Trash2, Flag
} from 'lucide-react'
import { cn, timeAgo, LISTING_TYPES, ROOM_TYPES, FURNISHING_TYPES } from '@/lib/utils'
import type { ListingWithDetails } from '@/types'
import toast from 'react-hot-toast'

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [listing, setListing] = useState<ListingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`)
        if (!res.ok) { router.push('/listings'); return }
        const data = await res.json()
        setListing(data)
        setFavorited(data.isFavorited)
      } catch {
        router.push('/listings')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchListing()
  }, [id, router])

  const handleFavorite = async () => {
    if (!session) { toast.error('Please login to save listings'); return }
    setFavLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
      toast.success(data.favorited ? 'Saved to favorites!' : 'Removed from favorites')
    } catch { toast.error('Something went wrong') }
    finally { setFavLoading(false) }
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: listing?.title, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleSendMessage = async () => {
    if (!session) { toast.error('Please login to send messages'); return }
    if (!messageText.trim()) { toast.error('Please write a message'); return }
    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: listing?.userId,
          content: messageText,
          listingId: id,
        }),
      })
      if (res.ok) {
        toast.success('Message sent!')
        setMessageText('')
        setShowContactForm(false)
        router.push('/messages')
      }
    } catch { toast.error('Failed to send message') }
    finally { setSendingMessage(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Listing deleted'); router.push('/dashboard') }
    } catch { toast.error('Failed to delete') }
  }

  const handleReview = async () => {
    if (!session) { toast.error('Please login'); return }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revieweeId: listing?.userId,
          listingId: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Review submitted!')
        setShowReviewForm(false)
        // Refresh listing
        const r = await fetch(`/api/listings/${id}`)
        setListing(await r.json())
      } else {
        toast.error(data.error)
      }
    } catch { toast.error('Failed to submit review') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="aspect-[16/7] bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const images = listing.images || []
  const isOwner = session?.user?.id === listing.userId
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null

  const amenities = [
    { key: 'wifi', label: 'WiFi / Internet', icon: Wifi, active: listing.wifi },
    { key: 'parking', label: 'Parking', icon: Car, active: listing.parking },
    { key: 'water24hrs', label: '24hr Water Supply', icon: Droplets, active: listing.water24hrs },
    { key: 'electricity', label: 'Electricity', icon: Zap, active: listing.electricity },
    { key: 'generator', label: 'Generator Backup', icon: Zap, active: listing.generator },
    { key: 'solarPower', label: 'Solar Power', icon: Sun, active: listing.solarPower },
    { key: 'ac', label: 'Air Conditioning', icon: Wind, active: listing.ac },
    { key: 'heater', label: 'Heater', icon: Flame, active: listing.heater },
    { key: 'tv', label: 'Television', icon: Tv, active: listing.tv },
    { key: 'fridge', label: 'Refrigerator', icon: Tv, active: listing.fridge },
    { key: 'washingMachine', label: 'Washing Machine', icon: Waves, active: listing.washingMachine },
    { key: 'kitchen', label: 'Kitchen Access', icon: CookingPot, active: listing.kitchen },
    { key: 'laundry', label: 'Laundry', icon: Waves, active: listing.laundry },
    { key: 'security', label: 'Security Guard', icon: Shield, active: listing.security },
    { key: 'cctv', label: 'CCTV', icon: Shield, active: listing.cctv },
    { key: 'lift', label: 'Elevator / Lift', icon: Home, active: listing.lift },
    { key: 'garden', label: 'Garden', icon: TreePine, active: listing.garden },
    { key: 'rooftop', label: 'Rooftop Access', icon: Home, active: listing.rooftop },
    { key: 'gym', label: 'Gym', icon: Dumbbell, active: listing.gym },
  ].filter(a => a.active)

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-nepal-red">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-nepal-red">Listings</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/9] mb-4">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImage]?.url}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${listing.area}&background=random&size=800` }}
                  />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImage(i)}
                            className={cn('w-2 h-2 rounded-full transition-colors', i === currentImage ? 'bg-white' : 'bg-white/50')} />
                        ))}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImage + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-20 h-20 text-gray-600" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-nepal-red text-white text-xs font-medium px-3 py-1 rounded-full">
                  {LISTING_TYPES.find(t => t.value === listing.listingType)?.label}
                </span>
                {listing.isFeatured && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-3 py-1 rounded-full">Featured</span>
                )}
                {listing.isVerified && (
                  <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">Verified</span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={cn('flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                      i === currentImage ? 'border-nepal-red' : 'border-transparent')}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    {listing.streetAddress ? `${listing.streetAddress}, ` : ''}{listing.area}, {listing.city.charAt(0).toUpperCase() + listing.city.slice(1)}
                    {listing.landmark && ` (Near ${listing.landmark})`}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleFavorite} disabled={favLoading}
                    className={cn('w-10 h-10 rounded-xl flex items-center justify-center border transition-colors',
                      favorited ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500')}>
                    <Heart className={cn('w-5 h-5', favorited && 'fill-current')} />
                  </button>
                  <button onClick={handleShare}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-nepal-red hover:text-nepal-red transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  {isOwner && (
                    <>
                      <Link href={`/listings/${id}/edit`}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button onClick={handleDelete}
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-3xl font-bold text-nepal-red">रू {listing.price.toLocaleString('en-NP')}</span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                  {listing.negotiable && <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Negotiable</span>}
                </div>
                {listing.deposit && (
                  <div className="text-sm text-gray-500">
                    Deposit: <span className="font-medium text-gray-900">रू {listing.deposit.toLocaleString('en-NP')}</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.views} views</span>
                  <span>{timeAgo(listing.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Type', value: LISTING_TYPES.find(t => t.value === listing.listingType)?.label },
                { label: 'Room', value: ROOM_TYPES.find(t => t.value === listing.roomType)?.label },
                { label: 'Furnishing', value: listing.furnishing.replace('-', ' ') },
                { label: 'Bedrooms', value: listing.bedrooms ? `${listing.bedrooms} BHK` : 'N/A' },
                { label: 'Bathrooms', value: listing.bathrooms ? `${listing.bathrooms}` : 'N/A' },
                { label: 'Floor', value: listing.floorNumber ? `${listing.floorNumber}${listing.totalFloors ? `/${listing.totalFloors}` : ''}` : 'N/A' },
                { label: 'Area', value: listing.squareFeet ? `${listing.squareFeet} sq.ft` : 'N/A' },
                { label: 'Min Stay', value: listing.minStay || 'Flexible' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                  <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
              <h2 className="font-bold text-gray-900 mb-3">About this listing</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                <h2 className="font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bills & Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Bills */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">Bills Included</h2>
                <div className="space-y-2 text-sm">
                  <BillItem label="Water Bill" included={listing.waterBillIncluded} />
                  <BillItem label="Electricity Bill" included={listing.electricBillIncluded} />
                  <BillItem label="Internet" included={listing.internetIncluded} />
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">Preferences</h2>
                <div className="space-y-2 text-sm">
                  {listing.preferredGender && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      Preferred: <span className="font-medium capitalize">{listing.preferredGender}</span>
                    </div>
                  )}
                  {listing.preferredOccupation && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home className="w-4 h-4" />
                      Occupation: <span className="font-medium capitalize">{listing.preferredOccupation}</span>
                    </div>
                  )}
                  <PrefItem icon={Dog} label="Pets" allowed={listing.petsAllowed} />
                  <PrefItem icon={Cigarette} label="Smoking" allowed={listing.smokingAllowed} />
                  <PrefItem icon={Beer} label="Alcohol" allowed={listing.alcoholAllowed} />
                  <PrefItem icon={Users} label="Visitors" allowed={listing.visitorsAllowed} />
                  <PrefItem icon={CookingPot} label="Cooking" allowed={listing.cookingAllowed} />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
              <h2 className="font-bold text-gray-900 mb-3">Availability</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-nepal-red" />
                Available from:{' '}
                <span className="font-medium text-gray-900">
                  {new Date(listing.availableFrom).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {listing.maxOccupants > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Users className="w-4 h-4 text-nepal-red" />
                  Max occupants: <span className="font-medium text-gray-900">{listing.maxOccupants}</span>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">
                  Reviews {listing._count?.reviews ? `(${listing._count.reviews})` : ''}
                </h2>
                {session && session.user.id !== listing.userId && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm text-nepal-red font-medium hover:underline"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {avgRating && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
                  <div>
                    <StarRating rating={parseFloat(avgRating)} />
                    <span className="text-xs text-gray-400">{listing.reviews?.length} review{listing.reviews?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {showReviewForm && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)}
                        className={cn('w-8 h-8', star <= reviewRating ? 'text-yellow-400' : 'text-gray-300')}>
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-nepal-red"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleReview}
                      className="bg-nepal-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                      Submit Review
                    </button>
                    <button onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="space-y-4">
                  {listing.reviews.map(review => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-500">
                          {(review as any).reviewer?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm">{(review as any).reviewer?.name}</span>
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Landlord Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20 mb-4">
              <h3 className="font-bold text-gray-900 mb-4">Posted by</h3>
              <Link href={`/profile/${listing.user.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80">
                <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                  {listing.user.avatar ? (
                    <img src={listing.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-gray-500 text-lg">{listing.user.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">{listing.user.name}</span>
                    {listing.user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="text-xs text-gray-400">
                    Member since {new Date(listing.user.createdAt).getFullYear()}
                  </div>
                </div>
              </Link>

              {/* Contact Actions */}
              {!isOwner && (
                <div className="space-y-3">
                  {listing.user.phone && (
                    <a
                      href={`tel:+977${listing.user.phone}`}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Landlord
                    </a>
                  )}

                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full flex items-center justify-center gap-2 bg-nepal-red text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </button>

                  {listing.user.phone && (
                    <a
                      href={`https://wa.me/977${listing.user.phone}?text=Hi, I'm interested in your listing: ${listing.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-green-500 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              {/* Message Form */}
              {showContactForm && !isOwner && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your message</p>
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder={`Hi, I'm interested in "${listing.title}". Is it still available?`}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-nepal-red"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                    className="w-full mt-2 bg-nepal-red text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              )}

              {/* Report */}
              {!isOwner && (
                <button className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors py-2">
                  <Flag className="w-3.5 h-3.5" />
                  Report this listing
                </button>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2 text-sm">Safety Tips</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Always visit the property in person</li>
                <li>• Never pay deposit without a written agreement</li>
                <li>• Verify landlord identity with ID proof</li>
                <li>• Get a proper rental agreement signed</li>
                <li>• Don&apos;t transfer money to unknown accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BillItem({ label, included }: { label: string; included: boolean }) {
  return (
    <div className={cn('flex items-center justify-between', !included && 'opacity-50')}>
      <span>{label}</span>
      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
        included ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
        {included ? 'Included' : 'Not included'}
      </span>
    </div>
  )
}

function PrefItem({ icon: Icon, label, allowed }: { icon: any; label: string; allowed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="w-4 h-4" />
      {label}:{' '}
      <span className={cn('font-medium', allowed ? 'text-green-600' : 'text-red-500')}>
        {allowed ? 'Allowed' : 'Not allowed'}
      </span>
    </div>
  )
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={cn(starSize, star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200')}
        />
      ))}
    </div>
  )
}
