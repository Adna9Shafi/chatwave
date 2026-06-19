'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiChevronLeft, FiPhone, FiVideo, FiSearch, FiMoreVertical, FiUserX, FiBellOff, FiTrash2, FiFlag, FiShield, FiInfo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import DropdownMenu, { DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import Tooltip from '@/components/ui/Tooltip'
import useChatStore from '@/store/useChatStore'

export default function ChatHeader({ conversation, group, onSearchToggle, onInfoToggle }) {
  const { data: session } = useSession()
  const router = useRouter()
  const onlineUsers = useChatStore((s) => s.onlineUsers)
  const awayUsers = useChatStore((s) => s.awayUsers)

  if (!conversation && !group) return null

  const isGroup = !!group

  const otherParticipant = conversation?.participants?.find((p) => p._id !== session?.user?.id)
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant._id) : false
  const isAway = otherParticipant ? awayUsers.includes(otherParticipant._id) : false

  const name = isGroup ? group.name : otherParticipant?.name || 'Unknown'
  const avatarSrc = isGroup ? group.avatar : otherParticipant?.avatar
  const membersCount = isGroup ? group.members?.length : 0
  const statusText = isGroup
    ? `${membersCount} member${membersCount !== 1 ? 's' : ''}`
    : isOnline
      ? isAway ? 'Away' : 'Online'
      : 'Offline'

  function getStatusIndicator() {
    if (isGroup) return null
    if (isOnline && isAway) return 'bg-[var(--warning)]'
    if (isOnline) return 'bg-[var(--success)] animate-pulse-dot'
    return 'bg-[var(--text-muted)]'
  }

  function handleComingSoon(label) {
    toast(`${label} coming soon!`, { icon: '🚧', duration: 2000 })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex-shrink-0">
      <button
        onClick={() => router.back()}
        className="lg:hidden p-1 -ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      <Avatar
        src={avatarSrc}
        name={name}
        size="md"
        isOnline={!isGroup ? isOnline : undefined}
        showStatus={!isGroup}
      />

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {isGroup && <span className="mr-1 text-[var(--text-muted)]">#</span>}
          {name}
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
          {isGroup ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {statusText}
            </>
          ) : isOnline ? (
            <>
              <span className={`w-2 h-2 rounded-full ${getStatusIndicator()}`} />
              {statusText}
            </>
          ) : 'Offline'}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        {isGroup ? (
          <Tooltip content="Group info">
            <button
              onClick={onInfoToggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition"
            >
              <FiInfo className="w-4 h-4" />
            </button>
          </Tooltip>
        ) : (
          <>
            <Tooltip content="Voice call">
              <button onClick={() => handleComingSoon('Voice calls')} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition">
                <FiPhone className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Video call">
              <button onClick={() => handleComingSoon('Video calls')} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition">
                <FiVideo className="w-4 h-4" />
              </button>
            </Tooltip>
          </>
        )}
        <Tooltip content="Search in chat">
          <button onClick={onSearchToggle} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition">
            <FiSearch className="w-4 h-4" />
          </button>
        </Tooltip>
        <DropdownMenu
          trigger={
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          }
        >
          {isGroup ? (
            <>
              <DropdownItem onClick={onInfoToggle}>
                <FiInfo className="w-4 h-4" />
                Group info
              </DropdownItem>
              <DropdownItem onClick={() => handleComingSoon('Mute group')}>
                <FiBellOff className="w-4 h-4" />
                Mute notifications
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem onClick={() => handleComingSoon('View profile')}>
                <FiShield className="w-4 h-4" />
                View profile
              </DropdownItem>
              <DropdownItem onClick={() => handleComingSoon('Mute')}>
                <FiBellOff className="w-4 h-4" />
                Mute notifications
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => handleComingSoon('Block')}>
                <FiUserX className="w-4 h-4" />
                Block user
              </DropdownItem>
              <DropdownItem onClick={() => handleComingSoon('Report')}>
                <FiFlag className="w-4 h-4" />
                Report
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => handleComingSoon('Delete chat')} danger>
                <FiTrash2 className="w-4 h-4" />
                Delete chat
              </DropdownItem>
            </>
          )}
        </DropdownMenu>
      </div>
    </div>
  )
}
