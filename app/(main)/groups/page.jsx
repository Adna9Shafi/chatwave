'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { FiPlus, FiUsers, FiHash, FiLock, FiGlobe } from 'react-icons/fi'
import NewGroupModal from '@/components/chat/NewGroupModal'
import Spinner from '@/components/ui/Spinner'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const pathname = usePathname()

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    try {
      const res = await fetch('/api/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Spinner /></div>
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Your Groups ({groups.length})</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]"
        >
          <FiPlus className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mb-5">
              <FiUsers className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">No groups yet</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">Create a group to chat with multiple people at once</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]"
            >
              <FiPlus className="w-4 h-4 inline mr-1.5" /> Create Group
            </button>
          </div>
        ) : (
          <div className="py-2">
            {groups.map((group) => {
              const isActive = pathname === `/groups/${group._id}`
              return (
                <Link
                  key={group._id}
                  href={`/groups/${group._id}`}
                  className={`flex items-center gap-3 px-5 py-3.5 mx-2 rounded-xl transition group ${
                    isActive ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {group.avatar ? (
                      <img src={group.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiHash className="w-5 h-5 text-[var(--accent)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate flex items-center gap-2">
                        {group.name}
                        {group.isPublic ? (
                          <FiGlobe className="w-3 h-3 text-[var(--text-muted)]" />
                        ) : (
                          <FiLock className="w-3 h-3 text-[var(--text-muted)]" />
                        )}
                      </h3>
                      {group.lastMessageAt && (
                        <span className="text-[11px] font-mono text-[var(--text-muted)] flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(group.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {group.members?.length} members{group.lastMessage?.content ? ` · ${group.lastMessage.content}` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <NewGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchGroups}
      />
    </div>
  )
}
