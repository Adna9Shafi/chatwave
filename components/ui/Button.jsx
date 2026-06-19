'use client'

/** @param {{ size?: 'xs'|'sm'|'md'|'lg'|'xl', loading?: boolean, disabled?: boolean, children?: any, className?: string, variant?: 'primary'|'ghost'|'danger'|'outline', onClick?: () => void, type?: 'button'|'submit', ...rest }} props */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-light)] shadow-lg shadow-[var(--accent-glow)]',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
    outline: 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-light)]',
  }

  const sizes = {
    xs: 'text-xs px-2 py-1.5 h-7',
    sm: 'text-sm px-3 py-2 h-9',
    md: 'text-sm px-4 py-2.5 h-10',
    lg: 'text-base px-5 py-3 h-12',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

/** Icon button variant */
export function IconButton({ icon: Icon, label, size = 'md', ...rest }) {
  const sizes = { xs: 'w-7 h-7', sm: 'w-9 h-9', md: 'w-10 h-10', lg: 'w-12 h-12' }
  return (
    <Button variant="ghost" size={size} className={`${sizes[size]} p-0 ${rest.className || ''}`} {...rest}>
      <Icon className="w-5 h-5" />
      {label && <span className="sr-only">{label}</span>}
    </Button>
  )
}
