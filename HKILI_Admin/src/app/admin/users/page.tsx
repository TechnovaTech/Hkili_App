'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    fetchUsers()
  }, [])

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeader()
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users')
        if (res.status === 401) {
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUnblock = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus as 'active' | 'blocked' } : user
        ))
      } else {
        console.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (res.ok) {
        setUsers(users.filter(user => user._id !== userId))
      } else {
        console.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleBlockUnblock(user._id, user.status)}
                      className={`text-sm font-medium ${
                        user.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}
