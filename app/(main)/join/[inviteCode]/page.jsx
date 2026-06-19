'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiUsers, FiGlobe, FiLock, FiArrowRight, FiHash } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

export default function JoinGroupPage({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState(null)
  const [inviteCode, setInviteCode] = useState(null)

  useEffect(() => {
    async function getCode() {
      const p = await params
      setInviteCode(p.inviteCode)
    }
    getCode()
  }, [params])

  useEffect(() => {
    if (!inviteCode || status === 'loading') return
    if (!session) { router.push('/login'); return }
    fetchGroup()
  }, [inviteCode, status, session])

  async function fetchGroup() {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/join/${inviteCode}`)
      if (res.ok) {
        const d = await res.json()
        setGroup(d.group)
      } else {
        const d = await res.json()
        setError(d.error || 'Invalid invite link')
      }
    } catch {
      setError('Failed to load group info')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!group) return
    setJoining(true)
    try {
      const res = await fetch(`/api/groups/${group._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      })
      if (res.ok) {
        toast.success(`Joined ${group.name}!`)
        router.push(`/groups/${group._id}`)
      } else {
        const d = await res.json()
        if (d.error?.includes('already a member')) {
          router.push(`/groups/${group._id}`)
          return
        }
        toast.error(d.error || 'Failed to join group')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setJoining(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md px-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center mx-auto mb-5">
            <FiLock className="w-7 h-7 text-[var(--danger)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Invalid Invite Link</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">{error || 'This invite link is invalid or expired.'}</p>
          <Button onClick={() => router.push('/chats')}>Go to Chats</Button>
        </div>
      </div>
    )
  }

  const isMember = group.members?.some((m) => {
    const uid = typeof m.user === 'object' ? m.user._id : m.user
    return uid === session?.user?.id
  })

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="max-w-sm w-full mx-auto p-8">
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl">
          <div className="p-8 text-center">
            <div className="w-24 h-24 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-5 overflow-hidden">
              {group.avatar ? (
                <img src={group.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <FiHash className="w-10 h-10 text-[var(--accent)]" />
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">{group.name}</h2>
            {group.description && (
              <p className="text-sm text-[var(--text-muted)] mb-4">{group.description}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)] mb-6">
              <span className="flex items-center gap-1.5">
                <FiUsers className="w-3.5 h-3.5" />
                {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                {group.isPublic ? (
                  <><FiGlobe className="w-3.5 h-3.5" /> Public group</>
                ) : (
                  <><FiLock className="w-3.5 h-3.5" /> Private group</>
                )}
              </span>
            </div>
            {isMember ? (
              <Button onClick={() => router.push(`/groups/${group._id}`)} className="w-full">
                Go to Group <FiArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleJoin} loading={joining} className="w-full">
                Join Group <FiArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
