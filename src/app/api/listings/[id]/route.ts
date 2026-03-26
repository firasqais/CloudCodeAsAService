import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true, name: true, avatar: true, phone: true,
            isVerified: true, createdAt: true, bio: true,
            _count: { select: { listings: true } },
          },
        },
        images: { orderBy: { order: 'asc' } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { favorites: true, reviews: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Increment views
    await prisma.listing.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    // Check if favorited by current user
    let isFavorited = false
    if (session?.user?.id) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: session.user.id, listingId: params.id } },
      })
      isFavorited = !!fav
    }

    return NextResponse.json({ ...listing, isFavorited })
  } catch (error) {
    console.error('Get listing error:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing || listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { images, ...updateData } = body

    if (updateData.availableFrom) {
      updateData.availableFrom = new Date(updateData.availableFrom)
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(images !== undefined
          ? {
              images: {
                deleteMany: {},
                create: images.map((url: string, index: number) => ({ url, order: index })),
              },
            }
          : {}),
      },
      include: {
        images: true,
        user: { select: { id: true, name: true, avatar: true, phone: true, isVerified: true, createdAt: true } },
      },
    })

    return NextResponse.json({ success: true, listing: updated })
  } catch (error) {
    console.error('Update listing error:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing || listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })
    }

    await prisma.listing.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
