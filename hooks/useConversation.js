'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import useChatStore from '@/store/useChatStore'

export default function useConversation() {
  const { data: session } = useSession()
  const [error, setError] = useState(null)
  const {
    setConversations,
    setMessages,
    prependMessages,
    setIsMessagesLoading,
    setIsConversationsLoading,
    setActiveConversation,
    setActiveGroup,
  } = useChatStore()

  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return
    setIsConversationsLoading(true)
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setIsConversationsLoading(false)
    }
  }, [session?.user?.id, setConversations, setIsConversationsLoading])

  const fetchMessages = useCallback(
    async (convId, cursor) => {
      if (!convId) return
      setIsMessagesLoading(true)
      try {
        const url = cursor
          ? `/api/conversations/${convId}/messages?cursor=${cursor}`
          : `/api/conversations/${convId}/messages`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (cursor) {
            prependMessages(convId, data.messages || [])
          } else {
            setMessages(convId, data.messages || [])
          }
          return data
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        setIsMessagesLoading(false)
      }
    },
    [setMessages, prependMessages, setIsMessagesLoading]
  )

  const fetchConversation = useCallback(
    async (convId) => {
      if (!convId) return
      try {
        const res = await fetch(`/api/conversations/${convId}`)
        if (res.ok) {
          const data = await res.json()
          setActiveConversation(data.conversation)
          return data.conversation
        }
      } catch (err) {
        console.error('Error fetching conversation:', err)
      }
    },
    [setActiveConversation]
  )

  const fetchGroup = useCallback(
    async (groupId) => {
      if (!groupId) return
      try {
        const res = await fetch(`/api/groups/${groupId}`)
        if (res.ok) {
          const data = await res.json()
          setActiveGroup(data.group)
          return data.group
        }
      } catch (err) {
        console.error('Error fetching group:', err)
      }
    },
    [setActiveGroup]
  )

  const createConversation = useCallback(async (participantId) => {
    setError(null)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create conversation')
      }
      return await res.json()
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  return {
    fetchConversations,
    fetchMessages,
    fetchConversation,
    fetchGroup,
    createConversation,
    error,
  }
}
