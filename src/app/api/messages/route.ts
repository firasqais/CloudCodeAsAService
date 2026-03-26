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

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      })

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json(messages)
    }

    // Get all conversations for user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Count unread messages per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            receiverId: session.user.id,
            isRead: false,
          },
        })
        return { ...conv, unreadCount }
      })
    )

    return NextResponse.json(conversationsWithUnread)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, content, listingId, conversationId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    let convId = conversationId

    if (!convId) {
      // Check if conversation exists between these two users for this listing
      const existing = await prisma.conversation.findFirst({
        where: {
          listingId: listingId || null,
          participants: {
            every: {
              userId: { in: [session.user.id, receiverId] },
            },
          },
        },
        include: {
          participants: true,
        },
      })

      if (existing && existing.participants.length === 2) {
        convId = existing.id
      } else {
        // Create new conversation
        const conv = await prisma.conversation.create({
          data: {
            listingId: listingId || null,
            participants: {
              create: [
                { userId: session.user.id },
                { userId: receiverId },
              ],
            },
          },
        })
        convId = conv.id
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        conversationId: convId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, message, conversationId: convId }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
