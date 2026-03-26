import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
            user: { select: { id: true, name: true, avatar: true, isVerified: true, createdAt: true, phone: true } },
            _count: { select: { favorites: true, reviews: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(favorites.map(f => ({ ...f.listing, isFavorited: true })))
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId } = await request.json()

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_listingId: { userId: session.user.id, listingId } },
      })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.favorite.create({
        data: { userId: session.user.id, listingId },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 })
  }
}
