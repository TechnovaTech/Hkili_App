'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Character {
  _id: string
  name: string
  age: number
  interests: string[]
  description?: string
  createdAt: string
}

export default function CharactersManagement() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchCharacters()
  }, [router])

  const fetchCharacters = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/characters', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters(data)
      } else {
        // If API doesn't exist, use mock data
        setCharacters([
          {
            _id: '1',
            name: 'Princess Luna',
            age: 8,
            interests: ['Magic', 'Adventure', 'Friendship'],
            description: 'A brave princess who loves magical adventures',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Captain Max',
            age: 10,
            interests: ['Pirates', 'Ocean', 'Treasure'],
            description: 'A young pirate captain searching for treasure',
            createdAt: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching characters:', error)
      // Use mock data as fallback
      setCharacters([
        {
          _id: '1',
          name: 'Princess Luna',
          age: 8,
          interests: ['Magic', 'Adventure', 'Friendship'],
          description: 'A brave princess who loves magical adventures',
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok || response.status === 404) {
        setCharacters(characters.filter(character => character._id !== characterId))
      }
    } catch (error) {
      console.error('Error deleting character:', error)
      // For demo purposes, still remove from local state
      setCharacters(characters.filter(character => character._id !== characterId))
    }
  }

  const handleSave = async (characterData: Partial<Character>) => {
    try {
      const token = localStorage.getItem('token')
      const isEditing = editingCharacter !== null
      const url = isEditing ? `/api/characters/${editingCharacter._id}` : '/api/characters'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(characterData)
      })

      if (response.ok || response.status === 404) {
        if (isEditing) {
          setCharacters(characters.map(char => 
            char._id === editingCharacter._id 
              ? { ...char, ...characterData } as Character
              : char
          ))
        } else {
          const newCharacter: Character = {
            _id: Date.now().toString(),
            ...characterData,
            createdAt: new Date().toISOString()
          } as Character
          setCharacters([...characters, newCharacter])
        }
        setEditingCharacter(null)
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error saving character:', error)
      // For demo purposes, still update local state
      if (editingCharacter) {
        setCharacters(characters.map(char => 
          char._id === editingCharacter._id 
            ? { ...char, ...characterData } as Character
            : char
        ))
      } else {
        const newCharacter: Character = {
          _id: Date.now().toString(),
          ...characterData,
          createdAt: new Date().toISOString()
        } as Character
        setCharacters([...characters, newCharacter])
      }
      setEditingCharacter(null)
      setShowAddForm(false)
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
                <Link href="/admin/stories" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Stories
                </Link>
                <Link href="/admin/characters" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Characters Management</h2>
              <p className="text-gray-600">Manage story characters and their attributes</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Character
            </button>
          </div>

          {/* Characters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {character.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{character.name}</h3>
                      <p className="text-sm text-gray-500">Age: {character.age}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interests:</h4>
                  <div className="flex flex-wrap gap-1">
                    {character.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {character.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{character.description}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCharacter(character)}
                    className="flex-1 bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-2 text-sm font-medium rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(character._id)}
                    className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 px-3 py-2 text-sm font-medium rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {characters.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🎭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No characters found</h3>
              <p className="text-gray-500">Create your first character to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Add Character Modal */}
      {(editingCharacter || showAddForm) && (
        <CharacterForm
          character={editingCharacter}
          onSave={handleSave}
          onCancel={() => {
            setEditingCharacter(null)
            setShowAddForm(false)
          }}
        />
      )}
    </div>
  )
}

// Character Form Component
function CharacterForm({ 
  character, 
  onSave, 
  onCancel 
}: { 
  character: Character | null
  onSave: (data: Partial<Character>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: character?.name || '',
    age: character?.age || 5,
    interests: character?.interests.join(', ') || '',
    description: character?.description || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      age: formData.age,
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
      description: formData.description
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {character ? 'Edit Character' : 'Add New Character'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min="1"
              max="18"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              value={formData.interests}
              onChange={(e) => setFormData({...formData, interests: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Magic, Adventure, Friendship"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}