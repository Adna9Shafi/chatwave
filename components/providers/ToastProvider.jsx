'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1A1D27',
          color: '#F1F3F9',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        success: { iconTheme: { primary: '#23C55E', secondary: '#F1F3F9' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#F1F3F9' } },
      }}
    />
  )
}
