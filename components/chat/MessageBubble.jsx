'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { FiSmile, FiMessageSquare, FiEdit2, FiTrash2, FiDownload, FiFile } from 'react-icons/fi'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'

export default function MessageBubble({
  message,
  isMine,
  showAvatar,
  isConsecutive,
  onReact,
  onReply,
  onDelete,
  onImageClick,
  highlightId,
  showSenderName,
  onSenderClick,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false)
    }
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showEmojiPicker])

  if (message.isDeleted) return null

  const isSystem = message.type === 'system'
  const isEmoji = message.type === 'emoji'
  const isImage = message.type === 'image'
  const isFile = message.type === 'file'
  const isReply = message.type === 'reply' || message.replyTo
  const isGif = message.type === 'gif'
  const isHighlighted = highlightId === message._id

  const reactions = message.reactions || []
  const readBy = message.readBy || []
  const hasBeenRead = readBy.length > 0

  function getReadStatus() {
    if (hasBeenRead) return { icon: 'read', color: 'var(--success)' }
    return { icon: 'sent', color: 'var(--text-muted)' }
  }

  function renderCheck() {
    return (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" style={{ color: getReadStatus().color }}>
        {hasBeenRead ? (
          <>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            <path d="M12.83 16.17l-1.41 1.41L17 23 23 17l-1.41-1.41L17 20.17z" opacity="0.6" />
          </>
        ) : (
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        )}
      </svg>
    )
  }

  if (isSystem) {
    return (
      <div className="flex justify-center py-2 animate-fade-in">
        <div className="px-4 py-2 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] font-mono">{message.content}</p>
        </div>
      </div>
    )
  }

  if (isEmoji && message.content && !/[^\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(message.content)) {
    return (
      <div className={`flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'} animate-slide-in`}>
        {!isMine && showAvatar && (
          <Avatar src={message.sender?.avatar} name={message.sender?.name} size="sm" />
        )}
        {!isMine && !showAvatar && <div className="w-8 flex-shrink-0" />}
        <div className="text-5xl leading-none">{message.content}</div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-end gap-2.5 animate-slide-in ${isMine ? 'justify-end' : 'justify-start'} ${isHighlighted ? 'animate-message-glow' : ''} relative group`}
    >
      {!isMine && showAvatar && (
        <div className="flex-shrink-0 self-end cursor-pointer" onClick={() => onSenderClick?.(message.sender)}>
          <Avatar src={message.sender?.avatar} name={message.sender?.name} size="sm" />
        </div>
      )}
      {!isMine && isConsecutive && <div className="w-8 flex-shrink-0" />}

      <div className={`max-w-[65%] min-w-0 ${isMine ? 'order-2' : ''}`}>
        {showSenderName && !isMine && showAvatar && (
          <p
            className="text-[11px] font-semibold text-[var(--accent)] mb-0.5 ml-1 cursor-pointer hover:underline"
            onClick={() => onSenderClick?.(message.sender)}
          >
            {message.sender?.name || 'Unknown'}
          </p>
        )}

        {isReply && message.replyTo && (
          <div className="mb-0.5 text-xs text-[var(--text-muted)] px-3 py-1.5 rounded-t-lg border-l-2 border-[var(--accent)] bg-[var(--bg-tertiary)]/50 truncate cursor-pointer hover:bg-[var(--bg-tertiary)] transition">
            <span className="font-medium text-[var(--accent)]">
              {typeof message.replyTo === 'object' ? message.replyTo.sender?.name : 'Reply'}:
            </span>{' '}
            {typeof message.replyTo === 'object' ? message.replyTo.content : ''}
          </div>
        )}

        {isImage && message.fileUrl && (
          <div className="mb-1 rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer hover:opacity-95 transition" onClick={() => onImageClick?.(message.fileUrl)}>
            <img src={message.fileUrl} alt="Image" className="max-w-full max-h-80 object-cover" loading="lazy" />
          </div>
        )}

        {isGif && message.fileUrl && (
          <div className="mb-1 rounded-xl overflow-hidden border border-[var(--border)]">
            <img src={message.fileUrl} alt="GIF" className="max-w-full max-h-72 object-cover" loading="lazy" />
          </div>
        )}

        {isFile && (
          <div className={`mb-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/50 flex items-center gap-3 ${isMine ? 'bg-[var(--accent)]/10' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
              <FiFile className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{message.fileName || 'File'}</p>
              {message.fileSize && <p className="text-xs text-[var(--text-muted)] font-mono">{(message.fileSize / 1024).toFixed(1)} KB</p>}
            </div>
            <a href={message.fileUrl} download={message.fileName} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition flex-shrink-0">
              <FiDownload className="w-4 h-4" />
            </a>
          </div>
        )}

        <div
          className={`relative px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? 'bg-[var(--sent-bubble)] text-white rounded-2xl rounded-br-md shadow-lg shadow-[var(--accent-glow)]'
              : 'bg-[var(--recv-bubble)] text-[var(--text-primary)] rounded-2xl rounded-bl-md border border-[var(--border)]'
          }`}
        >
          {message.content && <div className="[&_a]:text-[var(--accent-light)] [&_a]:underline">{autoLinkify(message.content)}</div>}

          <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] font-mono ${isMine ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {isMine && renderCheck()}
          </div>

          <div className={`absolute -top-9 ${isMine ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg p-0.5`}>
            <Tooltip content="React">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition">
                <FiSmile className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Reply">
              <button onClick={() => onReply?.(message)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition">
                <FiMessageSquare className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            {isMine && (
              <Tooltip content="Edit">
                <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition">
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Delete">
              <button onClick={() => onDelete?.(message._id)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'} flex-wrap`}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact?.(message._id, r.emoji)}
                className={`text-xs px-1.5 py-0.5 rounded-full border transition ${
                  r.users?.some((u) => {
                    const uid = typeof u === 'object' ? u._id : u
                    return uid === message.sender?._id
                  })
                    ? 'bg-[var(--accent)]/20 border-[var(--accent)]/40'
                    : 'bg-[var(--bg-tertiary)]/50 border-[var(--border)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {r.emoji} {r.users?.length || ''}
              </button>
            ))}
          </div>
        )}

        {showEmojiPicker && (
          <div ref={emojiRef} className="absolute bottom-full mb-2 z-50" style={isMine ? { right: 0 } : { left: 0 }}>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl p-2">
              {['❤️', '😆', '😂', '😊', '😍', '😢', '😡', '👍', '👎', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact?.(message._id, emoji); setShowEmojiPicker(false) }}
                  className="text-xl p-1 hover:bg-[var(--bg-hover)] rounded transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function autoLinkify(text) {
  if (!text) return text
  const urlRegex = /(https?:\/\/[^\s<]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{part}</a>
    }
    return part
  })
}
