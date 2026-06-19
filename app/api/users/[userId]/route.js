import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(params.userId)
      .select('name email avatar username bio isOnline lastSeen settings coverImage status blockedUsers')
      .populate('blockedUsers', 'name email avatar username')
      .lean()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (params.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, username, bio, avatar, coverImage, settings, status, blockUser, unblockUser } = body

    await connectDB()

    const user = await User.findById(params.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (avatar) user.avatar = avatar
    if (coverImage) user.coverImage = coverImage
    if (status) user.status = status
    if (settings) user.settings = { ...user.settings, ...settings }

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: params.userId } })
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
      user.username = username
    }

    if (blockUser) {
      if (!user.blockedUsers.includes(blockUser)) {
        user.blockedUsers.push(blockUser)
      }
    }

    if (unblockUser) {
      user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== unblockUser)
    }

    await user.save()

    const updated = await User.findById(params.userId)
      .select('name email avatar username bio isOnline lastSeen settings coverImage status')
      .lean()

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (params.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    await User.findByIdAndDelete(params.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
