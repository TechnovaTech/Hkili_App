'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  email: string
  name?: string
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
      // router.push('/login')
      // return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      setUsers([
        { _id: '1', email: 'user1@test.com', name: 'John Doe', createdAt: new Date().toISOString(), status: 'active' },
        { _id: '2', email: 'user2@test.com', name: 'Jane Smith', createdAt: new Date().toISOString(), status: 'active' },
        { _id: '3', email: 'user3@test.com', name: 'Mike Johnson', createdAt: new Date().toISOString(), status: 'blocked' }
      ])
      setStories([
        { _id: '1', title: 'Adventure Story', content: 'Once upon a time...', userId: '1', createdAt: new Date().toISOString(), language: 'EN' },
        { _id: '2', title: 'Magic Tale', content: 'In a magical land...', userId: '2', createdAt: new Date().toISOString(), language: 'FR' },
        { _id: '3', title: 'Space Journey', content: 'In the year 2050...', userId: '3', createdAt: new Date().toISOString(), language: 'EN' }
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  const todayStories = stories.filter(story => {
    const today = new Date().toDateString()
    return new Date(story.createdAt).toDateString() === today
  })

  const activeUsers = users.filter(user => user.status !== 'blocked')

  return (
    <div className="p-8 animate-slide-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-900 p-6 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <div className="w-14 h-14 bg-dark-800 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/10">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold border border-primary/20">{activeUsers.length} active</span>
          </div>
        </div>

        <div className="bg-dark-900 p-6 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Stories</p>
              <p className="text-3xl font-bold text-white mt-1">{stories.length}</p>
            </div>
            <div className="w-14 h-14 bg-dark-800 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/10">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-primary">
            <span className="font-semibold">{todayStories.length} created today</span>
          </div>
        </div>

        <div className="bg-dark-900 p-6 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Languages</p>
              <p className="text-3xl font-bold text-white mt-1">2</p>
            </div>
            <div className="w-14 h-14 bg-dark-800 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/10">
              <span className="text-2xl">🌍</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            EN, FR active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-900 p-6 rounded-2xl shadow-lg border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Users</h2>
            <button onClick={() => router.push('/admin/users')} className="text-primary hover:text-primary-dark font-medium transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {users.slice(0, 3).map(user => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                  user.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.status || 'active'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900 p-6 rounded-2xl shadow-lg border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Latest Stories</h2>
            <button onClick={() => router.push('/admin/stories')} className="text-primary hover:text-primary-dark font-medium transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {stories.slice(0, 3).map(story => (
              <div key={story._id} className="p-4 bg-dark-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="font-semibold text-white mb-1">{story.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400 truncate flex-1 mr-4">{story.content}</p>
                  <span className="text-xs bg-dark-700 px-2 py-1 rounded text-gray-400 border border-white/5">{story.language}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
