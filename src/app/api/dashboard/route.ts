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

    const [listings, favorites, conversations, unreadCount] = await Promise.all([
      prisma.listing.findMany({
        where: { userId: session.user.id },
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where: { userId: session.user.id } }),
      prisma.conversation.count({
        where: {
          participants: { some: { userId: session.user.id } },
        },
      }),
      prisma.message.count({
        where: {
          receiverId: session.user.id,
          isRead: false,
        },
      }),
    ])

    const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

    return NextResponse.json({
      listings,
      stats: {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.isActive).length,
        totalViews,
        favorites,
        conversations,
        unreadMessages: unreadCount,
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
