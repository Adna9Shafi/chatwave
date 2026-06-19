'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { FiX, FiCamera, FiUsers, FiShield, FiUserMinus, FiCopy, FiRefreshCw, FiGlobe, FiLock, FiMessageSquare, FiFile, FiImage, FiTrash2, FiLogOut, FiEdit2, FiCheck, FiStar, FiUserPlus, FiMoreVertical } from 'react-icons/fi'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import DropdownMenu, { DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import Modal from '@/components/ui/Modal'
import useChatStore from '@/store/useChatStore'
import useOnlineUsers from '@/hooks/useOnlineUsers'

export default function GroupInfoPanel({ groupId, open, onClose }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { isUserOnline } = useOnlineUsers()
  const activeGroup = useChatStore((s) => s.activeGroup)
  const groups = useChatStore((s) => s.groups)
  const setActiveGroup = useChatStore((s) => s.setActiveGroup)
  const setGroups = useChatStore((s) => s.setGroups)

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('members')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [settings, setSettings] = useState({})
  const fileRef = useRef(null)

  useEffect(() => {
    if (open && groupId) {
      fetchGroup()
    }
  }, [open, groupId])

  async function fetchGroup() {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (res.ok) {
        const d = await res.json()
        setGroup(d.group)
        setEditName(d.group.name)
        setEditDesc(d.group.description || '')
        setSettings(d.group.settings || {})
        setActiveGroup(d.group)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const currentMember = group?.members?.find((m) => {
    const userId = typeof m.user === 'object' ? m.user._id : m.user
    return userId === session?.user?.id
  })
  const isAdmin = currentMember?.role === 'admin' || group?.admin?._id === session?.user?.id
  const isModerator = currentMember?.role === 'moderator' || isAdmin
  const roleLabel = isAdmin ? 'Admin' : currentMember?.role === 'moderator' ? 'Moderator' : 'Member'

  function getRoleBadge(role) {
    if (role === 'admin') return { label: 'Admin', cls: 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30' }
    if (role === 'moderator') return { label: 'Mod', cls: 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30' }
    return { label: 'Member', cls: 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border)]' }
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDesc.trim(),
          settings,
        }),
      })
      if (res.ok) {
        const d = await res.json()
        setGroup(d.group)
        setActiveGroup(d.group)
        toast.success('Group updated!')
        setEditing(false)
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  async function handleRegenerateInvite() {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateInvite: true }),
      })
      if (res.ok) {
        const d = await res.json()
        setGroup(d.group)
        toast.success('New invite code generated!')
      }
    } catch { toast.error('Failed to regenerate') }
  }

  async function handleCopyInvite() {
    if (group?.inviteCode) {
      const link = `${window.location.origin}/join/${group.inviteCode}`
      try {
        await navigator.clipboard.writeText(link)
        toast.success('Invite link copied!')
      } catch {
        toast.error('Failed to copy')
      }
    }
  }

  async function handleRemoveMember(userId) {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success('Member removed')
        fetchGroup()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to remove')
      }
    } catch { toast.error('Something went wrong') }
  }

  async function handleChangeRole(userId, role) {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) {
        toast.success(`Member ${role === 'moderator' ? 'promoted' : 'demoted'}`)
        fetchGroup()
      }
    } catch { toast.error('Failed to update role') }
  }

  async function handleLeaveGroup() {
    await handleRemoveMember(session?.user?.id)
    onClose()
    router.push('/groups')
  }

  async function handleDeleteGroup() {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Group deleted')
        onClose()
        router.push('/groups')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to delete')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  async function handleAddMember(userId) {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success('Member added!')
        setShowAddMembers(false)
        setSearchQuery('')
        setSearchResults([])
        fetchGroup()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to add member')
      }
    } catch { toast.error('Something went wrong') }
  }

  async function searchUsers(q) {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const d = await res.json()
        const existingIds = group?.members?.map((m) => typeof m.user === 'object' ? m.user._id : m.user) || []
        setSearchResults((d.users || []).filter((u) => !existingIds.includes(u._id)))
      }
    } catch { }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large'); return }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'chatwave/avatars')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        await fetch(`/api/groups/${groupId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: d.url }),
        })
        toast.success('Avatar updated!')
        fetchGroup()
      }
    } catch { toast.error('Upload failed') }
  }

  if (!open) return null

  const sharedImages = group ? [] : [] 
  const sharedFiles = group ? [] : [] 

  return (
    <div className="absolute inset-0 z-40 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-[380px] bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Group Info</h2>
          <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        ) : !group ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">Group not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 text-center border-b border-[var(--border)]">
              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mx-auto overflow-hidden">
                  {group.avatar ? (
                    <img src={group.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent)]/10">
                      <span className="text-2xl font-bold text-[var(--accent)]">{group.name?.[0]?.toUpperCase() || 'G'}</span>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-lg hover:bg-[var(--accent-light)] transition">
                    <FiCamera className="w-3.5 h-3.5" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              {editing ? (
                <div className="space-y-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] text-center focus:outline-none focus:border-[var(--accent)]"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] text-center focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={handleSaveSettings} loading={saving}><FiCheck className="w-3.5 h-3.5" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{group.name}</h3>
                  {group.description && <p className="text-xs text-[var(--text-muted)] mt-1">{group.description}</p>}
                  <div className="flex items-center justify-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> {group.members?.length || 0} members</span>
                    <span>{group.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  {isAdmin && !editing && (
                    <button onClick={() => setEditing(true)} className="mt-2 text-xs text-[var(--accent)] hover:underline">Edit info</button>
                  )}
                </>
              )}
            </div>

            <div className="flex border-b border-[var(--border)]">
              {['members', 'media', 'settings'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-medium transition border-b-2 ${
                    tab === t
                      ? 'text-[var(--accent)] border-[var(--accent)]'
                      : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t === 'members' ? 'Members' : t === 'media' ? 'Media' : 'Settings'}
                </button>
              ))}
            </div>

            {tab === 'members' && (
              <div className="py-2">
                {(isModerator || group.isPublic) && (
                  <button
                    onClick={() => setShowAddMembers(!showAddMembers)}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--bg-hover)] transition"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Add Members
                  </button>
                )}

                {showAddMembers && (
                  <div className="px-4 pb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => searchUsers(e.target.value)}
                      placeholder="Search users..."
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => handleAddMember(user._id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition"
                          >
                            <Avatar src={user.avatar} name={user.name} size="xs" />
                            <span className="text-sm text-[var(--text-primary)]">{user.name}</span>
                            <span className="ml-auto text-xs text-[var(--accent)]">Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {group.members?.map((m) => {
                  const user = typeof m.user === 'object' ? m.user : null
                  if (!user) return null
                  const uid = user._id
                  const role = m.role
                  const isSelf = uid === session?.user?.id
                  const badge = getRoleBadge(role)
                  const online = isUserOnline(uid)
                  const canManage = isAdmin && !isSelf

                  return (
                    <div key={uid} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] transition group">
                      <Avatar src={user.avatar} name={user.name} size="sm" isOnline={online} showStatus />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {user.name} {isSelf && <span className="text-[var(--text-muted)] font-normal">(you)</span>}
                          </p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {online ? 'Online' : user.lastSeen ? `Last seen ${formatDistanceToNow(new Date(user.lastSeen))} ago` : 'Offline'}
                        </p>
                      </div>
                      {canManage && (
                        <DropdownMenu
                          trigger={
                            <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition">
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                          }
                        >
                          <DropdownItem onClick={() => handleChangeRole(uid, role === 'moderator' ? 'member' : 'moderator')}>
                            {role === 'moderator' ? <FiStar className="w-4 h-4" /> : <FiShield className="w-4 h-4" />}
                            {role === 'moderator' ? 'Remove Moderator' : 'Make Moderator'}
                          </DropdownItem>
                          <DropdownItem onClick={() => handleRemoveMember(uid)} danger>
                            <FiUserMinus className="w-4 h-4" /> Remove from Group
                          </DropdownItem>
                        </DropdownMenu>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'media' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Shared Images</h4>
                {sharedImages.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                    <FiImage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No shared images yet
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {sharedImages.slice(0, 12).map((url, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[var(--bg-tertiary)]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-6 mb-3">Files & Links</h4>
                {sharedFiles.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                    <FiFile className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No shared files yet
                  </div>
                ) : (
                  sharedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)]">
                      <FiFile className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-primary)] truncate">{f}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="p-4 space-y-5">
                {isAdmin && (
                  <>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Permissions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">Only admins can message</p>
                            <p className="text-xs text-[var(--text-muted)]">Restrict sending messages</p>
                          </div>
                          <button
                            onClick={() => setSettings((s) => ({ ...s, onlyAdminsCanMessage: !s.onlyAdminsCanMessage }))}
                            className={`relative w-11 h-6 rounded-full transition ${settings.onlyAdminsCanMessage ? 'bg-[var(--accent)]' : 'bg-[var(--bg-hover)]'}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${settings.onlyAdminsCanMessage ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[var(--text-primary)]">Only admins can add members</p>
                            <p className="text-xs text-[var(--text-muted)]">Restrict adding new members</p>
                          </div>
                          <button
                            onClick={() => setSettings((s) => ({ ...s, onlyAdminsCanAddMembers: !s.onlyAdminsCanAddMembers }))}
                            className={`relative w-11 h-6 rounded-full transition ${settings.onlyAdminsCanAddMembers ? 'bg-[var(--accent)]' : 'bg-[var(--bg-hover)]'}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${settings.onlyAdminsCanAddMembers ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {editing && (
                          <Button size="sm" onClick={handleSaveSettings} loading={saving} className="w-full mt-2">Save Settings</Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Invite Link</h4>
                      <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                        <p className="text-xs font-mono text-[var(--text-primary)] mb-2 break-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/join/${group.inviteCode}` : ''}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                            <FiCopy className="w-3.5 h-3.5" /> Copy
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleRegenerateInvite}>
                            <FiRefreshCw className="w-3.5 h-3.5" /> Regenerate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Danger Zone</h4>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={handleLeaveGroup} className="w-full border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/10">
                      <FiLogOut className="w-4 h-4" /> Leave Group
                    </Button>
                    {isAdmin && (
                      <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full">
                        <FiTrash2 className="w-4 h-4" /> Delete Group
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <Modal open={true} onClose={() => setShowDeleteConfirm(false)} title="Delete Group" size="sm">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            This action cannot be undone. Type <strong className="text-[var(--text-primary)]">DELETE</strong> to confirm.
          </p>
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--danger)] transition mb-4"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteGroup} loading={saving} disabled={deleteInput !== 'DELETE'}>
              Delete Group
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function formatDistanceToNow(date) {
  const now = new Date()
  const diffMs = now - new Date(date)
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
