'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { FiSearch, FiX, FiCheck, FiUsers, FiGlobe, FiLock, FiCamera, FiArrowRight, FiChevronLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/shapes/svg?seed=group1&backgroundColor=6C63FF',
  'https://api.dicebear.com/7.x/shapes/svg?seed=group2&backgroundColor=23C55E',
  'https://api.dicebear.com/7.x/shapes/svg?seed=group3&backgroundColor=F59E0B',
  'https://api.dicebear.com/7.x/shapes/svg?seed=group4&backgroundColor=EF4444',
  'https://api.dicebear.com/7.x/shapes/svg?seed=group5&backgroundColor=EC4899',
  'https://api.dicebear.com/7.x/shapes/svg?seed=group6&backgroundColor=14B8A6',
]

export default function NewGroupModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (open) {
      setStep(1)
      setSearch('')
      setSelectedIds([])
      setName('')
      setDescription('')
      setAvatar('')
      setIsPublic(false)
      fetchUsers()
    }
  }, [open])

  async function fetchUsers(query) {
    setLoading(true)
    try {
      const url = query ? `/api/users?q=${encodeURIComponent(query)}` : '/api/users'
      const res = await fetch(url)
      if (res.ok) {
        const d = await res.json()
        setUsers(d.users || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useCallback(
    (() => {
      let timer
      return (v) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          if (v.length > 1 || v.length === 0) fetchUsers(v)
        }, 300)
      }
    })(),
    []
  )

  function toggleUser(userId) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : prev.length < 256
          ? [...prev, userId]
          : prev
    )
    if (selectedIds.length >= 256) {
      toast.error('Maximum 256 members')
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'chatwave/avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setAvatar(d.url)
        toast.success('Avatar uploaded!')
      }
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleCreate() {
    if (!name.trim() || selectedIds.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description,
          avatar: avatar || undefined,
          memberIds: selectedIds,
          isPublic,
        }),
      })
      if (res.ok) {
        toast.success('Group created!')
        onCreated?.()
        onClose()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to create group')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title={step === 1 ? 'Add Members' : 'Group Details'} size="md">
      <div className="min-h-[400px]">
        {step === 1 ? (
          <div>
            <div className="relative mb-4">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value) }}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
              />
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
                {selectedIds.map((id) => {
                  const user = users.find((u) => u._id === id)
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent)]/30">
                      <Avatar src={user?.avatar} name={user?.name} size="xs" />
                      <span className="text-xs text-[var(--text-primary)]">{user?.name || ''}</span>
                      <button onClick={() => toggleUser(id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-0.5">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="max-h-[300px] overflow-y-auto space-y-0.5">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">No users found</div>
              ) : (
                users.map((user) => {
                  const isSelected = selectedIds.includes(user._id)
                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleUser(user._id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                        isSelected ? 'bg-[var(--accent-glow)]' : 'hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">@{user.username || ''}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                        isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)]'
                      }`}>
                        {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)]">{selectedIds.length} member{selectedIds.length !== 1 ? 's' : ''} selected</span>
              <Button onClick={() => setStep(2)} disabled={selectedIds.length === 0}>
                Next <FiArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative group cursor-pointer mb-3" onClick={() => fileRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center overflow-hidden ring-2 ring-[var(--border)]">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiUsers className="w-8 h-8 text-[var(--accent)]" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                  <FiCamera className="w-5 h-5 text-white" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              {uploading && <div className="w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />}

              {!avatar && (
                <div className="flex gap-2 mb-2">
                  {DEFAULT_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatar(url)}
                      className={`w-8 h-8 rounded-lg overflow-hidden ring-2 transition ${avatar === url ? 'ring-[var(--accent)]' : 'ring-transparent hover:ring-[var(--border)]'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Team"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this group about?"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                {isPublic ? <FiGlobe className="w-4 h-4 text-[var(--success)]" /> : <FiLock className="w-4 h-4 text-[var(--warning)]" />}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{isPublic ? 'Public Group' : 'Private Group'}</p>
                  <p className="text-xs text-[var(--text-muted)]">{isPublic ? 'Anyone can find and join' : 'Invite only'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-11 h-6 rounded-full transition ${
                  isPublic ? 'bg-[var(--accent)]' : 'bg-[var(--bg-hover)]'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                  isPublic ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            <div className="flex gap-3 justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <FiChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleCreate} loading={saving} disabled={!name.trim() || selectedIds.length === 0}>
                Create Group
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
