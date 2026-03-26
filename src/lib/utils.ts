import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNPR(amount: number): string {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNPRShort(amount: number): string {
  if (amount >= 100000) {
    return `रू ${(amount / 100000).toFixed(1)} lakh`
  }
  if (amount >= 1000) {
    return `रू ${(amount / 1000).toFixed(0)}k`
  }
  return `रू ${amount.toLocaleString('en-NP')}`
}

export const NEPAL_CITIES = [
  { value: 'kathmandu', label: 'Kathmandu', district: 'Kathmandu' },
  { value: 'lalitpur', label: 'Lalitpur (Patan)', district: 'Lalitpur' },
  { value: 'bhaktapur', label: 'Bhaktapur', district: 'Bhaktapur' },
  { value: 'pokhara', label: 'Pokhara', district: 'Kaski' },
  { value: 'biratnagar', label: 'Biratnagar', district: 'Morang' },
  { value: 'birgunj', label: 'Birgunj', district: 'Parsa' },
  { value: 'dharan', label: 'Dharan', district: 'Sunsari' },
  { value: 'butwal', label: 'Butwal', district: 'Rupandehi' },
  { value: 'nepalgunj', label: 'Nepalgunj', district: 'Banke' },
  { value: 'hetauda', label: 'Hetauda', district: 'Makwanpur' },
  { value: 'dhankuta', label: 'Dhankuta', district: 'Dhankuta' },
  { value: 'itahari', label: 'Itahari', district: 'Sunsari' },
  { value: 'lahan', label: 'Lahan', district: 'Siraha' },
  { value: 'janakpur', label: 'Janakpur', district: 'Dhanusha' },
  { value: 'damak', label: 'Damak', district: 'Jhapa' },
  { value: 'mechinagar', label: 'Mechinagar', district: 'Jhapa' },
  { value: 'ghorahi', label: 'Ghorahi', district: 'Dang' },
  { value: 'tulsipur', label: 'Tulsipur', district: 'Dang' },
  { value: 'siddharthanagar', label: 'Siddharthanagar', district: 'Rupandehi' },
  { value: 'bharatpur', label: 'Bharatpur', district: 'Chitwan' },
]

export const KATHMANDU_AREAS = [
  'Thamel', 'Lazimpat', 'Baluwatar', 'Maharajgunj', 'Baneshwor',
  'Koteshwor', 'Kalanki', 'Kirtipur', 'Nayabazar', 'Chabahil',
  'Bauddha', 'Jorpati', 'Gokarneshwor', 'Budhanilkantha', 'Tokha',
  'Kageshwari', 'Gongabu', 'Samakhusi', 'Balaju', 'Swayambhu',
  'Dallu', 'Kalimati', 'Sanepa', 'Kupondole', 'Pulchowk',
  'Jhamsikhel', 'Ekantakuna', 'Jawalakhel', 'Imadol', 'Satdobato',
  'Gwarko', 'Tinkune', 'Sinamangal', 'New Baneshwor', 'Maitighar',
  'Dilli Bazaar', 'Naxal', 'Hattisar', 'Panipokhari', 'Maharajgunj',
  'Chakrapath', 'Nagarjun', 'Mudku', 'Thankot', 'Ichangu',
  'Sitapaila', 'Ramkot', 'Balambu', 'Machhegaun', 'Shankharapur',
  'Nagarkot', 'Bhaktapur Road', 'Radhe Radhe', 'Thali', 'Kapan',
  'Golfutar', 'Narayanthan', 'Manamaiju', 'Mahankal', 'Mulpani'
]

export const POKHARA_AREAS = [
  'Lakeside', 'Mahendrapool', 'Prithvi Chowk', 'Newroad',
  'Srijana Chowk', 'Chipledhunga', 'Bagar', 'Baglung Bus Park',
  'Fishtail', 'Damside', 'Hallan Chowk', 'Bhimsenthan',
  'Nayabazar', 'Lamachaur', 'Matepani', 'Parsyang', 'Rambazar'
]

export const AREAS_BY_CITY: Record<string, string[]> = {
  kathmandu: KATHMANDU_AREAS,
  lalitpur: ['Patan Dhoka', 'Lagankhel', 'Sanepa', 'Pulchowk', 'Kupondole', 'Jawalakhel', 'Ekantakuna', 'Satdobato', 'Imadol', 'Gwarko', 'Lubhu', 'Godavari', 'Tikathali', 'Balkumari', 'Suryabinayak'],
  bhaktapur: ['Durbar Square', 'Suryabinayak', 'Katunje', 'Duwakot', 'Sipadol', 'Naikap', 'Lokanthali', 'Nagarkot', 'Banepa', 'Panauti'],
  pokhara: POKHARA_AREAS,
  biratnagar: ['New Road', 'Traffic Chowk', 'Rangeli', 'Birat Chowk', 'Gograha', 'Durga Colony', 'Tankisinuwari'],
  birgunj: ['Maisthan', 'Shantinagar', 'Adarsh Nagar', 'Clock Tower', 'Ghantaghar', 'Parwanipur'],
  bharatpur: ['Bharatpur-1', 'Bharatpur-2', 'Ratnanagar', 'Kalika', 'Piple', 'Mangalpur', 'Ichchhakamana'],
}

export const LISTING_TYPES = [
  { value: 'room', label: 'Room for Rent' },
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'house', label: 'House' },
  { value: 'pg', label: 'PG / Paying Guest' },
  { value: 'roommate', label: 'Looking for Roommate' },
  { value: 'hostel', label: 'Hostel' },
]

export const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'shared', label: 'Shared Room' },
  { value: 'master', label: 'Master Bedroom' },
  { value: 'studio', label: 'Studio' },
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: '4bhk+', label: '4+ BHK' },
]

export const FURNISHING_TYPES = [
  { value: 'furnished', label: 'Fully Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
]

export const MIN_STAY_OPTIONS = [
  { value: '1 month', label: '1 Month' },
  { value: '3 months', label: '3 Months' },
  { value: '6 months', label: '6 Months' },
  { value: '1 year', label: '1 Year' },
  { value: 'flexible', label: 'Flexible' },
]

export const PRICE_RANGES = [
  { value: '0-5000', label: 'Under रू 5,000' },
  { value: '5000-10000', label: 'रू 5,000 - 10,000' },
  { value: '10000-15000', label: 'रू 10,000 - 15,000' },
  { value: '15000-25000', label: 'रू 15,000 - 25,000' },
  { value: '25000-50000', label: 'रू 25,000 - 50,000' },
  { value: '50000+', label: 'रू 50,000+' },
]

export function timeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
  return `${Math.floor(seconds / 2592000)} months ago`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}
