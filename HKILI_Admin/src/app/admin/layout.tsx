'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token')
    // Clear cookie by calling logout api (optional, but good practice)
    // For now just redirect to login, middleware will handle the rest or we can force it
    document.cookie = 'token=; Max-Age=0; path=/;'
    router.push('/login')
  }

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">HKILI</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 flex flex-col justify-between h-[calc(100vh-140px)]">
          <div>
            <Link href="/admin/dashboard" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/dashboard')}`}>
              Dashboard
            </Link>
            <Link href="/admin/users" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/users')}`}>
              Users Management
            </Link>
            <Link href="/admin/stories" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/stories')}`}>
              Stories Management
            </Link>
            <Link href="/admin/characters" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/characters')}`}>
              Characters
            </Link>
            <Link href="/admin/settings" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/settings')}`}>
              Settings
            </Link>
          </div>
          
          <div className="px-6 pb-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  )
}
