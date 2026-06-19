import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Contact from '@/models/Contact'

export async function PUT(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!['accepted', 'rejected', 'blocked'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await connectDB()

    const contact = await Contact.findById(params.contactId)
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    if (contact.recipient.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only the recipient can accept/reject requests' }, { status: 403 })
    }

    contact.status = status
    await contact.save()

    const updated = await Contact.findById(contact._id)
      .populate('requester', 'name email avatar username')
      .populate('recipient', 'name email avatar username')
      .lean()

    return NextResponse.json({ contact: updated })
  } catch (error) {
    console.error('Error updating contact:', error)
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

    const contact = await Contact.findById(params.contactId)
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const isRequester = contact.requester.toString() === session.user.id
    const isRecipient = contact.recipient.toString() === session.user.id

    if (!isRequester && !isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await Contact.findByIdAndDelete(params.contactId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
