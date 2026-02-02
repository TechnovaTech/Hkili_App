'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterAvatar from '@/components/CharacterAvatar'

interface Category {
  _id: string
  name: string
}

interface StoryCharacter {
  _id: string
  categoryId?: Category | string
  name: string
  age: number
  gender: string
  hairColor: string
  hairStyle: string
  skinColor: string
  eyeColor: string
  interests: string[]
  customInterests: string[]
  description?: string
  createdAt: string
}

export default function StoryCharactersManagement() {
  const [characters, setCharacters] = useState<StoryCharacter[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<StoryCharacter | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    age: 5,
    gender: 'n/a',
    categoryId: '',
    description: '',
    hairColor: '#8B4513',
    hairStyle: 'Short',
    skinColor: '#FDBCB4',
    eyeColor: '#8B4513',
    interests: '' // comma separated
  })

  const router = useRouter()

  useEffect(() => {
    fetchCharacters()
    fetchCategories()
  }, [])

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  }

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/story-characters', {
        headers: getAuthHeader()
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCharacters(data.data)
        }
      } else {
        if (res.status === 401) {
          router.push('/login')
        }
        console.error('Failed to fetch story characters')
      }
    } catch (error) {
      console.error('Error fetching story characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { headers: getAuthHeader() })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleOpenFormModal = (character?: StoryCharacter) => {
    if (character) {
      setEditingCharacter(character)
      setFormData({
        name: character.name,
        age: character.age,
        gender: character.gender,
        categoryId: typeof character.categoryId === 'string' ? character.categoryId : character.categoryId?._id || '',
        description: character.description || '',
        hairColor: character.hairColor,
        hairStyle: character.hairStyle,
        skinColor: character.skinColor,
        eyeColor: character.eyeColor,
        interests: character.interests.join(', ')
      })
    } else {
      setEditingCharacter(null)
      setFormData({
        name: '',
        age: 5,
        gender: 'n/a',
        categoryId: '',
        description: '',
        hairColor: '#8B4513',
        hairStyle: 'Short',
        skinColor: '#FDBCB4',
        eyeColor: '#8B4513',
        interests: ''
      })
    }
    setIsFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingCharacter(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCharacter ? `/api/story-characters/${editingCharacter._id}` : '/api/story-characters'
      const method = editingCharacter ? 'PUT' : 'POST'

      const submitData = {
        ...formData,
        interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
        age: Number(formData.age)
      }

      const res = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(submitData)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          fetchCharacters()
          handleCloseFormModal()
        }
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save story character')
      }
    } catch (error) {
      console.error('Error saving story character:', error)
    }
  }

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this story character?')) return

    try {
      const res = await fetch(`/api/story-characters/${characterId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (res.ok) {
        setCharacters(characters.filter(c => c._id !== characterId))
      } else {
        alert('Failed to delete story character')
      }
    } catch (error) {
      console.error('Error deleting story character:', error)
    }
  }

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Story Characters Management</h1>
          <p className="text-gray-600 mt-1">Create and manage characters for stories</p>
        </div>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Add Story Character
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="px-6 py-4 font-medium">Character</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Created At</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {characters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No story characters found. Create one to get started.
                </td>
              </tr>
            ) : (
              characters.map((character) => (
                <tr key={character._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="mr-3 w-10 h-10 flex items-center justify-center overflow-hidden">
                        <div className="transform scale-50 origin-center">
                          <CharacterAvatar 
                            skinColor={character.skinColor}
                            hairColor={character.hairColor}
                            hairStyle={character.hairStyle}
                            eyeColor={character.eyeColor}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{character.name}</div>
                        <div className="text-xs text-gray-500">{character.gender} • {character.age} years</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {character.categoryId ? (
                       typeof character.categoryId === 'object' && 'name' in character.categoryId 
                       ? (character.categoryId as Category).name 
                       : 'Category ID: ' + character.categoryId
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {character.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(character.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleOpenFormModal(character)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(character._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCharacter ? 'Edit Story Character' : 'New Story Character'}
              </h2>
              <button 
                onClick={handleCloseFormModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="n/a">N/A</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.interests}
                      onChange={(e) => setFormData({...formData, interests: e.target.value})}
                      placeholder="Reading, Magic, Flying"
                    />
                  </div>
                </div>

                {/* Appearance */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Appearance</h3>
                  
                  <div className="flex justify-center py-4 bg-gray-50 rounded-lg mb-4">
                    <div className="transform scale-150">
                      <CharacterAvatar 
                        skinColor={formData.skinColor}
                        hairColor={formData.hairColor}
                        hairStyle={formData.hairStyle}
                        eyeColor={formData.eyeColor}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skin Color</label>
                      <input
                        type="color"
                        className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                        value={formData.skinColor}
                        onChange={(e) => setFormData({...formData, skinColor: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Eye Color</label>
                      <input
                        type="color"
                        className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                        value={formData.eyeColor}
                        onChange={(e) => setFormData({...formData, eyeColor: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hair Color</label>
                      <input
                        type="color"
                        className="w-full h-10 p-1 border border-gray-300 rounded-lg"
                        value={formData.hairColor}
                        onChange={(e) => setFormData({...formData, hairColor: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hair Style</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.hairStyle}
                        onChange={(e) => setFormData({...formData, hairStyle: e.target.value})}
                      >
                        <option value="Short">Short</option>
                        <option value="Long">Long</option>
                        <option value="Curly">Curly</option>
                        <option value="Bald">Bald</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCharacter ? 'Update Character' : 'Create Character'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
