import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Message from '@/models/Message'
import Conversation from '@/models/Conversation'

export async function GET(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = 20

    await connectDB()

    const conversation = await Conversation.findById(params.conversationId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === session.user.id
    )
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const query = {
      conversation: params.conversationId,
      isDeleted: false,
      deletedFor: { $ne: session.user.id },
      ...(cursor && { _id: { $lt: cursor } }),
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar username')
      .populate('replyTo')
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean()

    const hasMore = messages.length > limit
    if (hasMore) messages.pop()

    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null

    return NextResponse.json({
      messages: messages.reverse(),
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
