import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { revieweeId, listingId, rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!comment?.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    // Check if already reviewed
    const existing = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        revieweeId,
        listingId: listingId || null,
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        revieweeId,
        listingId: listingId || null,
        rating,
        comment,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
