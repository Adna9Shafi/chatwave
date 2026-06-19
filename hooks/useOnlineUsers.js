'use client'

import { useMemo } from 'react'
import useChatStore from '@/store/useChatStore'

export default function useOnlineUsers() {
  const onlineUsers = useChatStore((state) => state.onlineUsers)

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId)
  }

  const onlineCount = useMemo(() => onlineUsers.length, [onlineUsers])

  return {
    onlineUsers,
    isUserOnline,
    onlineCount,
  }
}
