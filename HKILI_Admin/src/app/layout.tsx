import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HKILI Admin Panel',
  description: 'Admin panel for HKILI App',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-white min-h-screen">{children}</body>
    </html>
  )
}