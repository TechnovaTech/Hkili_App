import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unaï Admin Panel',
  description: 'Admin panel for Unaï App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}