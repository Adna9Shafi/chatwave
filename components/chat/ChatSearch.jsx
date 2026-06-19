'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FiSearch, FiX, FiMessageSquare } from 'react-icons/fi'
import { format } from 'date-fns'

export default function ChatSearch({ open, onClose, messages, onJumpToMessage }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (!query.trim() || !messages?.length) {
      setResults([])
      return
    }
    const q = query.toLowerCase()
    const filtered = messages.filter(
      (m) => m.content && m.content.toLowerCase().includes(q) && !m.isDeleted
    )
    setResults(filtered)
  }, [query, messages])

  const handleSelect = useCallback((msgId) => {
    onJumpToMessage(msgId)
    onClose()
  }, [onJumpToMessage, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[360px] bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col animate-slide-in">
        <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
          <FiSearch className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
              <FiMessageSquare className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No messages found</p>
            </div>
          ) : (
            results.map((msg) => (
              <button
                key={msg._id}
                onClick={() => handleSelect(msg._id)}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-hover)] transition border-b border-[var(--border)] last:border-0"
              >
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                  {msg.sender?.name || 'Unknown'} &middot; {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                </p>
                <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                  {highlightMatch(msg.content, query)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function highlightMatch(text, query) {
  if (!query || !text) return text
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <span key={i} className="bg-[var(--accent)]/30 text-[var(--accent-light)] rounded px-0.5">{part}</span>
      : part
  )
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
