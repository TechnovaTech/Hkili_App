'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Prompt {
  _id: string
  name: string
  template: string
  systemMessage: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const DEFAULT_TEMPLATE = `Write a [CATEGORY] story set in [PLACE].

Main character(s): [MAIN_CHARACTER_NAMES]
Side character(s): [SIDE_CHARACTER_NAMES]
Moral of the story: [MORAL]

Make the story immersive, coherent, and end with the moral clearly reflected in the outcome.`

const DEFAULT_SYSTEM = `You are a creative children's story writer. Write an engaging, age-appropriate story based on the user's prompt. Write in [LANGUAGE]. Return JSON with 'title' and 'content' fields.`

const PLACEHOLDERS = [
  { key: '[CATEGORY]', desc: 'Story category (e.g. Adventure, Fantasy)' },
  { key: '[PLACE]', desc: 'Where the story takes place' },
  { key: '[MAIN_CHARACTER_NAMES]', desc: 'Comma-separated main character names' },
  { key: '[SIDE_CHARACTER_NAMES]', desc: 'Comma-separated side character names (or "None")' },
  { key: '[MORAL]', desc: 'The moral of the story' },
  { key: '[LANGUAGE]', desc: 'Language code (EN, FR, AR) — for system message only' },
]

export default function PromptManagement() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Prompt | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    template: DEFAULT_TEMPLATE,
    systemMessage: DEFAULT_SYSTEM,
    isActive: false,
  })
  const router = useRouter()

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('adminToken')
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' }
  }

  useEffect(() => { fetchPrompts() }, [])

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts', { headers: getAuthHeader() })
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      if (data.success) setPrompts(data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: '', template: DEFAULT_TEMPLATE, systemMessage: DEFAULT_SYSTEM, isActive: false })
    setIsModalOpen(true)
  }

  const openEdit = (p: Prompt) => {
    setEditing(p)
    setFormData({ name: p.name, template: p.template, systemMessage: p.systemMessage, isActive: p.isActive })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `/api/prompts/${editing._id}` : '/api/prompts'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: getAuthHeader(), body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.success) {
        fetchPrompts()
        setIsModalOpen(false)
      } else {
        alert(data.error || 'Failed to save')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async (p: Prompt) => {
    try {
      const res = await fetch(`/api/prompts/${p._id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ ...p, isActive: true }),
      })
      const data = await res.json()
      if (data.success) fetchPrompts()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prompt template?')) return
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE', headers: getAuthHeader() })
      if (res.ok) setPrompts(prev => prev.filter(p => p._id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const insertPlaceholder = (field: 'template' | 'systemMessage', key: string) => {
    setFormData(prev => ({ ...prev, [field]: prev[field] + key }))
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  const activePrompt = prompts.find(p => p.isActive)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prompt Management</h2>
            <p className="text-gray-600 mt-1">Manage AI story generation prompt templates</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> New Prompt
          </button>
        </div>
      </header>

      <main className="p-8 space-y-6">
        {/* Active Prompt Banner */}
        {activePrompt ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4">
            <span className="text-2xl">✅</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800">Active Prompt: <span className="font-bold">{activePrompt.name}</span></p>
              <p className="text-sm text-green-700 mt-1 line-clamp-2">{activePrompt.template}</p>
            </div>
            <button
              onClick={() => setPreviewOpen(previewOpen === activePrompt._id ? null : activePrompt._id)}
              className="text-sm text-green-700 underline whitespace-nowrap"
            >
              {previewOpen === activePrompt._id ? 'Hide' : 'Preview'}
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-yellow-800 font-medium">No active prompt. The system will use the built-in default. Activate a prompt below to override it.</p>
          </div>
        )}

        {/* Placeholder Reference */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">📌 Available Placeholders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLACEHOLDERS.map(ph => (
              <div key={ph.key} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <code className="text-blue-600 font-mono text-sm font-bold whitespace-nowrap">{ph.key}</code>
                <span className="text-gray-500 text-sm">{ph.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">All Templates</h3>
            <span className="text-sm text-gray-500">{prompts.length} template{prompts.length !== 1 ? 's' : ''}</span>
          </div>

          {prompts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-500">No prompt templates yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {prompts.map(p => (
                <div key={p._id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="text-base font-semibold text-gray-900">{p.name}</h4>
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✅ Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Inactive
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Updated {new Date(p.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Template preview */}
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 mb-3 line-clamp-4 overflow-hidden">
                        {p.template}
                      </pre>

                      {/* System message preview toggle */}
                      <button
                        onClick={() => setPreviewOpen(previewOpen === p._id + '_sys' ? null : p._id + '_sys')}
                        className="text-xs text-blue-600 underline mb-2"
                      >
                        {previewOpen === p._id + '_sys' ? 'Hide system message' : 'Show system message'}
                      </button>
                      {previewOpen === p._id + '_sys' && (
                        <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans bg-blue-50 rounded-lg p-3 border border-blue-100">
                          {p.systemMessage}
                        </pre>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!p.isActive && (
                        <button
                          onClick={() => handleActivate(p)}
                          className="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Edit Prompt Template' : 'New Prompt Template'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Default Story Prompt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Template */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Prompt Template</label>
                  <div className="flex flex-wrap gap-1">
                    {PLACEHOLDERS.slice(0, 5).map(ph => (
                      <button
                        key={ph.key}
                        type="button"
                        onClick={() => insertPlaceholder('template', ph.key)}
                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 font-mono"
                      >
                        {ph.key}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  required
                  rows={10}
                  value={formData.template}
                  onChange={e => setFormData(p => ({ ...p, template: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Use placeholders above — they are replaced automatically at generation time.</p>
              </div>

              {/* System Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">System Message (sent to OpenAI)</label>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder('systemMessage', '[LANGUAGE]')}
                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 font-mono"
                  >
                    [LANGUAGE]
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.systemMessage}
                  onChange={e => setFormData(p => ({ ...p, systemMessage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Set Active */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                  className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'} relative`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Set as active prompt</span>
                {formData.isActive && <span className="text-xs text-green-600">(will deactivate all others)</span>}
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
