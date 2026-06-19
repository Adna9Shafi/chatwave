'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { FiX, FiBell, FiTrash2, FiMessageSquare, FiUserPlus, FiAtSign, FiEye } from 'react-icons/fi'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import useNotificationStore from '@/store/useNotificationStore'

export default function NotificationPanel({ open, onClose }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const {
    notifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore()

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const d = await res.json()
        setNotifications(d.notifications || [])
      }
    } catch {} finally { setLoading(false) }
  }

  async function handleClick(notif) {
    if (!notif.read) {
      try {
        await fetch(`/api/notifications/${notif._id}`, { method: 'PUT' })
      } catch {}
      markAsRead(notif._id)
    }
    if (notif.referenceId) {
      const path = notif.referenceType === 'group'
        ? `/groups/${notif.referenceId}`
        : `/chats/${notif.referenceId}`
      router.push(path)
    }
    onClose()
  }

  async function handleMarkAllRead() {
    try {
      await fetch('/api/notifications', { method: 'PUT' })
    } catch {}
    markAllAsRead()
  }

  async function handleClearAll() {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id)
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}`, { method: 'DELETE' })
        )
      )
    } catch {}
    clearAll()
  }

  function getIcon(type) {
    switch (type) {
      case 'message': return <FiMessageSquare className="w-4 h-4 text-[var(--accent)]" />
      case 'mention': return <FiAtSign className="w-4 h-4 text-[var(--warning)]" />
      case 'contact_request': return <FiUserPlus className="w-4 h-4 text-[var(--success)]" />
      case 'read_receipt': return <FiEye className="w-4 h-4 text-[var(--text-muted)]" />
      default: return <FiBell className="w-4 h-4 text-[var(--text-muted)]" />
    }
  }

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-[380px] bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FiBell className="w-4 h-4 text-[var(--text-primary)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-[var(--accent)] hover:underline px-2 py-1">Mark all read</button>
            )}
            <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
              <FiBell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <>
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 transition hover:bg-[var(--bg-hover)] ${
                    !notif.read ? 'bg-[var(--accent-glow)]/30' : ''
                  }`}
                >
                  <div className="flex-shrink-0 mt-1 w-5 h-5 flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      {notif.sender?.name && <span className="font-semibold">{notif.sender.name}</span>}
                      {notif.title}
                    </p>
                    {notif.body && <p className="text-xs text-[var(--text-muted)] mt-0.5">{notif.body}</p>}
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0 mt-2" />
                  )}
                </button>
              ))}

              <div className="p-4 border-t border-[var(--border)]">
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Clear all notifications
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
