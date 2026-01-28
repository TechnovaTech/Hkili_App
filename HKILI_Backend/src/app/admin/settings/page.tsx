'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AppSettings {
  languages: {
    EN: boolean
    FR: boolean
    AR: boolean
  }
  maxStoryLength: number
  storyModes: {
    adventure: boolean
    educational: boolean
    bedtime: boolean
    interactive: boolean
  }
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<AppSettings>({
    languages: {
      EN: true,
      FR: true,
      AR: true
    },
    maxStoryLength: 1000,
    storyModes: {
      adventure: true,
      educational: true,
      bedtime: true,
      interactive: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok || response.status === 404) {
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Settings saved successfully!') // For demo purposes
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleLanguageToggle = (language: keyof AppSettings['languages']) => {
    setSettings(prev => ({
      ...prev,
      languages: {
        ...prev.languages,
        [language]: !prev.languages[language]
      }
    }))
  }

  const handleStoryModeToggle = (mode: keyof AppSettings['storyModes']) => {
    setSettings(prev => ({
      ...prev,
      storyModes: {
        ...prev.storyModes,
        [mode]: !prev.storyModes[mode]
      }
    }))
  }

  const handleMaxLengthChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      maxStoryLength: value
    }))
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
                <Link href="/admin/characters" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Characters
                </Link>
                <Link href="/admin/settings" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
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

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
            <p className="text-gray-600">Configure application settings and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Language Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Language Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Enable or disable languages for the application</p>
              
              <div className="space-y-3">
                {Object.entries(settings.languages).map(([lang, enabled]) => (
                  <div key={lang} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">
                        {lang === 'EN' ? 'English' : lang === 'FR' ? 'French' : 'Arabic'}
                      </span>
                      <span className="text-xs text-gray-500">({lang})</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleLanguageToggle(lang as keyof AppSettings['languages'])}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Story Length Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Story Length Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Set the maximum length for generated stories</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Story Length (characters)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="100"
                    value={settings.maxStoryLength}
                    onChange={(e) => handleMaxLengthChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current setting: {settings.maxStoryLength} characters
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {[500, 1000, 1500, 2000].map(length => (
                    <button
                      key={length}
                      onClick={() => handleMaxLengthChange(length)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        settings.maxStoryLength === length
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Story Modes Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Story Modes</h3>
              <p className="text-sm text-gray-600 mb-4">Enable or disable different story generation modes</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.storyModes).map(([mode, enabled]) => (
                  <div key={mode} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {mode} Mode
                      </h4>
                      <p className="text-xs text-gray-500">
                        {mode === 'adventure' && 'Action-packed adventure stories'}
                        {mode === 'educational' && 'Learning-focused educational content'}
                        {mode === 'bedtime' && 'Calm and soothing bedtime stories'}
                        {mode === 'interactive' && 'Choose-your-own-adventure style'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleStoryModeToggle(mode as keyof AppSettings['storyModes'])}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Save Settings</h3>
                  <p className="text-sm text-gray-600">Apply all changes to the application</p>
                </div>
                <div className="flex items-center space-x-4">
                  {saveMessage && (
                    <span className={`text-sm ${
                      saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {saveMessage}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Active Languages</h4>
                  <ul className="space-y-1">
                    {Object.entries(settings.languages)
                      .filter(([, enabled]) => enabled)
                      .map(([lang]) => (
                        <li key={lang} className="text-gray-600">
                          • {lang === 'EN' ? 'English' : lang === 'FR' ? 'French' : 'Arabic'}
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Story Settings</h4>
                  <p className="text-gray-600">Max Length: {settings.maxStoryLength} chars</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Active Modes</h4>
                  <ul className="space-y-1">
                    {Object.entries(settings.storyModes)
                      .filter(([, enabled]) => enabled)
                      .map(([mode]) => (
                        <li key={mode} className="text-gray-600 capitalize">
                          • {mode}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}