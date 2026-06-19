import { Inter, JetBrains_Mono } from 'next/font/google'
import Providers from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'ChatWave — Real-Time Messaging',
  description: 'Modern real-time chat application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
