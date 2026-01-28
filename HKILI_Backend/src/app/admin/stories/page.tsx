'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Story {
  _id: string
  title: string
  content: string
  userId: string
  createdAt: string
  language: string
}

export default function StoriesManagement() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [languageFilter, setLanguageFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchStories()
  }, [router])

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/stories', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStories(data.map((story: any) => ({
          ...story,
          language: story.language || 'EN'
        })))
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setStories(stories.filter(story => story._id !== storyId))
      }
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  const filteredStories = stories.filter(story => {
    const matchesLanguage = !languageFilter || story.language === languageFilter
    const matchesDate = !dateFilter || new Date(story.createdAt).toDateString() === new Date(dateFilter).toDateString()
    return matchesLanguage && matchesDate
  })

  const uniqueLanguages = [...new Set(stories.map(story => story.language))]

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
                <Link href="/admin/users" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Users
                </Link>
                <Link href="/admin/stories" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
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
            <h2 className="text-2xl font-bold text-gray-900">Stories Management</h2>
            <p className="text-gray-600">Review and manage user-generated stories</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Language
              </label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setLanguageFilter('')
                  setDateFilter('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Stories List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredStories.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredStories.map((story) => (
                  <li key={story._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {story.title || 'Untitled Story'}
                          </h3>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {story.language}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(story.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {story.content.substring(0, 200)}...
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>Created: {new Date(story.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-2 text-sm font-medium rounded-md"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
                <p className="text-gray-500">
                  {languageFilter || dateFilter 
                    ? 'Try adjusting your filters' 
                    : 'No stories have been created yet'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stories.length}</div>
              <div className="text-sm text-gray-600">Total Stories</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{uniqueLanguages.length}</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {stories.filter(story => {
                  const today = new Date().toDateString()
                  return new Date(story.createdAt).toDateString() === today
                }).length}
              </div>
              <div className="text-sm text-gray-600">Today's Stories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}