'use client'

import { use } from 'react'
import ChatWindow from '@/components/chat/ChatWindow'

export default function GroupChatPage({ params }) {
  const { groupId } = use(params)
  return <ChatWindow groupId={groupId} />
}
