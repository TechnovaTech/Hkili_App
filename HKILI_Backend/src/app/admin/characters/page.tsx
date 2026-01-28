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
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
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
        },
        {
          _id: '3',
          name: 'Wizard Sam',
          age: 12,
          interests: ['Magic', 'Books', 'Learning'],
          description: 'A wise young wizard who loves to learn new spells',
          createdAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return
    setCharacters(characters.filter(character => character._id !== characterId))
  }

  const handleSave = async (characterData: Partial<Character>) => {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

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
          <Link href="/admin/stories" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Stories Management
          </Link>
          <Link href="/admin/characters" className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-medium">
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
                <h2 className="text-2xl font-bold text-gray-900">Characters Management</h2>
                <p className="text-gray-600 mt-1">Manage story characters and their attributes</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Add Character
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Characters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">
                        {character.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
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

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCharacter(character)}
                    className="flex-1 bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(character._id)}
                    className="flex-1 bg-red-100 text-red-800 hover:bg-red-200 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {characters.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No characters found</h3>
              <p className="text-gray-500">Create your first character to get started</p>
            </div>
          )}
        </main>
      </div>

      {/* Character Form Modal */}
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Magic, Adventure, Friendship"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}