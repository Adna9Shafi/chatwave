/** @param {{ title: string, subtitle?: string, action?: { label: string, onClick: () => void }, icon?: any, className?: string }} props */
export default function EmptyState({ title, subtitle, action, icon: Icon, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center h-full text-center px-8 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-glow)] flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-[var(--accent)]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">{title}</h3>
      {subtitle && <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-light)] transition shadow-lg shadow-[var(--accent-glow)]"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
