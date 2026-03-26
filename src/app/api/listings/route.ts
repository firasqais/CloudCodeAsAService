import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  price: z.number().min(500, 'Price must be at least रू 500'),
  negotiable: z.boolean().optional(),
  deposit: z.number().optional(),
  listingType: z.string(),
  roomType: z.string(),
  furnishing: z.string(),
  availableFrom: z.string(),
  minStay: z.string().optional(),
  maxOccupants: z.number().optional(),
  city: z.string(),
  district: z.string().optional(),
  area: z.string(),
  streetAddress: z.string().optional(),
  landmark: z.string().optional(),
  mapLat: z.number().optional(),
  mapLng: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floorNumber: z.number().optional(),
  totalFloors: z.number().optional(),
  squareFeet: z.number().optional(),
  facingDirection: z.string().optional(),
  wifi: z.boolean().optional(),
  parking: z.boolean().optional(),
  water24hrs: z.boolean().optional(),
  electricity: z.boolean().optional(),
  generator: z.boolean().optional(),
  solarPower: z.boolean().optional(),
  laundry: z.boolean().optional(),
  kitchen: z.boolean().optional(),
  ac: z.boolean().optional(),
  heater: z.boolean().optional(),
  tv: z.boolean().optional(),
  fridge: z.boolean().optional(),
  washingMachine: z.boolean().optional(),
  security: z.boolean().optional(),
  cctv: z.boolean().optional(),
  lift: z.boolean().optional(),
  garden: z.boolean().optional(),
  rooftop: z.boolean().optional(),
  gym: z.boolean().optional(),
  preferredGender: z.string().optional(),
  preferredOccupation: z.string().optional(),
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  alcoholAllowed: z.boolean().optional(),
  visitorsAllowed: z.boolean().optional(),
  cookingAllowed: z.boolean().optional(),
  waterBillIncluded: z.boolean().optional(),
  electricBillIncluded: z.boolean().optional(),
  internetIncluded: z.boolean().optional(),
  images: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const area = searchParams.get('area')
    const listingType = searchParams.get('listingType')
    const roomType = searchParams.get('roomType')
    const furnishing = searchParams.get('furnishing')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const wifi = searchParams.get('wifi')
    const parking = searchParams.get('parking')
    const water24hrs = searchParams.get('water24hrs')
    const preferredGender = searchParams.get('preferredGender')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = { isActive: true }

    if (city) where.city = city
    if (area) where.area = { contains: area }
    if (listingType) where.listingType = listingType
    if (roomType) where.roomType = roomType
    if (furnishing) where.furnishing = furnishing
    if (bedrooms) where.bedrooms = parseInt(bedrooms)
    if (wifi === 'true') where.wifi = true
    if (parking === 'true') where.parking = true
    if (water24hrs === 'true') where.water24hrs = true
    if (preferredGender) where.preferredGender = { in: [preferredGender, 'any'] }
    if (featured === 'true') where.isFeatured = true

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseInt(minPrice) } : {}),
        ...(maxPrice ? { lte: parseInt(maxPrice) } : {}),
      }
    }

    const orderBy: Record<string, string> =
      sort === 'price_asc' ? { price: 'asc' } :
      sort === 'price_desc' ? { price: 'desc' } :
      sort === 'popular' ? { views: 'desc' } :
      { createdAt: 'desc' }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, phone: true, isVerified: true, createdAt: true },
          },
          images: { orderBy: { order: 'asc' } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = listingSchema.parse(body)

    const { images, ...listingData } = data

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        availableFrom: new Date(listingData.availableFrom),
        userId: session.user.id,
        images: images?.length
          ? {
              create: images.map((url, index) => ({ url, order: index })),
            }
          : undefined,
      },
      include: {
        images: true,
        user: {
          select: { id: true, name: true, avatar: true, phone: true, isVerified: true, createdAt: true },
        },
      },
    })

    return NextResponse.json({ success: true, listing }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create listing error:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
