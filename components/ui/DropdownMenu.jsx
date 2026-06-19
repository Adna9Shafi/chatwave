'use client'

import { useState, useRef, useEffect } from 'react'

/** @param {{ trigger: any, children: any, align?: 'start'|'end', className?: string }} props */
export default function DropdownMenu({ trigger, children, align = 'end', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 top-full mt-1 ${align === 'end' ? 'right-0' : 'left-0'} min-w-[180px] py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl shadow-black/40 animate-scale-in`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/** @param {{ children: any, onClick?: () => void, danger?: boolean, className?: string }} props */
export function DropdownItem({ children, onClick, danger = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition ${
        danger
          ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/** @param {{ className?: string }} props */
export function DropdownDivider({ className = '' }) {
  return <div className={`my-1 mx-2 h-px bg-[var(--border)] ${className}`} />
}
