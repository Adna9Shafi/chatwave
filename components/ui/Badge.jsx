/** @param {{ variant?: 'count'|'online'|'new'|'muted', count?: number, max?: number, className?: string }} props */
export default function Badge({ variant = 'count', count, max = 99, className = '' }) {
  if (variant === 'count' && (!count || count <= 0)) return null

  const variants = {
    count: 'bg-[var(--accent)] text-white text-[10px] font-bold',
    online: 'bg-[var(--success)]',
    new: 'bg-[var(--accent)] text-white text-[10px] font-bold',
    muted: 'bg-[var(--text-muted)] text-white text-[10px]',
  }

  const bases = {
    count: 'min-w-[18px] h-[18px] px-1 rounded-full inline-flex items-center justify-center',
    online: 'w-2.5 h-2.5 rounded-full inline-block animate-pulse-dot',
    new: 'min-w-[16px] h-4 px-1 rounded-full inline-flex items-center justify-center',
    muted: 'min-w-[16px] h-4 px-1 rounded-full inline-flex items-center justify-center',
  }

  if (variant === 'online') {
    return <span className={`${bases.online} ${variants.online} ${className}`} />
  }

  const display = count > max ? `${max}+` : count

  return (
    <span className={`${bases[variant]} ${variants[variant]} ${className}`}>
      {display}
    </span>
  )
}
