'use client'

import { useState, useRef, useEffect } from 'react'

/** @param {{ content: string, children: any, side?: 'top'|'right'|'bottom'|'left', className?: string }} props */
export default function Tooltip({ content, children, side = 'right', className = '' }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)
  const tipRef = useRef(null)

  const sideStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[var(--bg-tertiary)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-[5px] border-b-[5px] border-r-[5px] border-t-transparent border-b-transparent border-r-[var(--bg-tertiary)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-[var(--bg-tertiary)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-[5px] border-b-[5px] border-l-[5px] border-t-transparent border-b-transparent border-l-[var(--bg-tertiary)]',
  }

  return (
    <div
      ref={ref}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div
          ref={tipRef}
          className={`absolute z-50 whitespace-nowrap animate-scale-in ${sideStyles[side]}`}
        >
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-primary)] border border-[var(--border)] shadow-xl">
            {content}
          </div>
          <div className={`absolute ${arrowStyles[side]}`} />
        </div>
      )}
    </div>
  )
}
