'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import useChatStore from '@/store/useChatStore'
import useConversation from '@/hooks/useConversation'
import useSocket from '@/hooks/useSocket'
import ChatHeader from './ChatHeader'
import MessageArea from './MessageArea'
import MessageInput from './MessageInput'
import ChatSearch from './ChatSearch'
import GroupInfoPanel from './GroupInfoPanel'
import Modal from '@/components/ui/Modal'

export default function ChatWindow({ conversationId, groupId }) {
  const { data: session } = useSession()
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [infoPanelOpen, setInfoPanelOpen] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState(null)

  const isGroup = !!groupId
  const convKey = isGroup ? groupId : conversationId

  const activeConversation = useChatStore((s) => s.activeConversation)
  const activeGroup = useChatStore((s) => s.activeGroup)
  const messages = useChatStore((s) =>
    isGroup ? (s.groupMessagesMap[groupId] || []) : (s.messagesMap[conversationId] || [])
  )
  const typingUsersMap = useChatStore((s) => s.typingUsersMap)
  const isMessagesLoading = useChatStore((s) => s.isMessagesLoading)
  const setReplyTo = useChatStore((s) => s.setReplyTo)
  const scrollToMessage = useChatStore((s) => s.scrollToMessage)
  const setScrollToMessage = useChatStore((s) => s.setScrollToMessage)

  const { fetchMessages, fetchConversation, fetchGroup } = useConversation()
  const {
    joinConversation,
    joinGroup,
    emitSendMessage,
    emitSendGroupMessage,
    emitTypingStart,
    emitTypingStop,
    emitReaction,
    emitMessageRead,
  } = useSocket()

  const conversation = isGroup ? activeGroup : activeConversation
  const participants = isGroup
    ? activeGroup?.members?.map((m) => (typeof m === 'object' ? m.user || m : null)).filter(Boolean)
    : activeConversation?.participants || []

  useEffect(() => {
    if (!convKey) return
    async function init() {
      if (isGroup) {
        await fetchGroup(groupId)
      } else {
        await fetchConversation(conversationId)
      }
      await fetchMessages(convKey)
      if (isGroup) {
        joinGroup(groupId)
      } else {
        joinConversation(conversationId)
      }
    }
    init()
  }, [convKey])

  const handleLoadMore = useCallback(async () => {
    if (!convKey || !hasMore || isMessagesLoading) return
    const data = await fetchMessages(convKey, cursor)
    if (data) {
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    }
  }, [convKey, cursor, hasMore, isMessagesLoading, fetchMessages])

  const handleSend = useCallback((text, replyToId, file) => {
    if (!session?.user?.id) return

    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      fetch('/api/upload', { method: 'POST', body: formData })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            const msg = {
              sender: session.user.id,
              type: data.isImage ? 'image' : 'file',
              fileUrl: data.url,
              fileName: file.name,
              fileSize: file.size,
              content: '',
              replyTo: replyToId || undefined,
            }
            if (isGroup) emitSendGroupMessage(msg, groupId)
            else emitSendMessage(msg, conversationId)
          }
        })
        .catch(console.error)
      return
    }

    const msg = {
      sender: session.user.id,
      content: text,
      type: text.length === 1 && /[\u{1F600}-\u{1F6FF}]/u.test(text) ? 'emoji' : 'text',
      replyTo: replyToId || undefined,
    }
    if (isGroup) emitSendGroupMessage(msg, groupId)
    else emitSendMessage(msg, conversationId)
  }, [session?.user?.id, conversationId, groupId, isGroup, emitSendMessage, emitSendGroupMessage])

  const handleTyping = useCallback(() => {
    if (!convKey) return
    emitTypingStart(convKey)
    if (window.typingStopTimeout) clearTimeout(window.typingStopTimeout)
    window.typingStopTimeout = setTimeout(() => emitTypingStop(convKey), 2000)
  }, [convKey, emitTypingStart, emitTypingStop])

  const handleReact = useCallback((messageId, emoji) => {
    emitReaction(messageId, emoji)
  }, [emitReaction])

  const handleReply = useCallback((message) => {
    setReplyTo(message)
  }, [setReplyTo])

  const handleDelete = useCallback((messageId) => {
    useChatStore.setState((state) => {
      if (isGroup) {
        const map = { ...state.groupMessagesMap }
        map[groupId] = (map[groupId] || []).map((m) =>
          m._id === messageId ? { ...m, isDeleted: true } : m
        )
        return { groupMessagesMap: map }
      }
      const map = { ...state.messagesMap }
      map[conversationId] = (map[conversationId] || []).map((m) =>
        m._id === messageId ? { ...m, isDeleted: true } : m
      )
      return { messagesMap: map }
    })
  }, [conversationId, groupId, isGroup])

  const handleImageClick = useCallback((url) => {
    setLightboxUrl(url)
  }, [])

  const handleJumpToMessage = useCallback((messageId) => {
    setScrollToMessage(messageId)
  }, [setScrollToMessage])

  const handleSenderClick = useCallback((sender) => {
    if (sender?._id && sender._id !== session?.user?.id) {
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: sender._id }),
      }).then((res) => res.json()).then((data) => {
        if (data.conversation) {
          window.location.href = `/chats/${data.conversation._id}`
        }
      }).catch(console.error)
    }
  }, [session?.user?.id])

  const typingUserIds = typingUsersMap[convKey] || []
  const typingNames = typingUserIds
    .filter((id) => id !== session?.user?.id)
    .map((id) => {
      const p = participants?.find((u) => u?._id === id)
      return p?.name || 'Someone'
    })

  const getPlaceholder = () => {
    if (isGroup) return `Message #${activeGroup?.name || 'group'}`
    const name = activeConversation?.participants?.find(
      (p) => p._id !== session?.user?.id
    )?.name
    return `Message ${name || 'user'}`
  }

  if (!convKey) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Select a conversation</p>
          <p className="text-xs mt-1">Choose a chat from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      <ChatHeader
        conversation={!isGroup ? activeConversation : null}
        group={isGroup ? activeGroup : null}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        onInfoToggle={isGroup ? () => setInfoPanelOpen(!infoPanelOpen) : undefined}
      />

      <MessageArea
        messages={messages}
        currentUserId={session?.user?.id}
        typingNames={typingNames}
        hasMore={hasMore}
        isLoadingMore={isMessagesLoading}
        isLoading={isMessagesLoading && !messages.length}
        onLoadMore={handleLoadMore}
        onReact={handleReact}
        onReply={handleReply}
        onDelete={handleDelete}
        onImageClick={handleImageClick}
        scrollToMessageId={scrollToMessage}
        isGroup={isGroup}
        onSenderClick={handleSenderClick}
      />

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        placeholder={getPlaceholder()}
      />

      <ChatSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        messages={messages}
        onJumpToMessage={handleJumpToMessage}
      />

      {isGroup && (
        <GroupInfoPanel
          groupId={groupId}
          open={infoPanelOpen}
          onClose={() => setInfoPanelOpen(false)}
        />
      )}

      {lightboxUrl && (
        <Modal open={!!lightboxUrl} onClose={() => setLightboxUrl(null)} size="lg">
          <img src={lightboxUrl} alt="Enlarged" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        </Modal>
      )}
    </div>
  )
}
