import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Conversation from '@/models/Conversation'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const conversations = await Conversation.find({
      participants: session.user.id,
      isArchived: { $ne: session.user.id },
    })
      .populate('participants', 'name email avatar username isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean()

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    if (participantId === session.user.id) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 })
    }

    await connectDB()

    const existingConversation = await Conversation.findOne({
      participants: { $all: [session.user.id, participantId], $size: 2 },
    })
      .populate('participants', 'name email avatar username isOnline lastSeen')
      .populate('lastMessage')
      .lean()

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation })
    }

    const conversation = await Conversation.create({
      participants: [session.user.id, participantId],
    })

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar username isOnline lastSeen')
      .lean()

    return NextResponse.json({ conversation: populated }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
