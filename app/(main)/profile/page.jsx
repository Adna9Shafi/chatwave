'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiCamera, FiSave, FiUser, FiAtSign, FiInfo, FiLock, FiBell, FiShield, FiSun, FiMoon, FiMonitor, FiKey, FiDownload, FiTrash2, FiEye, FiEyeOff, FiMessageSquare, FiGlobe } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'

const TABS = [
  { key: 'notifications', label: 'Notifications', icon: FiBell },
  { key: 'privacy', label: 'Privacy', icon: FiShield },
  { key: 'appearance', label: 'Appearance', icon: FiSun },
  { key: 'account', label: 'Account', icon: FiKey },
]

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileRef = useRef(null)
  const coverRef = useRef(null)

  const [tab, setTab] = useState('notifications')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [status, setStatus] = useState('online')
  const [customStatus, setCustomStatus] = useState('')

  const [notifSettings, setNotifSettings] = useState({
    messages: true,
    groupMessages: true,
    soundEnabled: true,
    desktopNotifications: false,
    emailDigest: false,
  })
  const [privacySettings, setPrivacySettings] = useState({
    whoCanMessage: 'everyone',
    showOnlineStatus: 'everyone',
    readReceipts: true,
    lastSeen: 'everyone',
  })
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    chatBubbleStyle: 'modern',
    fontSize: 'medium',
    compactMode: false,
  })
  const [passwordForm, setPasswordForm] = useState({ old: '', newPass: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setAvatarPreview(session.user.image || '')
      fetchProfile()
    }
  }, [session])

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`)
      if (res.ok) {
        const d = await res.json()
        const u = d.user
        setUsername(u.username || '')
        setBio(u.bio || '')
        setCoverPreview(u.coverImage || '')
        setStatus(u.status || 'online')
        if (u.settings) {
          setNotifSettings((s) => ({ ...s, ...u.settings }))
        }
        if (u.settings?.privacy) setPrivacySettings(u.settings.privacy)
        if (u.settings?.appearance) setAppearanceSettings(u.settings.appearance)
      }
    } catch { }
  }

  async function handleUpload(e, type) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'chatwave/profiles')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        if (type === 'avatar') setAvatarPreview(d.url)
        else setCoverPreview(d.url)
      }
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleSave() {
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          avatar: avatarPreview,
          coverImage: coverPreview,
          status,
          settings: {
            ...notifSettings,
            privacy: privacySettings,
            appearance: appearanceSettings,
          },
        }),
      })
      if (res.ok) {
        await update({ name: name.trim(), image: avatarPreview })
        toast.success('Profile updated!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to update')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  async function handleChangePassword() {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Passwords do not match'); return
    }
    if (passwordForm.newPass.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setChangingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwordForm.old,
          newPassword: passwordForm.newPass,
        }),
      })
      if (res.ok) {
        toast.success('Password changed!')
        setPasswordForm({ old: '', newPass: '', confirm: '' })
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to change password')
      }
    } catch { toast.error('Something went wrong') }
    finally { setChangingPassword(false) }
  }

  async function handleDeleteAccount() {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${session?.user?.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Account deleted')
        router.push('/login')
      }
    } catch { toast.error('Failed to delete') }
    finally { setSaving(false) }
  }

  function requestDesktopPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        setNotifSettings((s) => ({ ...s, desktopNotifications: perm === 'granted' }))
      })
    }
  }

  const isDirty = true

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Profile</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your account and settings</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] overflow-hidden mb-6">
          <div
            className="h-32 bg-gradient-to-r from-[var(--accent)]/40 to-[var(--accent)]/10 relative group cursor-pointer"
            onClick={() => coverRef.current?.click()}
          >
            {coverPreview && <img src={coverPreview} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
              <FiCamera className="w-6 h-6 text-white" />
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'cover')} className="hidden" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex justify-center -mt-14 mb-4 relative">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Avatar src={avatarPreview} name={name} size="xl" className="ring-4 ring-[var(--bg-secondary)]" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition">
                  <FiCamera className="w-6 h-6 text-white" />
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleUpload(e, 'avatar')} className="hidden" />
              </div>
              {uploading && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  status === 'online' ? 'bg-[var(--success)]' :
                  status === 'away' ? 'bg-[var(--warning)]' :
                  status === 'dnd' ? 'bg-[var(--danger)]' : 'bg-[var(--text-muted)]'
                }`} />
                <span className="text-sm font-medium text-[var(--text-primary)]">{name || 'User'}</span>
              </div>
              {customStatus && <p className="text-xs text-[var(--text-muted)] text-center">{customStatus}</p>}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {[
                { key: 'online', label: 'Online', color: 'var(--success)' },
                { key: 'away', label: 'Away', color: 'var(--warning)' },
                { key: 'dnd', label: 'Do Not Disturb', color: 'var(--danger)' },
                { key: 'invisible', label: 'Invisible', color: 'var(--text-muted)' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatus(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                    status === s.key
                      ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5"><FiUser className="w-3 h-3" /> Display Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5"><FiAtSign className="w-3 h-3" /> Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5"><FiLock className="w-3 h-3" /> Email</label>
                <div className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border)] text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <FiLock className="w-3 h-3" /> {session?.user?.email || ''}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5"><FiInfo className="w-3 h-3" /> Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} maxLength={160} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition resize-none" />
                <p className="text-[11px] font-mono text-[var(--text-muted)] text-right mt-1">{bio.length}/160</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] mb-1.5"><FiMessageSquare className="w-3 h-3" /> Custom Status</label>
                <input type="text" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} placeholder="What's on your mind?" maxLength={80} className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
                tab === t.key ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6 mb-6">
          {tab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Notification Preferences</h3>
              <ToggleRow label="Message notifications" desc="Get notified of new messages" checked={notifSettings.messages} onChange={(v) => setNotifSettings((s) => ({ ...s, messages: v }))} />
              <ToggleRow label="Group message notifications" desc="Get notified of group messages" checked={notifSettings.groupMessages} onChange={(v) => setNotifSettings((s) => ({ ...s, groupMessages: v }))} />
              <ToggleRow label="Sound enabled" desc="Play sound for incoming messages" checked={notifSettings.soundEnabled} onChange={(v) => setNotifSettings((s) => ({ ...s, soundEnabled: v }))} />
              <ToggleRow label="Desktop notifications" desc="Show notifications on your desktop" checked={notifSettings.desktopNotifications} onChange={(v) => { if (v) requestDesktopPermission(); else setNotifSettings((s) => ({ ...s, desktopNotifications: false })) }} />
              <ToggleRow label="Email digest (weekly)" desc="Receive weekly message summary" checked={notifSettings.emailDigest} onChange={(v) => setNotifSettings((s) => ({ ...s, emailDigest: v }))} />
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Privacy Settings</h3>
              <SelectRow label="Who can message me" value={privacySettings.whoCanMessage} options={[{ v: 'everyone', l: 'Everyone' }, { v: 'contacts', l: 'Contacts Only' }]} onChange={(v) => setPrivacySettings((s) => ({ ...s, whoCanMessage: v }))} />
              <SelectRow label="Show online status" value={privacySettings.showOnlineStatus} options={[{ v: 'everyone', l: 'Everyone' }, { v: 'contacts', l: 'Contacts Only' }, { v: 'nobody', l: 'Nobody' }]} onChange={(v) => setPrivacySettings((s) => ({ ...s, showOnlineStatus: v }))} />
              <ToggleRow label="Read receipts" desc="Let others know you've read their messages" checked={privacySettings.readReceipts} onChange={(v) => setPrivacySettings((s) => ({ ...s, readReceipts: v }))} />
              <SelectRow label="Last seen" value={privacySettings.lastSeen} options={[{ v: 'everyone', l: 'Everyone' }, { v: 'contacts', l: 'Contacts Only' }, { v: 'nobody', l: 'Nobody' }]} onChange={(v) => setPrivacySettings((s) => ({ ...s, lastSeen: v }))} />
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Theme</p>
                <div className="flex gap-3">
                  {[
                    { key: 'dark', icon: FiMoon, label: 'Dark' },
                    { key: 'light', icon: FiSun, label: 'Light' },
                    { key: 'system', icon: FiMonitor, label: 'System' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setAppearanceSettings((s) => ({ ...s, theme: t.key }))}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                        appearanceSettings.theme === t.key ? 'border-[var(--accent)] bg-[var(--accent-glow)]' : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <SelectRow label="Chat bubble style" value={appearanceSettings.chatBubbleStyle} options={[{ v: 'modern', l: 'Modern (rounded)' }, { v: 'classic', l: 'Classic' }]} onChange={(v) => setAppearanceSettings((s) => ({ ...s, chatBubbleStyle: v }))} />
              <SelectRow label="Font size" value={appearanceSettings.fontSize} options={[{ v: 'small', l: 'Small' }, { v: 'medium', l: 'Medium' }, { v: 'large', l: 'Large' }]} onChange={(v) => setAppearanceSettings((s) => ({ ...s, fontSize: v }))} />
              <ToggleRow label="Compact mode" desc="Reduce spacing between messages" checked={appearanceSettings.compactMode} onChange={(v) => setAppearanceSettings((s) => ({ ...s, compactMode: v }))} />
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Account</h3>
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Change Password</p>
                <div className="space-y-3">
                  <input type="password" value={passwordForm.old} onChange={(e) => setPasswordForm((s) => ({ ...s, old: e.target.value }))} placeholder="Current password" className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
                  <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm((s) => ({ ...s, newPass: e.target.value }))} placeholder="New password" className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
                  <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((s) => ({ ...s, confirm: e.target.value }))} placeholder="Confirm new password" className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition" />
                  <Button size="sm" onClick={handleChangePassword} loading={changingPassword} disabled={!passwordForm.old || !passwordForm.newPass || !passwordForm.confirm}>
                    <FiKey className="w-3.5 h-3.5" /> Change Password
                  </Button>
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Data</p>
                <Button variant="outline" size="sm" onClick={() => toast.success('Processing your export...', { icon: '📦', duration: 3000 })}>
                  <FiDownload className="w-3.5 h-3.5" /> Export My Data
                </Button>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--text-danger)] mb-2">Danger Zone</p>
                <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <FiTrash2 className="w-3.5 h-3.5" /> Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} loading={saving}>
            <FiSave className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal open={true} onClose={() => setShowDeleteConfirm(false)} title="Delete Account" size="sm">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            This will permanently delete your account. Type <strong className="text-[var(--text-primary)]">DELETE</strong> to confirm.
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
            <Button variant="danger" onClick={handleDeleteAccount} loading={saving} disabled={deleteInput !== 'DELETE'}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)]">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition flex-shrink-0 ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-hover)]'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[var(--text-primary)]">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </div>
  )
}
