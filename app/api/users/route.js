import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    let users
    if (query) {
      const regex = new RegExp(query, 'i')
      users = await User.find({
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { username: { $regex: regex } },
        ],
        _id: { $ne: session.user.id },
      })
        .select('name email avatar username isOnline lastSeen bio')
        .limit(20)
        .lean()
    } else {
      users = await User.find({ _id: { $ne: session.user.id } })
        .select('name email avatar username isOnline lastSeen bio')
        .limit(50)
        .lean()
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: 'credentials',
    })

    return NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
