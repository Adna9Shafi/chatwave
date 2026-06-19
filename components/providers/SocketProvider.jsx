'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { getSocket } from '@/lib/socket'
import useSocketStore from '@/store/useSocketStore'
import useChatStore from '@/store/useChatStore'
import useNotificationStore from '@/store/useNotificationStore'

export default function SocketProvider({ children }) {
  const { data: session } = useSession()
  const { setSocket, setIsConnected } = useSocketStore()
  const {
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    addAwayUser,
    removeAwayUser,
    addMessage,
    addGroupMessage,
    addTypingUser,
    removeTypingUser,
    updateMessage,
    updateGroupMessage,
  } = useChatStore()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const connect = useCallback(() => {
    if (!session?.user?.id) return
    const socket = getSocket()

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join', { userId: session.user.id })
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('online-users', (users) => setOnlineUsers(users))

    socket.on('user-online', ({ userId }) => addOnlineUser(userId))

    socket.on('user-offline', ({ userId }) => {
      removeOnlineUser(userId)
      removeAwayUser(userId)
    })

    socket.on('user-away', ({ userId }) => addAwayUser(userId))

    socket.on('user-back', ({ userId }) => removeAwayUser(userId))

    socket.on('receive-message', (msg) => {
      const convId = msg.conversation
      if (convId) {
        addMessage(convId, msg)
        const senderName = msg.sender?.name || 'Someone'
        const preview = msg.content?.slice(0, 60) || (msg.type === 'image' ? 'sent an image' : 'sent a file')
        if (msg.sender?._id !== session?.user?.id) {
          addNotification({
            type: 'message',
            sender: senderName,
            text: `: ${preview}`,
            link: `/chats/${convId}`,
          })
        }
      }
    })

    socket.on('receive-group-msg', (msg) => {
      const groupId = msg.group
      if (groupId) {
        addGroupMessage(groupId, msg)
        const senderName = msg.sender?.name || 'Someone'
        const preview = msg.content?.slice(0, 60) || 'sent a message'
        if (msg.sender?._id !== session?.user?.id) {
          addNotification({
            type: 'message',
            sender: senderName,
            text: `: ${preview}`,
            link: `/groups/${groupId}`,
          })
        }
      }
    })

    socket.on('user-typing', ({ userId, conversationId }) => {
      if (conversationId) addTypingUser(conversationId, userId)
    })

    socket.on('user-stop-typing', ({ userId, conversationId }) => {
      if (conversationId) removeTypingUser(conversationId, userId)
    })

    socket.on('reaction-update', ({ messageId, reactions }) => {
      Object.keys(useChatStore.getState().messagesMap).forEach((convId) => {
        updateMessage(convId, messageId, { reactions })
      })
      Object.keys(useChatStore.getState().groupMessagesMap).forEach((gId) => {
        updateGroupMessage(gId, messageId, { reactions })
      })
    })

    socket.on('message-seen', ({ messageId, userId }) => {
      Object.keys(useChatStore.getState().messagesMap).forEach((convId) => {
        const msgs = useChatStore.getState().messagesMap[convId] || []
        const msg = msgs.find((m) => m._id === messageId)
        if (msg && !msg.readBy?.includes(userId)) {
          updateMessage(convId, messageId, {
            readBy: [...(msg.readBy || []), userId],
          })
        }
      })
    })

    socket.on('notification', (notif) => {
      addNotification(notif)
    })

    socket.connect()
    setSocket(socket)

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('online-users')
      socket.off('user-online')
      socket.off('user-offline')
      socket.off('user-away')
      socket.off('user-back')
      socket.off('receive-message')
      socket.off('receive-group-msg')
      socket.off('user-typing')
      socket.off('user-stop-typing')
      socket.off('reaction-update')
      socket.off('message-seen')
      socket.off('notification')
    }
  }, [session?.user?.id, setSocket, setIsConnected, setOnlineUsers, addOnlineUser, removeOnlineUser, addAwayUser, removeAwayUser, addMessage, addGroupMessage, addTypingUser, removeTypingUser, updateMessage, updateGroupMessage, addNotification])

  useEffect(() => {
    const cleanup = connect()
    return () => cleanup?.()
  }, [connect])

  return children
}
