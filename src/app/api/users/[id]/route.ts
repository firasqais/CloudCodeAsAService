import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        city: true,
        isVerified: true,
        isLandlord: true,
        createdAt: true,
        listings: {
          where: { isActive: true },
          include: {
            images: { take: 1, orderBy: { order: 'asc' } },
            _count: { select: { favorites: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            listings: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate average rating
    const avgRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
      : null

    return NextResponse.json({ ...user, avgRating })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword, ...updateData } = body

    if (newPassword) {
      const user = await prisma.user.findUnique({ where: { id: params.id } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, bio: true, city: true, isVerified: true, isLandlord: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
