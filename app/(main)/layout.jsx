'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import NavRail from '@/components/layout/NavRail'
import Sidebar from '@/components/layout/Sidebar'
import Spinner from '@/components/ui/Spinner'

export default function MainLayout({ children }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="h-screen flex bg-[var(--bg-primary)]">
      <NavRail />
      <Sidebar />
      <main className="flex-1 min-w-0 bg-[var(--bg-primary)]">
        {children}
      </main>
    </div>
  )
}
