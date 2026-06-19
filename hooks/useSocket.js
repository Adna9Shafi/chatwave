'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'

export default function useSocket() {
  const { data: session } = useSession()

  const emitTypingStart = useCallback((convId) => {
    const socket = getSocket()
    if (socket?.connected && session?.user?.id) {
      socket.emit('typing-start', { conversationId: convId, userId: session.user.id })
    }
  }, [session?.user?.id])

  const emitTypingStop = useCallback((convId) => {
    const socket = getSocket()
    if (socket?.connected && session?.user?.id) {
      socket.emit('typing-stop', { conversationId: convId, userId: session.user.id })
    }
  }, [session?.user?.id])

  const emitMessageRead = useCallback((messageId, convId) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('message-read', { messageId, conversationId: convId })
    }
  }, [])

  const emitReaction = useCallback((messageId, emoji) => {
    const socket = getSocket()
    if (socket?.connected && session?.user?.id) {
      socket.emit('react-message', { messageId, emoji, userId: session.user.id })
    }
  }, [session?.user?.id])

  const emitSendMessage = useCallback((message, convId) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('send-message', { message, conversationId: convId })
    }
  }, [])

  const emitSendGroupMessage = useCallback((message, groupId) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('send-group-msg', { message, groupId })
    }
  }, [])

  const joinConversation = useCallback((convId) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('join-conversation', { conversationId: convId })
    }
  }, [])

  const joinGroup = useCallback((groupId) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit('join-group', { groupId })
    }
  }, [])

  return {
    emitTypingStart,
    emitTypingStop,
    emitMessageRead,
    emitReaction,
    emitSendMessage,
    emitSendGroupMessage,
    joinConversation,
    joinGroup,
  }
}
