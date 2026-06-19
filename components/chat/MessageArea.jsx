'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { FiChevronDown } from 'react-icons/fi'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Spinner from '@/components/ui/Spinner'

export default function MessageArea({
  messages,
  currentUserId,
  typingNames,
  hasMore,
  isLoadingMore,
  isLoading,
  onLoadMore,
  onReact,
  onReply,
  onDelete,
  onImageClick,
  scrollToMessageId,
  isGroup,
  onSenderClick,
}) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const prevScrollHeightRef = useRef(0)
  const prevMessageCountRef = useRef(messages?.length || 0)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessagesBelow, setNewMessagesBelow] = useState(0)
  const scrollPositionRestored = useRef(false)

  const messagesFlat = messages || []

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    setIsAtBottom(true)
    setNewMessagesBelow(0)
  }, [])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distanceFromBottom < 100
    setIsAtBottom(atBottom)

    if (atBottom) setNewMessagesBelow(0)

    if (el.scrollTop < 50 && hasMore && !isLoadingMore) {
      prevScrollHeightRef.current = el.scrollHeight
      onLoadMore?.()
    }
  }, [hasMore, isLoadingMore, onLoadMore])

  useEffect(() => {
    scrollToBottom(false)
  }, [])

  useEffect(() => {
    if (!messagesFlat.length || isLoadingMore) return

    const prevCount = prevMessageCountRef.current
    const currentCount = messagesFlat.length

    if (currentCount > prevCount && containerRef.current) {
      const isPrepend = currentCount - prevCount <= 20
      if (isPrepend && prevScrollHeightRef.current > 0) {
        const newScrollHeight = containerRef.current.scrollHeight
        const diff = newScrollHeight - prevScrollHeightRef.current
        if (diff > 0) containerRef.current.scrollTop = diff
      } else if (isAtBottom) {
        scrollToBottom()
      } else {
        setNewMessagesBelow((prev) => prev + (currentCount - prevCount))
      }
    } else if (isAtBottom) {
      scrollToBottom(false)
    }

    prevMessageCountRef.current = currentCount
  }, [messagesFlat.length])

  useEffect(() => {
    if (scrollToMessageId && messagesFlat.length && !scrollPositionRestored.current) {
      const el = containerRef.current?.querySelector(`[data-msg-id="${scrollToMessageId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        scrollPositionRestored.current = true
        setTimeout(() => scrollPositionRestored.current = false, 1000)
      }
    }
  }, [scrollToMessageId, messagesFlat])

  function getDateLabel(date) {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMMM d, yyyy')
  }

  function shouldShowDateSeparator(current, previous) {
    if (!previous) return true
    return !isSameDay(new Date(current.createdAt), new Date(previous.createdAt))
  }

  if (isLoading && !messagesFlat.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!messagesFlat.length) {
    return (
      <div className="flex-1 flex flex-col">
        <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-4" onScroll={handleScroll}>
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide" onScroll={handleScroll}>
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}

        {messagesFlat.map((msg, idx) => {
          const prevMsg = idx > 0 ? messagesFlat[idx - 1] : null
          const showDateSep = shouldShowDateSeparator(msg, prevMsg)
          const isMine = msg.sender?._id === currentUserId
          const isConsecutive = prevMsg?.sender?._id === msg.sender?._id
          const showAvatar = idx === 0 || !isConsecutive

          return (
            <div key={msg._id} data-msg-id={msg._id}>
              {showDateSep && (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs font-mono text-[var(--text-muted)] flex-shrink-0">
                    {getDateLabel(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              )}

              <MessageBubble
                message={msg}
                isMine={isMine}
                showAvatar={showAvatar}
                isConsecutive={isConsecutive && !showAvatar}
                onReact={onReact}
                onReply={onReply}
                onDelete={onDelete}
                onImageClick={onImageClick}
                highlightId={scrollToMessageId}
                showSenderName={isGroup}
                onSenderClick={onSenderClick}
              />
            </div>
          )
        })}

        <TypingIndicator names={typingNames} />
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] shadow-xl text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
          >
            <FiChevronDown className="w-3.5 h-3.5" />
            {newMessagesBelow > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                {newMessagesBelow}
              </span>
            )}
            Scroll to bottom
          </button>
        </div>
      )}
    </div>
  )
}
