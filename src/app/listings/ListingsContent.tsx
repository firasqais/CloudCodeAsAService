'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ListingCard from '@/components/ListingCard'
import SearchBar from '@/components/SearchBar'
import {
  SlidersHorizontal, X, ChevronDown, Grid, List,
  Home, ChevronLeft, ChevronRight
} from 'lucide-react'
import { NEPAL_CITIES, LISTING_TYPES, ROOM_TYPES, FURNISHING_TYPES, cn } from '@/lib/utils'
import type { ListingWithDetails } from '@/types'

export default function ListingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<ListingWithDetails[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const [city, setCity] = useState(searchParams.get('city') || '')
  const [listingType, setListingType] = useState(searchParams.get('listingType') || '')
  const [roomType, setRoomType] = useState(searchParams.get('roomType') || '')
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [wifi, setWifi] = useState(searchParams.get('wifi') === 'true')
  const [parking, setParking] = useState(searchParams.get('parking') === 'true')
  const [water24hrs, setWater24hrs] = useState(searchParams.get('water24hrs') === 'true')
  const [preferredGender, setPreferredGender] = useState(searchParams.get('preferredGender') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (listingType) params.set('listingType', listingType)
      if (roomType) params.set('roomType', roomType)
      if (furnishing) params.set('furnishing', furnishing)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (wifi) params.set('wifi', 'true')
      if (parking) params.set('parking', 'true')
      if (water24hrs) params.set('water24hrs', 'true')
      if (preferredGender) params.set('preferredGender', preferredGender)
      params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/listings?${params.toString()}`)
      const data = await res.json()
      setListings(data.listings || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [city, listingType, roomType, furnishing, minPrice, maxPrice, wifi, parking, water24hrs, preferredGender, sort, page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const clearFilters = () => {
    setCity(''); setListingType(''); setRoomType(''); setFurnishing('')
    setMinPrice(''); setMaxPrice(''); setWifi(false); setParking(false)
    setWater24hrs(false); setPreferredGender(''); setPage(1)
  }

  const activeFiltersCount = [city, listingType, roomType, furnishing, minPrice, maxPrice, wifi, parking, water24hrs, preferredGender].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gray-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar defaultCity={city} defaultType={listingType} compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${total.toLocaleString()} ${total === 1 ? 'listing' : 'listings'} found`}
            </h1>
            {city && <p className="text-sm text-gray-500 mt-0.5">in {NEPAL_CITIES.find(c => c.value === city)?.label || city}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                className="appearance-none pl-3 pr-7 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-nepal-red cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Viewed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn('flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors',
                filtersOpen ? 'bg-nepal-red text-white border-nepal-red' : 'bg-white text-gray-700 border-gray-200 hover:border-nepal-red')}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className={cn('w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold',
                  filtersOpen ? 'bg-white text-nepal-red' : 'bg-nepal-red text-white')}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setView('grid')} className={cn('p-2', view === 'grid' ? 'bg-nepal-red text-white' : 'bg-white text-gray-500')}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={cn('p-2', view === 'list' ? 'bg-nepal-red text-white' : 'bg-white text-gray-500')}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {city && <FilterTag label={NEPAL_CITIES.find(c => c.value === city)?.label || city} onRemove={() => setCity('')} />}
            {listingType && <FilterTag label={LISTING_TYPES.find(t => t.value === listingType)?.label || listingType} onRemove={() => setListingType('')} />}
            {roomType && <FilterTag label={ROOM_TYPES.find(t => t.value === roomType)?.label || roomType} onRemove={() => setRoomType('')} />}
            {furnishing && <FilterTag label={furnishing.replace('-', ' ')} onRemove={() => setFurnishing('')} />}
            {minPrice && <FilterTag label={`Min रू ${parseInt(minPrice).toLocaleString()}`} onRemove={() => setMinPrice('')} />}
            {maxPrice && <FilterTag label={`Max रू ${parseInt(maxPrice).toLocaleString()}`} onRemove={() => setMaxPrice('')} />}
            {wifi && <FilterTag label="WiFi" onRemove={() => setWifi(false)} />}
            {parking && <FilterTag label="Parking" onRemove={() => setParking(false)} />}
            {water24hrs && <FilterTag label="24hr Water" onRemove={() => setWater24hrs(false)} />}
            {preferredGender && <FilterTag label={`${preferredGender} only`} onRemove={() => setPreferredGender('')} />}
            <button onClick={clearFilters} className="text-xs text-red-600 hover:underline font-medium">Clear all</button>
          </div>
        )}

        {filtersOpen && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">City</label>
                <select value={city} onChange={e => { setCity(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  <option value="">All Cities</option>
                  {NEPAL_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Property Type</label>
                <select value={listingType} onChange={e => { setListingType(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  <option value="">All Types</option>
                  {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Room Type</label>
                <select value={roomType} onChange={e => { setRoomType(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  <option value="">Any</option>
                  {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Furnishing</label>
                <select value={furnishing} onChange={e => { setFurnishing(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  <option value="">Any</option>
                  {FURNISHING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Min Price (रू)</label>
                <input type="number" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                  placeholder="0" min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Max Price (रू)</label>
                <input type="number" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Gender Preference</label>
                <select value={preferredGender} onChange={e => { setPreferredGender(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  <option value="">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'wifi', label: 'WiFi', state: wifi, setter: setWifi },
                    { key: 'parking', label: 'Parking', state: parking, setter: setParking },
                    { key: 'water', label: '24hr Water', state: water24hrs, setter: setWater24hrs },
                  ].map(({ key, label, state, setter }) => (
                    <button key={key} type="button"
                      onClick={() => { setter(!state); setPage(1) }}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        state ? 'bg-nepal-red text-white border-nepal-red' : 'bg-white text-gray-600 border-gray-200 hover:border-nepal-red')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No listings found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search in a different area</p>
            <button onClick={clearFilters} className="bg-nepal-red text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={cn('grid gap-5', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl')}>
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing}
                onFavoriteToggle={(id, fav) => setListings(prev => prev.map(l => l.id === id ? { ...l, isFavorited: fav } : l))} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:border-nepal-red disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)}
                className={cn('w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                  i + 1 === page ? 'bg-nepal-red text-white' : 'border border-gray-200 text-gray-700 hover:border-nepal-red')}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="p-2 border border-gray-200 rounded-lg hover:border-nepal-red disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-nepal-red text-xs font-medium px-3 py-1 rounded-full border border-red-100">
      {label}
      <button onClick={onRemove} className="hover:text-red-700 ml-0.5"><X className="w-3 h-3" /></button>
    </span>
  )
}
