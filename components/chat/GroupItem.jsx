'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function GroupItem({ group }) {
  return (
    <Link
      href={`/groups/${group._id}`}
      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        {group.avatar ? (
          <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10">
            {group.name?.[0]?.toUpperCase() || 'G'}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {group.name}
          </h3>
          {group.lastMessageAt && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatDistanceToNow(new Date(group.lastMessageAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {group.members?.length || 0} members
          {group.lastMessage?.content ? ` · ${group.lastMessage.content}` : ''}
        </p>
      </div>
    </Link>
  )
}
