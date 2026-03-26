import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import { NEPAL_CITIES, LISTING_TYPES } from '@/lib/utils'
import {
  Home, Users, Shield, Star, ArrowRight, MapPin,
  TrendingUp, Clock, BadgeCheck, Wifi, Car, Droplets
} from 'lucide-react'
import type { ListingWithDetails } from '@/types'

async function getFeaturedListings(): Promise<ListingWithDetails[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        user: { select: { id: true, name: true, avatar: true, phone: true, isVerified: true, createdAt: true } },
        images: { orderBy: { order: 'asc' }, take: 3 },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
    return listings as ListingWithDetails[]
  } catch {
    return []
  }
}

async function getRecentListings(): Promise<ListingWithDetails[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, name: true, avatar: true, phone: true, isVerified: true, createdAt: true } },
        images: { orderBy: { order: 'asc' }, take: 1 },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
    return listings as ListingWithDetails[]
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const [listings, users] = await Promise.all([
      prisma.listing.count({ where: { isActive: true } }),
      prisma.user.count(),
    ])
    return { listings, users }
  } catch {
    return { listings: 0, users: 0 }
  }
}

export default async function HomePage() {
  const [featuredListings, recentListings, stats] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
    getStats(),
  ])

  const displayListings = featuredListings.length > 0 ? featuredListings : recentListings

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-nepal-blue">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Nepal Flag Colors Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-nepal-blue via-white to-nepal-red" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Nepal&apos;s Trusted Room Finding Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="text-nepal-red block sm:inline"> कोठा </span>
            in Nepal
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Thousands of rooms, flats & flatmates across Nepal.
            Simple search, direct contact, no middlemen.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <SearchBar />
          </div>

          {/* Quick Type Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {LISTING_TYPES.map(type => (
              <Link
                key={type.value}
                href={`/listings?listingType=${type.value}`}
                className="bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-gray-900 transition-all"
              >
                {type.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-center mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{(stats.listings || 0).toLocaleString()}+</div>
              <div className="text-gray-400 text-sm">Active Listings</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{(stats.users || 0).toLocaleString()}+</div>
              <div className="text-gray-400 text-sm">Registered Users</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-gray-400 text-sm">Cities Covered</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">FREE</div>
              <div className="text-gray-400 text-sm">To Post Ads</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Kotha Nepal */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose कोठा Nepal?</h2>
            <p className="text-gray-500">Built specifically for Nepal, by Nepalis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'All listings are checked and verified for authenticity', color: 'text-green-600 bg-green-50' },
              { icon: Users, title: 'Find Flatmates', desc: 'Connect with compatible flatmates based on preferences', color: 'text-blue-600 bg-blue-50' },
              { icon: Clock, title: 'Real-time Updates', desc: 'New listings posted daily across all major cities', color: 'text-purple-600 bg-purple-50' },
              { icon: BadgeCheck, title: 'Direct Contact', desc: 'Contact landlords directly — no middlemen, no fees', color: 'text-nepal-red bg-red-50' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured/Recent Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {featuredListings.length > 0 ? 'Featured Listings' : 'Latest Listings'}
              </h2>
              <p className="text-gray-500 mt-1">Hand-picked rooms and flats across Nepal</p>
            </div>
            <Link
              href="/listings"
              className="flex items-center gap-1 text-nepal-red font-medium text-sm hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {displayListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No listings yet</h3>
              <p className="text-gray-400 mb-6">Be the first to post a listing!</p>
              <Link href="/listings/create" className="bg-nepal-red text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
                Post Your First Ad
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by City</h2>
            <p className="text-gray-500">Find rooms across Nepal&apos;s major cities</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { city: 'kathmandu', name: 'Kathmandu', emoji: '🏙️', desc: 'Capital City' },
              { city: 'lalitpur', name: 'Lalitpur', emoji: '🏛️', desc: 'City of Arts' },
              { city: 'pokhara', name: 'Pokhara', emoji: '🏔️', desc: 'Tourism Capital' },
              { city: 'bhaktapur', name: 'Bhaktapur', emoji: '🏯', desc: 'City of Culture' },
              { city: 'biratnagar', name: 'Biratnagar', emoji: '🏭', desc: 'Industrial Hub' },
              { city: 'bharatpur', name: 'Bharatpur', emoji: '🌿', desc: 'Chitwan' },
              { city: 'birgunj', name: 'Birgunj', emoji: '🚂', desc: 'Trade Gateway' },
              { city: 'butwal', name: 'Butwal', emoji: '⚡', desc: 'Power City' },
            ].map(({ city, name, emoji, desc }) => (
              <Link
                key={city}
                href={`/listings?city=${city}`}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-nepal-red hover:bg-red-50 transition-all"
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-nepal-red transition-colors">{name}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-nepal-red ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What are you looking for?</h2>
            <p className="text-gray-500">We have listings for every need</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: 'room', label: 'Room', icon: '🛏️', desc: 'Single/shared rooms' },
              { type: 'flat', label: 'Flat', icon: '🏢', desc: 'Full apartments' },
              { type: 'house', label: 'House', icon: '🏠', desc: 'Full houses' },
              { type: 'pg', label: 'PG', icon: '🏫', desc: 'Paying guest' },
              { type: 'roommate', label: 'Roommate', icon: '👥', desc: 'Find flatmates' },
              { type: 'hostel', label: 'Hostel', icon: '🛖', desc: 'Budget stays' },
            ].map(({ type, label, icon, desc }) => (
              <Link
                key={type}
                href={`/listings?listingType=${type}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-gray-100 hover:border-nepal-red hover:shadow-md transition-all"
              >
                <span className="text-4xl mb-2">{icon}</span>
                <span className="font-semibold text-gray-900 group-hover:text-nepal-red transition-colors">{label}</span>
                <span className="text-xs text-gray-400 mt-0.5">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">How it Works</h2>
            <p className="text-gray-500">Simple steps to find your perfect place</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Renters */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-nepal-red rounded-lg flex items-center justify-center text-white text-sm font-bold">R</span>
                For Room Seekers
              </h3>
              {[
                { step: 1, title: 'Search', desc: 'Browse thousands of rooms and flats in your desired city and area' },
                { step: 2, title: 'Filter & Compare', desc: 'Use filters to narrow down by price, amenities, and preferences' },
                { step: 3, title: 'Contact', desc: 'Message the landlord directly and schedule a visit' },
                { step: 4, title: 'Move In', desc: 'Agree on terms and move into your new home!' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-nepal-red font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{title}</div>
                    <div className="text-gray-500 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* For Landlords */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-nepal-blue rounded-lg flex items-center justify-center text-white text-sm font-bold">L</span>
                For Landlords
              </h3>
              {[
                { step: 1, title: 'Create Account', desc: 'Register for free and verify your identity' },
                { step: 2, title: 'Post Your Ad', desc: 'Add photos, description, price and amenities of your property' },
                { step: 3, title: 'Get Inquiries', desc: 'Receive messages from interested tenants directly' },
                { step: 4, title: 'Choose Tenant', desc: 'Review profiles and pick the right tenant for you' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-nepal-blue font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{title}</div>
                    <div className="text-gray-500 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-nepal-red to-red-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Have a Room to Rent?
          </h2>
          <p className="text-red-100 text-lg mb-8">
            Post your listing for FREE and reach thousands of potential tenants across Nepal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings/create"
              className="bg-white text-nepal-red px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Post Free Ad
            </Link>
            <Link
              href="/register"
              className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
