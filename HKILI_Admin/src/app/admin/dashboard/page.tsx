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
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/10"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white absolute top-0 left-0"></div>
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
        <div className="glass-effect p-6 rounded-2xl shiny-border hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/20">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="px-2 py-1 bg-white/10 text-white rounded-full font-semibold border border-white/20">{activeUsers.length} active</span>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-2xl shiny-border hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Stories</p>
              <p className="text-3xl font-bold text-white mt-1">{stories.length}</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/20">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="px-2 py-1 bg-white/10 text-white rounded-full font-semibold border border-white/20">+{todayStories.length} today</span>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-2xl shiny-border hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1 group shine-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Sessions</p>
              <p className="text-3xl font-bold text-white mt-1">12</p>
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform border border-white/20">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
              <span className="text-gray-400">Currently online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-effect rounded-2xl shiny-border overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">📖</span>
            Recent Stories
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-300 text-sm">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Author</th>
                <th className="px-6 py-4 font-semibold">Language</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {stories.map((story, index) => (
                <tr key={story._id} className="hover:bg-white/5 transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
                  <td className="px-6 py-4 font-semibold text-white">{story.title}</td>
                  <td className="px-6 py-4 text-gray-400">User #{story.userId}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-white text-black shadow-md">
                      {story.language || 'EN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 hover:scale-105 transition-all duration-200 shine-hover">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
