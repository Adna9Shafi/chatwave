import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Group from '@/models/Group'
import Message from '@/models/Message'

export async function POST(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, addedUser } = body

    const targetUserId = addedUser || userId

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await connectDB()

    const group = await Group.findById(params.groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isAdmin = group.admin.toString() === session.user.id
    const isModerator = group.moderators.some((m) => m.toString() === session.user.id)

    if (group.settings?.onlyAdminsCanAddMembers && !isAdmin && !isModerator) {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 })
    }

    const alreadyMember = group.members.some((m) => m.user.toString() === targetUserId)
    if (alreadyMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json({ error: 'Group has reached maximum capacity' }, { status: 400 })
    }

    group.members.push({
      user: targetUserId,
      role: 'member',
      joinedAt: new Date(),
    })

    const isSelfJoin = targetUserId === session.user.id && !addedUser
    const systemContent = addedUser
      ? `<strong>${session.user.name}</strong> added a new member`
      : isSelfJoin
        ? `<strong>${session.user.name}</strong> joined the group`
        : `<strong>${session.user.name}</strong> added a member`

    const systemMsg = await Message.create({
      group: params.groupId,
      sender: session.user.id,
      type: 'system',
      content: systemContent,
    })

    group.lastMessage = systemMsg._id
    group.lastMessageAt = new Date()

    await group.save()

    const updated = await Group.findById(params.groupId)
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    return NextResponse.json({ group: updated })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await connectDB()

    const group = await Group.findById(params.groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isAdmin = group.admin.toString() === session.user.id
    const isSelf = userId === session.user.id

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    if (userId === group.admin.toString() && !isSelf) {
      return NextResponse.json({ error: 'Cannot remove the group admin' }, { status: 400 })
    }

    group.members = group.members.filter((m) => m.user.toString() !== userId)
    group.moderators = group.moderators.filter((m) => m.toString() !== userId)

    const systemContent = isSelf
      ? `<strong>${session.user.name}</strong> left the group`
      : `<strong>${session.user.name}</strong> removed a member`

    const systemMsg = await Message.create({
      group: params.groupId,
      sender: session.user.id,
      type: 'system',
      content: systemContent,
    })

    group.lastMessage = systemMsg._id
    group.lastMessageAt = new Date()

    await group.save()

    const updated = await Group.findById(params.groupId)
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    return NextResponse.json({ group: updated })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    await connectDB()

    const group = await Group.findById(params.groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.admin.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only admin can change roles' }, { status: 403 })
    }

    const member = group.members.find((m) => m.user.toString() === userId)
    if (!member) {
      return NextResponse.json({ error: 'User is not a member' }, { status: 400 })
    }

    member.role = role

    if (role === 'moderator') {
      if (!group.moderators.some((m) => m.toString() === userId)) {
        group.moderators.push(userId)
      }
    } else {
      group.moderators = group.moderators.filter((m) => m.toString() !== userId)
    }

    await group.save()

    const updated = await Group.findById(params.groupId)
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    return NextResponse.json({ group: updated })
  } catch (error) {
    console.error('Error updating member role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
