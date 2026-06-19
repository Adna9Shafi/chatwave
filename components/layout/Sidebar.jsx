'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { FiSearch, FiPlus, FiMessageSquare, FiMoreHorizontal, FiMapPin, FiArchive, FiBellOff, FiTrash2, FiSlash, FiX, FiCheck } from 'react-icons/fi'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DropdownMenu, { DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import Input from '@/components/ui/Input'
import useChatStore from '@/store/useChatStore'
import useConversation from '@/hooks/useConversation'
import useOnlineUsers from '@/hooks/useOnlineUsers'

const pageTitles = {
  '/chats': { title: 'Messages', subtitle: 'Your conversations' },
  '/groups': { title: 'Groups', subtitle: 'Group chats' },
  '/people': { title: 'People', subtitle: 'Find & connect' },
  '/profile': { title: 'Profile', subtitle: 'Your settings' },
}

export default function Sidebar({ children }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const conversations = useChatStore((state) => state.conversations)
  const { fetchConversations } = useConversation()
  const { isUserOnline } = useOnlineUsers()
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)

  const page = pageTitles[pathname] || pageTitles['/chats']
  const isChatPage = pathname.startsWith('/chats')
  const isGroupPage = pathname.startsWith('/groups')

  useEffect(() => {
    if (isChatPage) fetchConversations()
  }, [isChatPage, fetchConversations])

  const currentPath = pathname.split('/')[1] || 'chats'
  const showConversations = currentPath === 'chats' && conversations.length > 0

  return (
    <div className="w-[320px] flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">{page.title}</h1>
            <p className="text-xs text-[var(--text-muted)]">{page.subtitle}</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]">
            <FiPlus className="w-4 h-4 text-white" />
          </button>
        </div>
        <Input
          placeholder={`Search ${currentPath}...`}
          icon={FiSearch}
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentPath === 'chats' && children ? (
          children
        ) : !showConversations && currentPath === 'chats' ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 mt-[-40px]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mb-4">
              <FiMessageSquare className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">No conversations yet</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5 max-w-[200px]">
              Start a new chat by finding someone to talk to
            </p>
            <Link
              href="/people"
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]"
            >
              Find People
            </Link>
          </div>
        ) : currentPath === 'chats' ? (
          <ConversationList conversations={conversations} session={session} isUserOnline={isUserOnline} search={search} />
        ) : null}
      </div>
    </div>
  )
}

function ConversationList({ conversations, session, isUserOnline, search }) {
  const pathname = usePathname()
  const pinned = conversations.filter((c) => c.isPinned?.includes(session?.user?.id))
  const unpinned = conversations.filter((c) => !c.isPinned?.includes(session?.user?.id))

  const filtered = (list) =>
    list.filter((c) => {
      if (!search) return true
      const other = c.participants?.find((p) => p._id !== session?.user?.id)
      return other?.name?.toLowerCase().includes(search.toLowerCase())
    })

  const renderItem = (conversation) => {
    const other = conversation.participants?.find((p) => p._id !== session?.user?.id)
    if (!other) return null
    const isActive = pathname === `/chats/${conversation._id}`
    const isOnline = isUserOnline(other._id)
    const unread = conversation.unreadCount?.[session?.user?.id] || 0
    const lastMsg = conversation.lastMessage

    return (
      <ConversationItem
        key={conversation._id}
        conversation={conversation}
        other={other}
        isActive={isActive}
        isOnline={isOnline}
        unread={unread}
        lastMsg={lastMsg}
        currentUserId={session?.user?.id}
      />
    )
  }

  return (
    <div className="pb-2">
      {filtered(pinned).length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 px-5 py-2">
            <FiMapPin className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pinned</span>
          </div>
          {filtered(pinned).map(renderItem)}
          <div className="mx-4 my-1 h-px bg-[var(--border)]" />
        </div>
      )}
      {filtered(unpinned).map(renderItem)}
      {filtered([...pinned, ...unpinned]).length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No results found</p>
        </div>
      )}
    </div>
  )
}

function ConversationItem({ conversation, other, isActive, isOnline, unread, lastMsg, currentUserId }) {
  return (
    <DropdownMenu
      trigger={
        <Link
          href={`/chats/${conversation._id}`}
          className={`relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-150 group ${
            isActive
              ? 'bg-[var(--bg-hover)]'
              : 'hover:bg-[var(--bg-hover)]'
          }`}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          )}
          <Avatar src={other.avatar} name={other.name} size="md" isOnline={isOnline} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm truncate ${unread > 0 ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>
                {other.name || 'Unknown'}
              </h3>
              <span className={`text-[11px] flex-shrink-0 ml-2 font-mono ${unread > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                {lastMsg?.createdAt ? formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false }) : ''}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">
                {lastMsg?.content || 'Start a conversation...'}
              </p>
              {unread > 0 && <Badge variant="count" count={unread} />}
            </div>
          </div>
        </Link>
      }
      align="end"
    >
      <DropdownItem onClick={() => {}}><FiMapPin className="w-4 h-4" /> Pin conversation</DropdownItem>
      <DropdownItem onClick={() => {}}><FiArchive className="w-4 h-4" /> Archive</DropdownItem>
      <DropdownItem onClick={() => {}}><FiBellOff className="w-4 h-4" /> Mute notifications</DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={() => {}}><FiTrash2 className="w-4 h-4" /> Clear chat</DropdownItem>
      <DropdownItem onClick={() => {}}><FiSlash className="w-4 h-4" /> Block user</DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={() => {}} danger><FiX className="w-4 h-4" /> Delete conversation</DropdownItem>
    </DropdownMenu>
  )
}
