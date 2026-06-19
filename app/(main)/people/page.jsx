'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FiSearch, FiMessageSquare, FiUserPlus, FiUserCheck, FiUserX, FiUsers, FiShield, FiArrowRight, FiCheck } from 'react-icons/fi'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import useOnlineUsers from '@/hooks/useOnlineUsers'
import useChatStore from '@/store/useChatStore'

const TABS = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'find', label: 'Find People' },
  { key: 'blocked', label: 'Blocked' },
]

export default function PeoplePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState('find')
  const { isUserOnline } = useOnlineUsers()
  const conversations = useChatStore((s) => s.conversations)
  const blockedUsers = useChatStore((s) => s.blockedUsers)
  const setBlockedUsers = useChatStore((s) => s.setBlockedUsers)

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="flex border-b border-[var(--border)] px-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-4 text-sm font-medium transition border-b-2 ${
              tab === t.key
                ? 'text-[var(--accent)] border-[var(--accent)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'find' && <FindPeopleTab session={session} router={router} isUserOnline={isUserOnline} />}
        {tab === 'contacts' && <ContactsTab session={session} router={router} conversations={conversations} isUserOnline={isUserOnline} />}
        {tab === 'blocked' && <BlockedTab session={session} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} />}
      </div>
    </div>
  )
}

function FindPeopleTab({ session, router, isUserOnline }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const debouncedSearch = useCallback(
    (() => {
      let timer
      return (v) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          setSearch(v)
          if (v.length > 1 || v.length === 0) fetchUsers(v)
        }, 300)
      }
    })(),
    []
  )

  async function fetchUsers(query) {
    setLoading(true)
    try {
      const url = query ? `/api/users?q=${encodeURIComponent(query)}` : '/api/users'
      const res = await fetch(url)
      if (res.ok) { const d = await res.json(); setUsers(d.users || []) }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function startConversation(userId) {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: userId }),
      })
      if (res.ok) {
        const d = await res.json()
        router.push(`/chats/${d.conversation._id}`)
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } catch { toast.error('Something went wrong') }
  }

  async function sendContactRequest(userId) {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId }),
      })
      if (res.ok) {
        toast.success('Contact request sent!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to send request')
      }
    } catch { toast.error('Something went wrong') }
  }

  return (
    <div>
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search by name, email, or @username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 pb-4">
          {users.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <FiUsers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? 'No users found' : 'No other users yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((user) => {
                const online = isUserOnline(user._id)
                return (
                  <div
                    key={user._id}
                    className="flex flex-col items-center p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--border-light)] transition group"
                  >
                    <div className="relative mb-3">
                      <Avatar src={user.avatar} name={user.name} size="xl" />
                      {online && <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--success)] border-2 border-[var(--bg-secondary)] animate-pulse-dot" />}
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-full">{user.name}</h3>
                    <p className="text-xs font-mono text-[var(--text-muted)] mb-1">@{user.username || ''}</p>
                    {user.bio && <p className="text-xs text-[var(--text-muted)] text-center line-clamp-2 mb-3 max-w-[200px]">{user.bio}</p>}
                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => startConversation(user._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent)] hover:text-white transition"
                      >
                        <FiMessageSquare className="w-3.5 h-3.5" />
                        Message
                      </button>
                      <button
                        onClick={() => sendContactRequest(user._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-[var(--border)] transition"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContactsTab({ session, router, conversations, isUserOnline }) {
  const sorted = [...(conversations || [])].sort(
    (a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt)
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <FiUsers className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No contacts yet</p>
        <p className="text-xs mt-1">Start a conversation to add contacts</p>
      </div>
    )
  }

  return (
    <div className="py-2">
      {sorted.map((conv) => {
        const other = conv.participants?.find((p) => p._id !== session?.user?.id)
        if (!other) return null
        const online = isUserOnline(other._id)
        return (
          <button
            key={conv._id}
            onClick={() => router.push(`/chats/${conv._id}`)}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition"
          >
            <Avatar src={other.avatar} name={other.name} size="md" isOnline={online} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{other.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {conv.lastMessage?.content || 'No messages yet'}
                <span className="ml-1.5 text-[var(--text-muted)]">
                  {conv.lastMessageAt ? `· ${formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}` : ''}
                </span>
              </p>
            </div>
            <FiArrowRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          </button>
        )
      })}
    </div>
  )
}

function BlockedTab({ session, blockedUsers, setBlockedUsers }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlocked()
  }, [])

  async function fetchBlocked() {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`)
      if (res.ok) {
        const d = await res.json()
        setBlockedUsers(d.user?.blockedUsers || [])
      }
    } catch { }
    finally { setLoading(false) }
  }

  async function handleUnblock(userId) {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unblockUser: userId }),
      })
      if (res.ok) {
        toast.success('User unblocked')
        fetchBlocked()
      }
    } catch { toast.error('Failed to unblock') }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" /></div>
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <FiUserX className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">No blocked users</p>
      </div>
    )
  }

  return (
    <div className="py-2">
      {blockedUsers.map((user) => {
        const uid = typeof user === 'object' ? user._id : user
        const name = typeof user === 'object' ? user.name : 'Unknown'
        const avatar = typeof user === 'object' ? user.avatar : ''
        return (
          <div key={uid} className="flex items-center gap-3 px-5 py-3">
            <Avatar src={avatar} name={name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)]">{name}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleUnblock(uid)}>
              <FiCheck className="w-3.5 h-3.5" /> Unblock
            </Button>
          </div>
        )
      })}
    </div>
  )
}
