'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AIVideoGenerator() {
  const [storyContent, setStoryContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [contentUrls, setContentUrls] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyContent.trim()) return

    setLoading(true)
    setError('')
    setContentUrls([])
    setStatus('Analyzing story and generating visual scenes...')

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storyContent })
      })

      const data = await res.json()

      if (data.success) {
        setContentUrls(data.videos)
        setStatus('Scenes generated successfully!')
      } else {
        setError(data.error || 'Failed to generate content')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Scene Generator</h1>
        <p className="mt-2 text-gray-600">Generate high-quality visual scenes from your stories using DALL-E 3</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Content
              </label>
              <textarea
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Paste your full story here..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {loading ? 'Generating Scenes...' : 'Generate 4 Story Scenes'}
            </button>
            
            {loading && (
               <p className="text-sm text-blue-600 text-center animate-pulse">{status}</p>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 min-h-[400px]">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Scenes</h2>
          
          {contentUrls.length === 0 && !loading && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <span className="text-4xl mb-2">🎨</span>
              <p>Generated scenes will appear here</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {contentUrls.map((url, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                  <img 
                    src={url} 
                    alt={`Scene ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <a 
                    href={url} 
                    download={`scene-${index+1}.png`}
                    className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Download
                  </a>
                </div>
                <p className="text-sm text-gray-500 text-center">Scene {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
