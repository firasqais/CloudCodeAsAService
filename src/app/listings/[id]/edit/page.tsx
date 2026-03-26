'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { NEPAL_CITIES, AREAS_BY_CITY, LISTING_TYPES, ROOM_TYPES, FURNISHING_TYPES, MIN_STAY_OPTIONS } from '@/lib/utils'

export default function EditListingPage() {
  const { id } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (!id || status === 'loading') return

    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.userId !== session?.user?.id) {
          toast.error('You cannot edit this listing')
          router.push('/dashboard')
          return
        }
        setForm({
          ...data,
          availableFrom: new Date(data.availableFrom).toISOString().split('T')[0],
          price: data.price.toString(),
          deposit: data.deposit?.toString() || '',
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          maxOccupants: data.maxOccupants.toString(),
          floorNumber: data.floorNumber?.toString() || '',
          totalFloors: data.totalFloors?.toString() || '',
          squareFeet: data.squareFeet?.toString() || '',
        })
      })
      .finally(() => setLoading(false))
  }, [id, status, session, router])

  const set = (key: string, value: unknown) => setForm((f: any) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
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
        }),
      })
      if (res.ok) {
        toast.success('Listing updated!')
        router.push(`/listings/${id}`)
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  if (loading || !form) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-nepal-red" /></div>

  const areaOptions = AREAS_BY_CITY[form.city] || []

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/listings/${id}`} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          {/* Basic */}
          <section>
            <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Type</label>
                <select value={form.listingType} onChange={e => set('listingType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (रू/month)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deposit (रू)</label>
                  <input type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="negotiable" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} className="w-4 h-4 accent-nepal-red" />
                <label htmlFor="negotiable" className="text-sm text-gray-700">Price is negotiable</label>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="font-bold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <select value={form.city} onChange={e => set('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  {NEPAL_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Area</label>
                {areaOptions.length > 0 ? (
                  <select value={form.area} onChange={e => set('area', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                    <option value="">Select area</option>
                    {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.area} onChange={e => set('area', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark</label>
              <input type="text" value={form.landmark || ''} onChange={e => set('landmark', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
            </div>
          </section>

          {/* Status */}
          <section>
            <h2 className="font-bold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-nepal-red" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Listing is active and visible</label>
            </div>
          </section>

          {/* Availability */}
          <section>
            <h2 className="font-bold text-gray-900 mb-4">Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Available From</label>
                <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Stay</label>
                <select value={form.minStay || 'flexible'} onChange={e => set('minStay', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red">
                  {MIN_STAY_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-nepal-red text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/listings/${id}`}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
