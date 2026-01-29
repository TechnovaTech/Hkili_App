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
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setStories([
        { _id: '1', title: 'The Magic Forest Adventure', content: 'Once upon a time in a magical forest, there lived a brave little rabbit who discovered a hidden treasure...', userId: '1', createdAt: new Date().toISOString(), language: 'EN' },
        { _id: '2', title: 'Le Château Enchanté', content: 'Il était une fois un château enchanté où vivait une princesse courageuse qui aimait les aventures...', userId: '2', createdAt: new Date().toISOString(), language: 'FR' },
        { _id: '3', title: 'Space Explorer Journey', content: 'In the year 2050, a young astronaut embarked on an incredible journey to discover new planets...', userId: '3', createdAt: new Date().toISOString(), language: 'EN' },
        { _id: '4', title: 'حكاية الأميرة الشجاعة', content: 'في قديم الزمان، كانت هناك أميرة شجاعة تحب المغامرات والاستكشاف...', userId: '4', createdAt: new Date().toISOString(), language: 'AR' }
      ])
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return
    setStories(stories.filter(story => story._id !== storyId))
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Users Management
          </Link>
          <Link href="/admin/stories" className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-medium">
            Stories Management
          </Link>
          <Link href="/admin/characters" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Characters
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Stories Management</h2>
                <p className="text-gray-600 mt-1">Review and manage user-generated stories</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Filters and Stats */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Languages</option>
                    {uniqueLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setLanguageFilter('')
                      setDateFilter('')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold text-gray-900">{stories.length}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Languages: </span>
                  <span className="font-semibold text-blue-600">{uniqueLanguages.length}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Today: </span>
                  <span className="font-semibold text-green-600">
                    {stories.filter(story => {
                      const today = new Date().toDateString()
                      return new Date(story.createdAt).toDateString() === today
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stories List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Stories</h3>
            </div>
            
            {filteredStories.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredStories.map((story) => (
                  <div key={story._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {story.title || 'Untitled Story'}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {story.language}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                          {story.content}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created: {new Date(story.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(story._id)}
                          className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
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
        </main>
      </div>
    </div>
  )
}