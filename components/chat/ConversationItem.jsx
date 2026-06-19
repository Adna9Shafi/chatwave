'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '@/components/ui/Avatar'

export default function ConversationItem({ conversation, currentUserId, isOnline, unreadCount }) {
  const otherParticipant = conversation.participants?.find((p) => p._id !== currentUserId)
  if (!otherParticipant) return null

  const lastMessage = conversation.lastMessage

  return (
    <Link
      href={`/chats/${conversation._id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
    >
      <Avatar
        src={otherParticipant.avatar}
        name={otherParticipant.name}
        size="lg"
        isOnline={isOnline}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {otherParticipant.name || 'Unknown'}
          </h3>
          {lastMessage?.createdAt && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {lastMessage?.content || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
