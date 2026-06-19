'use client'

/** @param {{ src?: string, name?: string, size?: 'xs'|'sm'|'md'|'lg'|'xl', isOnline?: boolean, showStatus?: boolean, className?: string }} props */
export default function Avatar({
  src,
  name,
  size = 'md',
  isOnline,
  showStatus = false,
  className = '',
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-2xl',
  }

  const dotSizes = { xs: 'w-2 h-2 right-0 bottom-0', sm: 'w-2.5 h-2.5 right-0 bottom-0', md: 'w-3 h-3 right-0 bottom-0', lg: 'w-3.5 h-3.5 right-0 bottom-0', xl: 'w-4 h-4 right-0.5 bottom-0.5' }

  const initials = name
    ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const bgColors = [
    '#6C63FF', '#23C55E', '#F59E0B', '#EF4444', '#3B82F6',
    '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4',
  ]
  const colorIndex = name ? name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % bgColors.length : 0

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizes[size]} rounded-full object-cover bg-[var(--bg-tertiary)]`}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }}
        />
      ) : null}
      <div
        className={`${sizes[size]} rounded-full items-center justify-center font-semibold text-white ${src ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: bgColors[colorIndex] }}
      >
        {initials}
      </div>
      {(isOnline !== undefined || showStatus) && (
        <span
          className={`absolute ${dotSizes[size]} rounded-full border-2 border-[var(--bg-primary)] ${
            isOnline
              ? 'bg-[var(--success)] animate-pulse-dot'
              : 'bg-[var(--text-muted)]'
          }`}
        />
      )}
    </div>
  )
}
