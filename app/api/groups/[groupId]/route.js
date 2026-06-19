import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Group from '@/models/Group'

export async function GET(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const group = await Group.findById(params.groupId)
      .populate('members.user', 'name email avatar username isOnline lastSeen bio')
      .populate('admin', 'name email avatar username')
      .populate('moderators', 'name email avatar username')
      .populate('lastMessage')
      .lean()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some((m) => m.user._id.toString() === session.user.id)
    if (!isMember && !group.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error fetching group:', error)
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
    const { name, description, avatar, settings, isPublic, regenerateInvite } = body

    await connectDB()

    const group = await Group.findById(params.groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.admin.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only group admin can update group info' }, { status: 403 })
    }

    if (name) group.name = name
    if (description !== undefined) group.description = description
    if (avatar) group.avatar = avatar
    if (isPublic !== undefined) group.isPublic = isPublic
    if (settings) group.settings = { ...group.settings, ...settings }

    if (regenerateInvite) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let code = ''
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      group.inviteCode = code
    }

    await group.save()

    const updated = await Group.findById(params.groupId)
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    return NextResponse.json({ group: updated })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const group = await Group.findById(params.groupId)
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.admin.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only group admin can delete the group' }, { status: 403 })
    }

    await Group.findByIdAndDelete(params.groupId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
