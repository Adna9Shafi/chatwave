'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  FiMessageSquare,
  FiUsers,
  FiUserPlus,
  FiBell,
  FiSettings,
  FiLogOut,
  FiUser,
  FiMoon,
  FiSun,
  FiMessageCircle,
} from 'react-icons/fi'
import Tooltip from '@/components/ui/Tooltip'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DropdownMenu, { DropdownItem, DropdownDivider } from '@/components/ui/DropdownMenu'
import NotificationPanel from './NotificationPanel'
import useNotificationStore from '@/store/useNotificationStore'

const navItems = [
  { href: '/chats', icon: FiMessageSquare, label: 'Chats' },
  { href: '/groups', icon: FiUsers, label: 'Groups' },
  { href: '/people', icon: FiUserPlus, label: 'People' },
]

function getSavedTheme() {
  if (typeof window === 'undefined') return 'dark'
  return localStorage.getItem('chatwave-theme') || 'dark'
}

export default function NavRail() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [theme, setTheme] = useState(getSavedTheme)
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const unreadCount = useNotificationStore((s) =>
    s.notifications.filter((n) => !n.read).length
  )

  useEffect(() => {
    localStorage.setItem('chatwave-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  function isActive(href) {
    if (href === '/chats') return pathname.startsWith('/chats')
    if (href === '/groups') return pathname.startsWith('/groups')
    return pathname.startsWith(href)
  }

  function toggleTheme() {
    setTheme((p) => (p === 'dark' ? 'light' : 'dark'))
  }

  return (
    <>
      <nav className="w-[72px] flex-shrink-0 bg-[var(--nav-rail)] border-r border-[var(--border)] flex flex-col items-center py-4 gap-1 z-30">
        <Link
          href="/chats"
          className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent-glow)]"
        >
          <FiMessageCircle className="w-5 h-5 text-white" />
        </Link>

        <div className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Tooltip key={item.href} content={item.label} side="right">
                <Link
                  href={item.href}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
                    active
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  )}
                  <item.icon className="w-5 h-5" />
                </Link>
              </Tooltip>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-1 mt-auto">
          <Tooltip content="Notifications" side="right">
            <button
              onClick={() => setNotifPanelOpen(!notifPanelOpen)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-all duration-150"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge variant="count" count={unreadCount} className="absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Settings" side="right">
            <Link
              href="/profile"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)] transition-all duration-150"
            >
              <FiSettings className="w-5 h-5" />
            </Link>
          </Tooltip>

          <DropdownMenu
            trigger={
              <button className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-[var(--bg-hover)] transition-all duration-150 mt-1">
                <Avatar
                  src={session?.user?.image}
                  name={session?.user?.name}
                  size="sm"
                />
              </button>
            }
            align="end"
            className="mt-1"
          >
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {session?.user?.email || ''}
              </p>
            </div>
            <DropdownItem onClick={() => window.location.href = '/profile'}>
              <FiUser className="w-4 h-4" /> View Profile
            </DropdownItem>
            <DropdownItem onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => signOut({ callbackUrl: '/login' })} danger>
              <FiLogOut className="w-4 h-4" /> Sign Out
            </DropdownItem>
          </DropdownMenu>
        </div>
      </nav>

      {notifPanelOpen && (
        <div className="absolute inset-0 z-40" style={{ left: '72px' }}>
          <NotificationPanel open={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
        </div>
      )}
    </>
  )
}
