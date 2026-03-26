'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload, X, Plus, Home, ChevronRight, Loader2,
  Camera, MapPin, DollarSign, Wifi, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, NEPAL_CITIES, AREAS_BY_CITY, LISTING_TYPES, ROOM_TYPES, FURNISHING_TYPES, MIN_STAY_OPTIONS } from '@/lib/utils'

const STEPS = ['Basic Info', 'Location', 'Details', 'Amenities', 'Preferences', 'Photos']

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<string[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    negotiable: false,
    deposit: '',
    listingType: 'room',
    roomType: 'single',
    furnishing: 'unfurnished',
    availableFrom: new Date().toISOString().split('T')[0],
    minStay: 'flexible',
    maxOccupants: '1',
    city: 'kathmandu',
    district: '',
    area: '',
    streetAddress: '',
    landmark: '',
    bedrooms: '1',
    bathrooms: '1',
    floorNumber: '',
    totalFloors: '',
    squareFeet: '',
    facingDirection: '',
    // Amenities
    wifi: false, parking: false, water24hrs: false, electricity: true,
    generator: false, solarPower: false, laundry: false, kitchen: false,
    ac: false, heater: false, tv: false, fridge: false, washingMachine: false,
    security: false, cctv: false, lift: false, garden: false, rooftop: false, gym: false,
    // Preferences
    preferredGender: 'any',
    preferredOccupation: 'any',
    petsAllowed: false,
    smokingAllowed: false,
    alcoholAllowed: false,
    visitorsAllowed: true,
    cookingAllowed: true,
    // Bills
    waterBillIncluded: false,
    electricBillIncluded: false,
    internetIncluded: false,
  })

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    setUploadingImages(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.urls) {
        setImages(prev => [...prev, ...data.urls])
        // Create previews
        files.forEach(file => {
          const reader = new FileReader()
          reader.onload = e => setImagePreviews(prev => [...prev, e.target?.result as string])
          reader.readAsDataURL(file)
        })
      }
    } catch {
      toast.error('Failed to upload images')
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!session) { router.push('/login'); return }
    if (!form.title.trim()) { toast.error('Title is required'); setStep(0); return }
    if (!form.description.trim()) { toast.error('Description is required'); setStep(0); return }
    if (!form.price) { toast.error('Price is required'); setStep(0); return }
    if (!form.city) { toast.error('City is required'); setStep(1); return }
    if (!form.area.trim()) { toast.error('Area is required'); setStep(1); return }

    setLoading(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price),
          deposit: form.deposit ? parseInt(form.deposit) : undefined,
          bedrooms: parseInt(form.bedrooms),
          bathrooms: parseInt(form.bathrooms),
          maxOccupants: parseInt(form.maxOccupants),
          floorNumber: form.floorNumber ? parseInt(form.floorNumber) : undefined,
          totalFloors: form.totalFloors ? parseInt(form.totalFloors) : undefined,
          squareFeet: form.squareFeet ? parseInt(form.squareFeet) : undefined,
          images,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Listing published successfully!')
        router.push(`/listings/${data.listing.id}`)
      } else {
        toast.error(data.error || 'Failed to create listing')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-nepal-red" /></div>
  if (!session) {
    router.push('/login')
    return null
  }

  const areaOptions = AREAS_BY_CITY[form.city] || []

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post Your Listing</h1>
          <p className="text-gray-500 mt-1">Fill in the details to advertise your property</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium transition-colors',
                  i === step ? 'text-nepal-red' :
                  i < step ? 'text-green-600 cursor-pointer' :
                  'text-gray-400 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                  i === step ? 'bg-nepal-red text-white' :
                  i < step ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                )}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('w-8 sm:w-12 h-0.5 mx-1', i < step ? 'bg-green-600' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {LISTING_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => set('listingType', t.value)}
                      className={cn('py-2.5 px-3 rounded-xl text-sm font-medium border transition-all',
                        form.listingType === t.value ? 'bg-nepal-red text-white border-nepal-red' : 'border-gray-200 text-gray-700 hover:border-nepal-red')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Furnished room near Thamel, Kathmandu"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe your property in detail - size, condition, surroundings, nearby facilities..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Rent (रू) *</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="e.g. 8000" min="500"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Security Deposit (रू)</label>
                  <input type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="negotiable" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)}
                  className="w-4 h-4 accent-nepal-red" />
                <label htmlFor="negotiable" className="text-sm text-gray-700">Price is negotiable</label>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Location</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <select value={form.city} onChange={e => { set('city', e.target.value); set('area', '') }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    {NEPAL_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Area / Tole *</label>
                  {areaOptions.length > 0 ? (
                    <select value={form.area} onChange={e => set('area', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                      <option value="">Select area</option>
                      {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={form.area} onChange={e => set('area', e.target.value)}
                      placeholder="Enter area/tole name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                <input type="text" value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)}
                  placeholder="e.g. Bagbazar Road, Near Tri-Chandra College"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nearby Landmark</label>
                <input type="text" value={form.landmark} onChange={e => set('landmark', e.target.value)}
                  placeholder="e.g. Near Civil Mall, 5 min from Ratna Park"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-sm text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Providing accurate location helps tenants find your property easily. Your exact address is only shared when you choose to.
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Property Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type</label>
                  <select value={form.roomType} onChange={e => set('roomType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Furnishing</label>
                  <select value={form.furnishing} onChange={e => set('furnishing', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    {FURNISHING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                    min="0" max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                    min="1" max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Floor No.</label>
                  <input type="number" value={form.floorNumber} onChange={e => set('floorNumber', e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Floors</label>
                  <input type="number" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Area (sq.ft)</label>
                  <input type="number" value={form.squareFeet} onChange={e => set('squareFeet', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Facing Direction</label>
                  <select value={form.facingDirection} onChange={e => set('facingDirection', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    <option value="">Not specified</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Available From *</label>
                  <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Stay</label>
                  <select value={form.minStay} onChange={e => set('minStay', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    {MIN_STAY_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Occupants</label>
                <input type="number" value={form.maxOccupants} onChange={e => set('maxOccupants', e.target.value)}
                  min="1" max="20" placeholder="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>

              {/* Bills Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Bills Included in Rent</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'waterBillIncluded', label: '💧 Water Bill' },
                    { key: 'electricBillIncluded', label: '⚡ Electricity Bill' },
                    { key: 'internetIncluded', label: '📶 Internet' },
                  ].map(({ key, label }) => (
                    <button key={key} type="button"
                      onClick={() => set(key, !(form as any)[key])}
                      className={cn('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                        (form as any)[key] ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-600')}>
                      {label} {(form as any)[key] ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Amenities */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Amenities</h2>
              <p className="text-sm text-gray-500">Select all amenities available at your property</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'wifi', label: '📶 WiFi/Internet' },
                  { key: 'parking', label: '🚗 Parking' },
                  { key: 'water24hrs', label: '💧 24hr Water' },
                  { key: 'electricity', label: '⚡ Electricity' },
                  { key: 'generator', label: '🔋 Generator' },
                  { key: 'solarPower', label: '☀️ Solar Power' },
                  { key: 'kitchen', label: '🍳 Kitchen' },
                  { key: 'laundry', label: '👕 Laundry' },
                  { key: 'ac', label: '❄️ Air Conditioning' },
                  { key: 'heater', label: '🔥 Heater' },
                  { key: 'tv', label: '📺 Television' },
                  { key: 'fridge', label: '🧊 Refrigerator' },
                  { key: 'washingMachine', label: '🫧 Washing Machine' },
                  { key: 'security', label: '💂 Security Guard' },
                  { key: 'cctv', label: '📸 CCTV Camera' },
                  { key: 'lift', label: '🛗 Lift/Elevator' },
                  { key: 'garden', label: '🌿 Garden' },
                  { key: 'rooftop', label: '🏠 Rooftop' },
                  { key: 'gym', label: '💪 Gym' },
                ].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => set(key, !(form as any)[key])}
                    className={cn('px-3 py-3 rounded-xl text-sm font-medium border transition-all text-left',
                      (form as any)[key] ? 'bg-green-50 text-green-700 border-green-300' : 'border-gray-200 text-gray-600 hover:border-green-300 bg-white')}>
                    {label}
                    {(form as any)[key] && <span className="float-right">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Tenant Preferences</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Gender</label>
                  <div className="flex gap-2">
                    {['any', 'male', 'female'].map(g => (
                      <button key={g} type="button" onClick={() => set('preferredGender', g)}
                        className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium border capitalize transition-all',
                          form.preferredGender === g ? 'bg-nepal-red text-white border-nepal-red' : 'border-gray-200 text-gray-600')}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Occupation</label>
                  <select value={form.preferredOccupation} onChange={e => set('preferredOccupation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    <option value="any">Any</option>
                    <option value="student">Student</option>
                    <option value="working">Working Professional</option>
                    <option value="family">Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">House Rules</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'petsAllowed', label: '🐕 Pets Allowed' },
                    { key: 'smokingAllowed', label: '🚬 Smoking Allowed' },
                    { key: 'alcoholAllowed', label: '🍺 Alcohol Allowed' },
                    { key: 'visitorsAllowed', label: '👥 Visitors Allowed' },
                    { key: 'cookingAllowed', label: '🍳 Cooking Allowed' },
                  ].map(({ key, label }) => (
                    <button key={key} type="button"
                      onClick={() => set(key, !(form as any)[key])}
                      className={cn('px-3 py-3 rounded-xl text-sm font-medium border transition-all text-left',
                        (form as any)[key]
                          ? 'bg-green-50 text-green-700 border-green-300'
                          : 'bg-red-50 text-red-600 border-red-200')}>
                      {label}
                      <span className="float-right">{(form as any)[key] ? '✓' : '✗'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Photos</h2>
              <p className="text-sm text-gray-500">Add up to 10 photos. Good photos get 3x more inquiries!</p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-nepal-red hover:bg-red-50 transition-all"
              >
                {uploadingImages ? (
                  <Loader2 className="w-8 h-8 animate-spin text-nepal-red mx-auto mb-2" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                )}
                <p className="text-sm font-medium text-gray-700">
                  {uploadingImages ? 'Uploading...' : 'Click to upload photos'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each • Max 10 photos</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-nepal-red text-white text-xs px-2 py-0.5 rounded-full">Cover</div>
                      )}
                      <button onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-nepal-red transition-colors">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
              )}

              {images.length === 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                  💡 Listings with photos get 80% more views. We strongly recommend adding at least 3-5 photos.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ← Back
            </button>
          ) : (
            <Link href="/listings" className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-8 py-3 bg-nepal-red text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-8 py-3 bg-nepal-red text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
