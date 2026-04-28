'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const useRouterObj = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('adminToken')
    useRouterObj.push('/login')
    useRouterObj.refresh()
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/stories', label: 'Stories', icon: '📚' },
    //{ path: '/admin/ai-generator', label: 'AI Generator', icon: '🤖' },
    { path: '/admin/characters', label: 'Characters', icon: '👤' },
    //{ path: '/admin/story-characters', label: 'Story Characters', icon: '🎭' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/prompts', label: 'Prompts', icon: '📝' },
    { path: '/admin/plans', label: 'Plans', icon: '💎' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-app-bg shadow-2xl border-r border-app-border/30 fixed h-full z-10 transition-all duration-300`}>
      <div className="p-6 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-app-primary rounded-xl flex items-center justify-center shadow-lg shadow-app-primary/30 animate-float">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">HKILI</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>
      <nav className="mt-6 flex flex-col justify-between h-[calc(100vh-140px)]">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path} 
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden shine-hover ${
                isActive(item.path)
                  ? 'bg-app-primary text-white shadow-lg shadow-app-primary/30'
                  : 'text-app-textMuted hover:bg-app-surface/30 hover:text-white border border-transparent hover:border-app-border/30'
              }`}
            >
              {isActive(item.path) && (
                <div className="absolute inset-0 bg-app-primary opacity-10 blur-xl"></div>
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              {!isCollapsed && <span className="ml-3 relative z-10">{item.label}</span>}
            </Link>
          ))}
        </div>
        
        <div className="px-6 pb-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-center px-4'} py-3 text-sm font-medium rounded-xl text-white bg-app-surface/40 hover:bg-app-primary hover:text-white border border-app-border/30 focus:outline-none focus:ring-2 focus:ring-app-primary/50 transition-all duration-200 shadow-lg shadow-app-primary/10 shine-hover`}
          >
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  )
}
