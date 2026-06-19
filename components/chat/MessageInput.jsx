'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FiSend, FiPaperclip, FiSmile, FiX, FiImage, FiFile, FiCamera } from 'react-icons/fi'
import EmojiPicker from 'emoji-picker-react'
import useChatStore from '@/store/useChatStore'

export default function MessageInput({ onSend, onTyping, placeholder = 'Type a message...' }) {
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttachment, setShowAttachment] = useState(false)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiRef = useRef(null)
  const attachRef = useRef(null)
  const replyTo = useChatStore((s) => s.replyTo)
  const clearReplyTo = useChatStore((s) => s.clearReplyTo)

  useEffect(() => {
    inputRef.current?.focus()
  }, [replyTo])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false)
      if (attachRef.current && !attachRef.current.contains(e.target)) setShowAttachment(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = useCallback((e) => {
    setMessage(e.target.value)
    if (onTyping) {
      onTyping()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {}, 2000)
    }
  }, [onTyping])

  const handleSend = useCallback(() => {
    if (!message.trim()) return
    onSend(message.trim(), replyTo?._id)
    setMessage('')
    if (clearReplyTo) clearReplyTo()
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }, [message, onSend, replyTo, clearReplyTo])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleEmojiClick = useCallback((emojiData) => {
    setMessage((prev) => prev + emojiData.emoji)
    inputRef.current?.focus()
  }, [])

  const handleFileSelect = useCallback((type) => {
    setShowAttachment(false)
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : type === 'camera' ? 'image/*' : '*/*'
      fileInputRef.current.capture = type === 'camera' ? 'environment' : undefined
      fileInputRef.current.click()
    }
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)')
      return
    }
    onSend(null, null, file)
    e.target.value = ''
  }, [onSend])

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          onSend(null, null, file)
          return
        }
      }
    }
  }, [onSend])

  return (
    <div className="px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex-shrink-0">
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
          <div className="w-0.5 h-8 bg-[var(--accent)] rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--accent)]">Replying to {replyTo.sender?.name || 'message'}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{replyTo.content || (replyTo.type === 'image' ? '[Image]' : '')}</p>
          </div>
          <button onClick={clearReplyTo} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div ref={attachRef} className="relative">
          <button
            onClick={() => setShowAttachment(!showAttachment)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition flex-shrink-0"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
          {showAttachment && (
            <div className="absolute bottom-full mb-2 left-0 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl py-1.5 min-w-[160px] animate-scale-in">
              <button onClick={() => handleFileSelect('image')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition">
                <FiImage className="w-4 h-4" />
                Photo
              </button>
              <button onClick={() => handleFileSelect('document')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition">
                <FiFile className="w-4 h-4" />
                Document
              </button>
              <button onClick={() => handleFileSelect('camera')} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition">
                <FiCamera className="w-4 h-4" />
                Camera
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition resize-none"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
        </div>

        <div ref={emojiRef} className="relative">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition flex-shrink-0"
          >
            <FiSmile className="w-5 h-5" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-full mb-2 right-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                skinTonesDisabled
                searchDisabled
                width={320}
                height={350}
              />
            </div>
          )}
        </div>

        {message.trim() && (
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)] flex-shrink-0"
          >
            <FiSend className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
