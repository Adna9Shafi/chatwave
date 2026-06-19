'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MainPage() {
  const router = useRouter()
  useEffect(() => { router.push('/chats') }, [router])
  return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  )
}
