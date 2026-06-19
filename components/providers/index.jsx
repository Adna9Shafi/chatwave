'use client'

import AuthProvider from './AuthProvider'
import ToastProvider from './ToastProvider'
import SocketProvider from './SocketProvider'

export default function Providers({ children, session }) {
  return (
    <AuthProvider session={session}>
      <SocketProvider>
        <ToastProvider />
        {children}
      </SocketProvider>
    </AuthProvider>
  )
}
