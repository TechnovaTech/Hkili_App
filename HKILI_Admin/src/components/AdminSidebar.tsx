'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  const useRouterObj = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Clear local storage
    localStorage.removeItem('adminToken')
    useRouterObj.push('/login')
    useRouterObj.refresh() // Force refresh to update server components
  }

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
  }

  return (
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
            User Characters
          </Link>
          <Link href="/admin/story-characters" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/story-characters')}`}>
            Story Characters
          </Link>
          <Link href="/admin/categories" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/categories')}`}>
            Categories
          </Link>
          <Link href="/admin/plans" className={`flex items-center px-6 py-3 font-medium transition-colors ${isActive('/admin/plans')}`}>
            Plans
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
  )
}
