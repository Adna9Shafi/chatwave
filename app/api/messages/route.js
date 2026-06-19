import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Message from '@/models/Message'
import Conversation from '@/models/Conversation'
import Group from '@/models/Group'

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, groupId, content, type = 'text', fileUrl, fileName, fileSize, replyTo } = body

    if (!content && !fileUrl) {
      return NextResponse.json({ error: 'Content or file is required' }, { status: 400 })
    }

    await connectDB()

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId)
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === session.user.id
      )
      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (groupId) {
      const group = await Group.findById(groupId)
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      const isMember = group.members.some(
        (m) => m.user.toString() === session.user.id
      )
      if (!isMember) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (group.settings?.onlyAdminsCanMessage) {
        const member = group.members.find((m) => m.user.toString() === session.user.id)
        if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
          return NextResponse.json({ error: 'Only admins can send messages' }, { status: 403 })
        }
      }
    }

    const message = await Message.create({
      conversation: conversationId || undefined,
      group: groupId || undefined,
      sender: session.user.id,
      type,
      content: content || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
      replyTo: replyTo || undefined,
    })

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar username')
      .populate('replyTo')
      .lean()

    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
      })
    }

    if (groupId) {
      await Group.findByIdAndUpdate(groupId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
      })
    }

    return NextResponse.json({ message: populatedMessage }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
