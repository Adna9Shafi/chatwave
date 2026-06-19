'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import Button from './Button'

/** @param {{ open: boolean, onClose: () => void, title?: string, size?: 'sm'|'md'|'lg', children: any }} props */
export default function Modal({ open, onClose, title, size = 'md', children }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [open, handleEsc])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative w-full ${sizes[size]} bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-2xl animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="!p-1 !h-auto">
              <FiX className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
