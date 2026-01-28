'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  _id: string
  email: string
  name?: string
  createdAt: string
  status: 'active' | 'blocked'
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.map((user: any) => ({
          ...user,
          status: user.status || 'active'
        })))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUnblock = async (userId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus as 'active' | 'blocked' } : user
        ))
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold">HKILI Admin Panel</h1>
              <div className="hidden md:flex space-x-4">
                <Link href="/admin" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name || 'No Name'}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBlockUnblock(user._id, user.status)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                      user.status === 'active'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {user.status === 'active' ? 'Block' : 'Unblock'}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 px-3 py-2 text-sm font-medium rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'No users have registered yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}