'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MUSIC_MOODS } from '@/lib/musicMoods'

interface Track {
  _id: string
  name: string
  url: string
  moods: string[]
  categoryIds: string[]
  isActive: boolean
  createdAt: string
}

interface Category {
  _id: string
  name: string
}

const emptyForm = { name: '', url: '', moods: [] as string[], categoryIds: [] as string[], isActive: true }

export default function MusicManagement() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Track | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const router = useRouter()

  useEffect(() => {
    fetchTracks()
    fetchCategories()
  }, [])

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }
    return { 'Content-Type': 'application/json' }
  }

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/music', { headers: getAuthHeader() })
      if (res.ok) {
        const data = await res.json()
        if (data.success) setTracks(data.data)
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching music:', error)
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

  // Upload straight to Cloudinary (signed) so large MP3s don't hit the server's body limit.
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const signRes = await fetch('/api/cloudinary-sign')
      if (!signRes.ok) throw new Error('Failed to get upload signature')
      const signData = await signRes.json()
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('api_key', signData.apiKey)
      uploadFormData.append('timestamp', signData.timestamp.toString())
      uploadFormData.append('signature', signData.signature)
      uploadFormData.append('folder', signData.folder)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`, {
        method: 'POST',
        body: uploadFormData,
      })
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({
          ...prev,
          url: data.secure_url,
          name: prev.name || file.name.replace(/\.[^.]+$/, ''),
        }))
      } else {
        const err = await res.json()
        alert('Upload failed: ' + (err.error?.message || 'Unknown error'))
      }
    } catch (error) {
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenModal = (track?: Track) => {
    setEditing(track || null)
    setFormData(track
      ? { name: track.name, url: track.url, moods: track.moods, categoryIds: track.categoryIds, isActive: track.isActive }
      : emptyForm)
    setIsModalOpen(true)
  }

  const toggleInList = (field: 'moods' | 'categoryIds', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url) {
      alert('Please upload a music file')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/music/${editing._id}` : '/api/music', {
        method: editing ? 'PUT' : 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        fetchTracks()
        setIsModalOpen(false)
      } else {
        alert(data.error || 'Failed to save music')
      }
    } catch (error) {
      console.error('Error saving music:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this music track?')) return
    try {
      const res = await fetch(`/api/music/${id}`, { method: 'DELETE', headers: getAuthHeader() })
      if (res.ok) {
        setTracks(tracks.filter(t => t._id !== id))
      } else {
        alert('Failed to delete music')
      }
    } catch (error) {
      console.error('Error deleting music:', error)
    }
  }

  const categoryName = (id: string) => categories.find(c => c._id === id)?.name || 'Unknown'
  const missingMoods = MUSIC_MOODS.filter(mood => !tracks.some(t => t.isActive && t.moods.includes(mood)))

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
          <h1 className="text-2xl font-bold text-gray-900">Background Music</h1>
          <p className="text-gray-600 mt-1">The app automatically picks the best track for each story</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Music
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 text-sm text-blue-900 space-y-1">
        <p><strong>How it works:</strong> every new story gets a mood from the AI. The app plays a track with the same mood, preferring tracks tagged with the story's category. With no exact match, the closest available track is used.</p>
        <p><strong>Tips:</strong> calm instrumental music without vocals, royalty-free (e.g. Pixabay Music), MP3, 1–3 minutes, under ~5 MB.</p>
        {missingMoods.length > 0 && (
          <p className="text-amber-700"><strong>No music yet for:</strong> {missingMoods.join(', ')}</p>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No music yet. Click <strong>+ Add Music</strong> to upload your first track.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
          {tracks.map(track => (
            <div key={track._id} className="p-6 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{track.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${track.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {track.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {track.moods.map(mood => (
                    <span key={mood} className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded">🎵 {mood}</span>
                  ))}
                  {track.categoryIds.map(id => (
                    <span key={id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">📁 {categoryName(id)}</span>
                  ))}
                  {track.moods.length === 0 && track.categoryIds.length === 0 && (
                    <span className="text-xs text-gray-400">No tags — used only when nothing else matches</span>
                  )}
                </div>
              </div>
              <audio controls preload="none" src={track.url} className="w-full lg:w-72" />
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={() => handleOpenModal(track)}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(track._id)}
                  className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editing ? 'Edit Music' : 'Add Music'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Music file (MP3)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && <p className="text-sm text-blue-600 mt-2">Uploading…</p>}
                {formData.url && !uploading && <audio controls src={formData.url} className="w-full mt-3" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Soft piano lullaby"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moods this music fits</label>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_MOODS.map(mood => (
                    <button
                      type="button"
                      key={mood}
                      onClick={() => toggleInList('moods', mood)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        formData.moods.includes(mood)
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story categories (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      type="button"
                      key={category._id}
                      onClick={() => toggleInList('categoryIds', category._id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        formData.categoryIds.includes(category._id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Active (can be picked for stories)</span>
              </label>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || saving}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
