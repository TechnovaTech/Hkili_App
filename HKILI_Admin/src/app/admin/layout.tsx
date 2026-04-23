import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '../../components/AdminSidebar'
import { verifyAuth } from '../../lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const payload = await verifyAuth(token)
  if (!payload || payload.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
