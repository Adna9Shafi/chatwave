'use client'

import { FiMessageCircle, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'

export default function ChatsPage() {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center max-w-sm px-8">
        <div className="w-20 h-20 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mx-auto mb-6">
          <FiMessageCircle className="w-9 h-9 text-[var(--accent)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Select a conversation
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
          Choose a chat from the sidebar or start a new conversation with someone
        </p>
        <Link
          href="/people"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]"
        >
          New Conversation
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
