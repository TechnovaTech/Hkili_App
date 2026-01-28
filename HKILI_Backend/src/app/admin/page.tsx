'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  _id: string
  email: string
  createdAt: string
  status?: string
}

interface Story {
  _id: string
  title: string
  content: string
  userId: string
  createdAt: string
  language?: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        router.push('/admin/login')
        return
      }
    } catch (error) {
      localStorage.removeItem('token')
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [usersRes, storiesRes] = await Promise.all([
        fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/stories', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (storiesRes.ok) {
        const storiesData = await storiesRes.json()
        setStories(storiesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const todayStories = stories.filter(story => {
    const today = new Date().toDateString()
    return new Date(story.createdAt).toDateString() === today
  })

  const activeUsers = users.filter(user => user.status !== 'blocked')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">HKILI Admin Panel</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/admin" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/users" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Users
                </Link>
                <Link href="/admin/stories" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Stories
                </Link>
                <Link href="/admin/characters" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Characters
                </Link>
                <Link href="/admin/settings" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile */}
      <div className="md:hidden bg-white border-b">
        <div className="px-4 py-2 space-y-1">
          <Link href="/admin" className="block text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
            Users
          </Link>
          <Link href="/admin/stories" className="block text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
            Stories
          </Link>
          <Link href="/admin/characters" className="block text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
            Characters
          </Link>
          <Link href="/admin/settings" className="block text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
            Settings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Stories Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Stories</dt>
                      <dd className="text-lg font-medium text-gray-900">{stories.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Stories Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Stories</dt>
                      <dd className="text-lg font-medium text-gray-900">{todayStories.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{activeUsers.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph/Chart Placeholder */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Overview</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500">Chart/Graph Placeholder</p>
                <p className="text-sm text-gray-400">User activity and story generation trends</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-medium text-gray-900">Manage Users</h4>
                <p className="text-sm text-gray-500">View and manage user accounts</p>
              </div>
            </Link>
            
            <Link href="/admin/stories" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-medium text-gray-900">Manage Stories</h4>
                <p className="text-sm text-gray-500">Review and moderate stories</p>
              </div>
            </Link>
            
            <Link href="/admin/characters" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">🎭</div>
                <h4 className="font-medium text-gray-900">Characters</h4>
                <p className="text-sm text-gray-500">Manage story characters</p>
              </div>
            </Link>
            
            <Link href="/admin/settings" className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-gray-900">Settings</h4>
                <p className="text-sm text-gray-500">Configure app settings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}