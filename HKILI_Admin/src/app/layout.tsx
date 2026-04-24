import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HKILI Admin Panel',
  description: 'Admin panel for HKILI App',
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