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

    const group = await Group.findOne({ inviteCode: params.inviteCode })
      .populate('members.user', 'name email avatar username')
      .populate('admin', 'name email avatar username')
      .lean()

    if (!group) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Error fetching group by invite code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
