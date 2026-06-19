'use client'

import { useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

/** @param {{ placeholder?: string, value?: string, onChange?: (v: string) => void, onClear?: () => void, icon?: any, className?: string }} props */
export default function Input({ placeholder = '', value, onChange, onClear, icon: Icon, className = '' }) {
  const [internal, setInternal] = useState('')
  const isControlled = value !== undefined
  const displayValue = isControlled ? value : internal

  function handleChange(e) {
    const v = e.target.value
    if (!isControlled) setInternal(v)
    onChange?.(v)
  }

  function handleClear() {
    if (!isControlled) setInternal('')
    onChange?.('')
    onClear?.()
  }

  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] ${
          Icon ? 'pl-10' : 'pl-4'
        } ${onClear && displayValue ? 'pr-10' : 'pr-4'} py-2.5`}
      />
      {onClear && displayValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
