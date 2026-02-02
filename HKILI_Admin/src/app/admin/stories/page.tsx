'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  _id: string
  name: string
}

interface StoryCharacter {
  _id: string
  name: string
  categoryId: string | { _id: string }
  image?: string
}

interface Story {
  _id: string
  title: string
  content: string
  userId: { _id: string, email: string } | string
  categoryId?: Category | string
  storyCharacterId?: StoryCharacter | string
  createdAt: string
  language: string
}

export default function StoriesManagement() {
  const [stories, setStories] = useState<Story[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allStoryCharacters, setAllStoryCharacters] = useState<StoryCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [languageFilter, setLanguageFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  // Modal & Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    language: 'EN',
    categoryId: '',
    storyCharacterId: ''
  })

  const router = useRouter()

  useEffect(() => {
    fetchStories()
    fetchCategories()
    fetchStoryCharacters()
  }, [])

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }
    return { 'Content-Type': 'application/json' }
  }

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories', { headers: getAuthHeader() })
      if (res.ok) {
        const data = await res.json()
        setStories(Array.isArray(data) ? data : [])
      } else {
        if (res.status === 401) router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { headers: getAuthHeader() })
      if (res.ok) {
        const data = await res.json()
        if (data.success) setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchStoryCharacters = async () => {
    try {
      const res = await fetch('/api/story-characters', { headers: getAuthHeader() })
      if (res.ok) {
        const data = await res.json()
        if (data.success) setAllStoryCharacters(data.data)
      }
    } catch (error) {
      console.error('Error fetching story characters:', error)
    }
  }

  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return
    
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })
      
      if (res.ok) {
        setStories(stories.filter(story => story._id !== storyId))
      } else {
        alert('Failed to delete story')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  const handleOpenFormModal = (story?: Story) => {
    if (story) {
      setEditingStory(story)
      setFormData({
        title: story.title,
        content: story.content,
        language: story.language,
        categoryId: typeof story.categoryId === 'object' ? story.categoryId._id : (story.categoryId || ''),
        storyCharacterId: typeof story.storyCharacterId === 'object' ? story.storyCharacterId._id : (story.storyCharacterId || '')
      })
    } else {
      setEditingStory(null)
      setFormData({
        title: '',
        content: '',
        language: 'EN',
        categoryId: '',
        storyCharacterId: ''
      })
    }
    setIsFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingStory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingStory ? `/api/stories/${editingStory._id}` : '/api/stories'
      const method = editingStory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchStories()
        handleCloseFormModal()
      } else {
        const error = await res.json()
        alert(error.message || 'Failed to save story')
      }
    } catch (error) {
      console.error('Error saving story:', error)
    }
  }

  // Filter characters based on selected category
  const filteredCharacters = allStoryCharacters.filter(char => {
    if (!formData.categoryId) return false
    const charCatId = typeof char.categoryId === 'object' ? char.categoryId._id : char.categoryId
    return charCatId === formData.categoryId
  })

  const filteredStories = stories.filter(story => {
    const matchesLanguage = !languageFilter || story.language === languageFilter
    const matchesDate = !dateFilter || new Date(story.createdAt).toDateString() === new Date(dateFilter).toDateString()
    return matchesLanguage && matchesDate
  })

  const uniqueLanguages = ['EN', 'FR', 'AR'] // Predefined or derived

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stories Management</h2>
              <p className="text-gray-600 mt-1">Create, review and manage stories</p>
            </div>
            <button
              onClick={() => handleOpenFormModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span> Add Story
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
                        
                        <div className="flex gap-4 mb-2 text-sm text-gray-600">
                          {story.categoryId && (
                            <span className="flex items-center">
                              <span className="font-medium mr-1">Category:</span>
                              {typeof story.categoryId === 'object' ? story.categoryId.name : 'Unknown'}
                            </span>
                          )}
                          {story.storyCharacterId && (
                            <span className="flex items-center">
                              <span className="font-medium mr-1">Character:</span>
                              {typeof story.storyCharacterId === 'object' ? story.storyCharacterId.name : 'Unknown'}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                          {story.content}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Created: {new Date(story.createdAt).toLocaleString()} by {typeof story.userId === 'object' ? story.userId.email : 'Unknown'}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleOpenFormModal(story)}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                        >
                          Edit
                        </button>
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

          {/* Create/Edit Modal */}
          {isFormModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">
                  {editingStory ? 'Edit Story' : 'Create Story'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, storyCharacterId: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Character</label>
                      <select
                        value={formData.storyCharacterId}
                        onChange={(e) => setFormData({ ...formData, storyCharacterId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        disabled={!formData.categoryId}
                        required
                      >
                        <option value="">Select Character</option>
                        {filteredCharacters.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="EN">English</option>
                      <option value="FR">French</option>
                      <option value="AR">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={6}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseFormModal}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingStory ? 'Save Changes' : 'Create Story'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </main>
    </div>
  )
}