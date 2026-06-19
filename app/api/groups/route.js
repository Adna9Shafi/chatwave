import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Group from '@/models/Group'
import Message from '@/models/Message'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const groups = await Group.find({
      'members.user': session.user.id,
    })
      .populate('members.user', 'name email avatar username isOnline lastSeen')
      .populate('admin', 'name email avatar username')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })
      .lean()

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
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
    const { name, description, memberIds, isPublic, avatar } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    await connectDB()

    const members = [
      {
        user: session.user.id,
        role: 'admin',
        joinedAt: new Date(),
      },
      ...(memberIds || []).filter((id) => id !== session.user.id).map((id) => ({
        user: id,
        role: 'member',
        joinedAt: new Date(),
      })),
    ]

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      avatar: avatar || '',
      admin: session.user.id,
      moderators: [session.user.id],
      members,
      isPublic: isPublic || false,
    })

    const systemMsg = await Message.create({
      group: group._id,
      sender: session.user.id,
      type: 'system',
      content: `<strong>${session.user.name}</strong> created the group`,
    })

    group.lastMessage = systemMsg._id
    group.lastMessageAt = new Date()
    await group.save()

    const populated = await Group.findById(group._id)
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    return NextResponse.json({ group: populated }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
