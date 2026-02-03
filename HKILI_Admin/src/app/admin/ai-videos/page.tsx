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
    setStatus('Analyzing story and generating a visual scene...')

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
        setStatus('Scene generated successfully!')
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
        <h1 className="text-2xl font-bold text-gray-900">AI Video Generator</h1>
        <p className="mt-2 text-gray-600">Generate animated scenes from your stories using AI</p>
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
              {loading ? 'Generating Scene...' : 'Generate 1 Story Scene'}
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

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 min-h-[500px]">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Videos</h2>
            
            {contentUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contentUrls.map((url, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group">
                      <video 
                        src={url} 
                        controls
                        className="w-full h-full object-cover"
                      />
                      <a 
                        href={url} 
                        download={`video-${index+1}.mp4`}
                        className="absolute bottom-8 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Download
                      </a>
                    </div>
                    <p className="text-sm text-gray-500 text-center">Scene {index + 1}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Generated videos will appear here</p>
              </div>
            )}
          </div>

      </div>
    </div>
  )
}
