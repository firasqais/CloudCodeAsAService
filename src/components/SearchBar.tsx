'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Home, ChevronDown } from 'lucide-react'
import { NEPAL_CITIES, LISTING_TYPES } from '@/lib/utils'

interface SearchBarProps {
  defaultCity?: string
  defaultType?: string
  compact?: boolean
}

export default function SearchBar({ defaultCity, defaultType, compact }: SearchBarProps) {
  const router = useRouter()
  const [city, setCity] = useState(defaultCity || '')
  const [type, setType] = useState(defaultType || '')
  const [keyword, setKeyword] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (type) params.set('listingType', type)
    if (keyword) params.set('keyword', keyword)
    router.push(`/listings?${params.toString()}`)
  }

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, landmark..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red"
          />
        </div>
        <button type="submit" className="bg-nepal-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Search
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
      {/* City */}
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          className="w-full pl-9 pr-8 py-3.5 text-sm text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All Cities</option>
          {NEPAL_CITIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <div className="hidden sm:block w-px bg-gray-200 self-stretch" />

      {/* Type */}
      <div className="relative flex-1">
        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full pl-9 pr-8 py-3.5 text-sm text-gray-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All Types</option>
          {LISTING_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <div className="hidden sm:block w-px bg-gray-200 self-stretch" />

      {/* Keyword */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Area, landmark, keyword..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-3.5 text-sm text-gray-700 bg-transparent focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="bg-nepal-red text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 justify-center"
      >
        <Search className="w-4 h-4" />
        Search
      </button>
    </form>
  )
}
