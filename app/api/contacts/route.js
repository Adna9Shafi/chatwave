import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Contact from '@/models/Contact'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let query
    if (filter === 'sent') {
      query = { requester: session.user.id }
    } else if (filter === 'received') {
      query = { recipient: session.user.id }
    } else {
      query = {
        $or: [
          { requester: session.user.id },
          { recipient: session.user.id },
        ],
      }
    }

    const contacts = await Contact.find(query)
      .populate('requester', 'name email avatar username bio')
      .populate('recipient', 'name email avatar username bio')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId } = await request.json()
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }

    if (recipientId === session.user.id) {
      return NextResponse.json({ error: 'Cannot send contact request to yourself' }, { status: 400 })
    }

    await connectDB()

    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await Contact.findOne({
      $or: [
        { requester: session.user.id, recipient: recipientId },
        { requester: recipientId, recipient: session.user.id },
      ],
    })

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'Already in your contacts' }, { status: 400 })
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Contact request already sent' }, { status: 400 })
      }
      if (existing.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send contact request' }, { status: 400 })
      }
    }

    const contact = await Contact.create({
      requester: session.user.id,
      recipient: recipientId,
      status: 'pending',
    })

    const populated = await Contact.findById(contact._id)
      .populate('requester', 'name email avatar username')
      .populate('recipient', 'name email avatar username')
      .lean()

    return NextResponse.json({ contact: populated }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
