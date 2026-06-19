'use client'

export default function TypingIndicator({ names = [] }) {
  if (names.length === 0) return null

  const label = names.length === 1
    ? `${names[0]} is typing...`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing...`
      : `${names[0]} and ${names.length - 1} others are typing...`

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl rounded-bl-md bg-[var(--recv-bubble)] border border-[var(--border)]">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">{label}</span>
      </div>
    </div>
  )
}
