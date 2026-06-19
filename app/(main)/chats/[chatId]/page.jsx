'use client'

import { use } from 'react'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ChatPage({ params }) {
  const { chatId } = use(params)
  return <ChatWindow conversationId={chatId} />
}
