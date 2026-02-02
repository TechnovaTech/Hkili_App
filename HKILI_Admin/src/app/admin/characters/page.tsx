'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CharacterAvatar from '@/components/CharacterAvatar'

interface User {
  _id: string
  name?: string
  email: string
}

interface Category {
  _id: string
  name: string
}

interface Character {
  _id: string
  userId?: User
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

export default function CharactersManagement() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null) // For View Details
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null) // For Edit/Create
  
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

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }
    return { 'Content-Type': 'application/json' }
  }

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters', {
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
          return
        }
        const errorText = await res.text()
        console.error(`Failed to fetch characters: ${res.status} ${res.statusText}`, errorText)
      }
    } catch (error) {
      console.error('Error fetching characters:', error)
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

  const handleOpenFormModal = (character?: Character) => {
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
      const url = editingCharacter ? `/api/characters/${editingCharacter._id}` : '/api/characters'
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
        alert(errorData.error || 'Failed to save character')
      }
    } catch (error) {
      console.error('Error saving character:', error)
    }
  }

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return

    try {
      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      if (res.ok) {
        setCharacters(characters.filter(c => c._id !== characterId))
        if (selectedCharacter?._id === characterId) setSelectedCharacter(null)
      } else {
        alert('Failed to delete character')
      }
    } catch (error) {
      console.error('Error deleting character:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">User Characters Management</h1>
          <p className="text-gray-600 mt-1">View and manage user created characters</p>
        </div>
        <button
          onClick={() => handleOpenFormModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Add Character
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="px-6 py-4 font-medium">Character</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Created At</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {characters.map((character) => (
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
                  {character.userId ? (
                    <div className="font-medium text-gray-900">{character.userId.email}</div>
                  ) : (
                    <span className="text-gray-500 italic">System / Admin</span>
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
            ))}
          </tbody>
        </table>
        {characters.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No characters found
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {editingCharacter ? 'Edit Character' : 'Add Character'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="n/a">N/A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">None</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests (comma separated)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Reading, Running, Gaming"
                />
              </div>

              {/* Appearance Fields */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium mb-3">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hair Style</label>
                    <select
                      value={formData.hairStyle}
                      onChange={(e) => setFormData({ ...formData, hairStyle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {['Bald', 'Buzz Cut', 'Pixie', 'Spiky', 'Wavy', 'Curly', 'Long', 'Bob', 'Straight', 'Braided', 'Short'].map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                     {/* Colors would ideally be color pickers, keeping simple for now */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hair Color</label>
                    <input
                      type="color"
                      value={formData.hairColor}
                      onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skin Color</label>
                    <input
                      type="color"
                      value={formData.skinColor}
                      onChange={(e) => setFormData({ ...formData, skinColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eye Color</label>
                    <input
                      type="color"
                      value={formData.eyeColor}
                      onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
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
                  {editingCharacter ? 'Save Changes' : 'Create Character'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
