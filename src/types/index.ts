import { User, Listing, ListingImage, Review, Message } from '@prisma/client'

export type ListingWithDetails = Listing & {
  user: Pick<User, 'id' | 'name' | 'avatar' | 'phone' | 'isVerified' | 'createdAt'>
  images: ListingImage[]
  _count?: {
    favorites: number
    reviews: number
  }
  isFavorited?: boolean
  reviews?: Review[]
}

export type UserWithStats = User & {
  _count: {
    listings: number
    reviews: number
    reviewsReceived: number
  }
  reviewsReceived?: Review[]
}

export type MessageWithUsers = Message & {
  sender: Pick<User, 'id' | 'name' | 'avatar'>
  receiver: Pick<User, 'id' | 'name' | 'avatar'>
}

export type SearchFilters = {
  city?: string
  area?: string
  listingType?: string
  roomType?: string
  furnishing?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  wifi?: boolean
  parking?: boolean
  water24hrs?: boolean
  preferredGender?: string
  availableFrom?: string
  page?: number
  limit?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
