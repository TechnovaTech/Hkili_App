'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  name?: string
  email: string
}

interface Character {
  _id: string
  userId: User
  name: string
  age: number
  gender: string
  hairColor: string
  eyeColor: string
  interests: string[]
  customInterests: string[]
  description?: string
  createdAt: string
}

export default function CharactersManagement() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCharacters()
  }, [])

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
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
        }
        console.error('Failed to fetch characters')
      }
    } catch (error) {
      console.error('Error fetching characters:', error)
    } finally {
      setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Characters Management</h1>
          <p className="text-gray-600 mt-1">View and manage all user characters</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="px-6 py-4 font-medium">Character</th>
              <th className="px-6 py-4 font-medium">Owner (User)</th>
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
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                      style={{ backgroundColor: character.hairColor || '#8B4513' }}
                    >
                      {character.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{character.name}</div>
                      <div className="text-xs text-gray-500">{character.gender} • {character.age} years</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {character.userId ? (
                    <div>
                      <div className="font-medium text-gray-900">{character.userId.name || 'Unknown Name'}</div>
                      <div className="text-xs text-gray-500">{character.userId.email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">User not found</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {character.interests.slice(0, 3).map((interest, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {interest}
                      </span>
                    ))}
                    {character.interests.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{character.interests.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(character.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedCharacter(character)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Full Details
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

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Character Details</h3>
              <button 
                onClick={() => setSelectedCharacter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Identity Section */}
              <div className="flex items-start space-x-6">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-md"
                  style={{ backgroundColor: selectedCharacter.hairColor || '#8B4513' }}
                >
                  {selectedCharacter.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                      <p className="text-lg font-medium text-gray-900">{selectedCharacter.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Age</label>
                      <p className="text-lg font-medium text-gray-900">{selectedCharacter.age}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Gender</label>
                      <p className="text-lg font-medium text-gray-900 capitalize">{selectedCharacter.gender}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Created</label>
                      <p className="text-sm text-gray-900">{new Date(selectedCharacter.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Appearance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Hair Color</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: selectedCharacter.hairColor }}></div>
                      <span className="text-sm text-gray-700">{selectedCharacter.hairColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Eye Color</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: selectedCharacter.eyeColor }}></div>
                      <span className="text-sm text-gray-700">{selectedCharacter.eyeColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCharacter.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {interest}
                    </span>
                  ))}
                  {selectedCharacter.customInterests?.map((interest, i) => (
                    <span key={`custom-${i}`} className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                      {interest}
                    </span>
                  ))}
                  {(!selectedCharacter.interests.length && !selectedCharacter.customInterests?.length) && (
                    <span className="text-gray-500 text-sm italic">No interests listed</span>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {selectedCharacter.description && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                    {selectedCharacter.description}
                  </p>
                </div>
              )}

              {/* Owner Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">Owner Details</h4>
                {selectedCharacter.userId ? (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedCharacter.userId.name || 'Unknown Name'}</p>
                      <p className="text-xs text-gray-600">{selectedCharacter.userId.email}</p>
                    </div>
                    <span className="text-xs bg-white px-2 py-1 rounded border border-blue-100 text-blue-600 font-mono">
                      ID: {selectedCharacter.userId._id}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">Orphaned Character (No User Linked)</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => setSelectedCharacter(null)}
                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
