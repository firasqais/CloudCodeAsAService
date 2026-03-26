'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  BadgeCheck, MapPin, Phone, Mail, Calendar, Home,
  Star, Edit, Loader2, Camera, Building2
} from 'lucide-react'
import ListingCard from '@/components/ListingCard'
import toast from 'react-hot-toast'
import { cn, NEPAL_CITIES } from '@/lib/utils'

export default function ProfilePage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', bio: '', city: '' })

  const isOwn = session?.user?.id === id

  useEffect(() => {
    if (!id) return
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => {
        setUser(data)
        setEditForm({ name: data.name, phone: data.phone || '', bio: data.bio || '', city: data.city || '' })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        setUser((prev: any) => ({ ...prev, ...data.user }))
        setEditing(false)
        toast.success('Profile updated!')
      } else {
        toast.error(data.error || 'Failed to update')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-nepal-red" /></div>
  if (!user) return <div className="min-h-screen flex items-center justify-center pt-16 text-gray-500">User not found</div>

  const avgRating = user.reviewsReceived?.length > 0
    ? (user.reviewsReceived.reduce((s: number, r: any) => s + r.rating, 0) / user.reviewsReceived.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-400">{user.name?.charAt(0)}</span>
                  )}
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red"
                    placeholder="Full Name"
                  />
                  <input
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red"
                    placeholder="Phone (98XXXXXXXX)"
                  />
                  <select
                    value={editForm.city}
                    onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nepal-red"
                  >
                    <option value="">Select City</option>
                    {NEPAL_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-nepal-red"
                    placeholder="Tell others about yourself..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 bg-nepal-red text-white py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h1 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1">
                      {user.name}
                      {user.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </h1>
                    {user.isLandlord && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mt-1">
                        <Building2 className="w-3 h-3" /> Landlord
                      </span>
                    )}

                    {avgRating && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900">{avgRating}</span>
                        <span className="text-gray-400 text-sm">({user._count.reviewsReceived} reviews)</span>
                      </div>
                    )}
                  </div>

                  {user.bio && <p className="text-sm text-gray-600 text-center mb-4">{user.bio}</p>}

                  <div className="space-y-2 text-sm">
                    {user.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {NEPAL_CITIES.find(c => c.value === user.city)?.label || user.city}
                      </div>
                    )}
                    {user.phone && isOwn && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        +977 {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Member since {new Date(user.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'long' })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{user._count.listings}</div>
                      <div className="text-xs text-gray-500">Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{user._count.reviewsReceived}</div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                  </div>

                  {isOwn && (
                    <button onClick={() => setEditing(true)}
                      className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:border-nepal-red hover:text-nepal-red transition-colors">
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Listings & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Listings */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-nepal-red" />
                Listings ({user.listings?.filter((l: any) => l.isActive).length || 0})
              </h2>
              {user.listings?.filter((l: any) => l.isActive).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.listings.filter((l: any) => l.isActive).map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={{ ...listing, user: { id: user.id, name: user.name, avatar: user.avatar, phone: user.phone, isVerified: user.isVerified, createdAt: user.createdAt } }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <Home className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No active listings</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Reviews ({user.reviewsReceived?.length || 0})
              </h2>

              {user.reviewsReceived?.length > 0 ? (
                <div className="space-y-3">
                  {user.reviewsReceived.map((review: any) => (
                    <div key={review.id} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                          {review.reviewer.avatar ? (
                            <img src={review.reviewer.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="font-bold text-sm text-gray-500">{review.reviewer.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{review.reviewer.name}</div>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={cn('w-3.5 h-3.5', s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200')} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
