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
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage('')

    try {
      // Simulate API call
      setTimeout(() => {
        setSaveMessage('Settings saved successfully!')
        setSaving(false)
        setTimeout(() => setSaveMessage(''), 3000)
      }, 1000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Error saving settings')
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
          <Link href="/admin/characters" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors">
            Characters
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-blue-600 bg-blue-50 border-r-4 border-blue-600 font-medium">
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
                <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
                <p className="text-gray-600 mt-1">Configure application settings and preferences</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-4xl space-y-8">
            {/* Language Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Settings</h3>
              <p className="text-sm text-gray-600 mb-6">Enable or disable languages for the application</p>
              
              <div className="space-y-4">
                {Object.entries(settings.languages).map(([lang, enabled]) => (
                  <div key={lang} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">{lang}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {lang === 'EN' ? 'English' : lang === 'FR' ? 'French' : 'Arabic'}
                        </span>
                        <p className="text-xs text-gray-500">
                          {lang === 'EN' ? 'Primary language' : lang === 'FR' ? 'Français' : 'العربية'}
                        </p>
                      </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Length Settings</h3>
              <p className="text-sm text-gray-600 mb-6">Set the maximum length for generated stories</p>
              
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current setting: {settings.maxStoryLength} characters
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {[500, 1000, 1500, 2000].map(length => (
                    <button
                      key={length}
                      onClick={() => handleMaxLengthChange(length)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Modes</h3>
              <p className="text-sm text-gray-600 mb-6">Enable or disable different story generation modes</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.storyModes).map(([mode, enabled]) => (
                  <div key={mode} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 capitalize mb-1">
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

            {/* Save Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Save Settings</h3>
                  <p className="text-sm text-gray-600">Apply all changes to the application</p>
                </div>
                <div className="flex items-center gap-4">
                  {saveMessage && (
                    <span className={`text-sm font-medium ${
                      saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {saveMessage}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Active Languages</h4>
                  <ul className="space-y-1">
                    {Object.entries(settings.languages)
                      .filter(([, enabled]) => enabled)
                      .map(([lang]) => (
                        <li key={lang} className="text-gray-600 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {lang === 'EN' ? 'English' : lang === 'FR' ? 'French' : 'Arabic'}
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Story Settings</h4>
                  <p className="text-gray-600">Max Length: {settings.maxStoryLength} characters</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Active Modes</h4>
                  <ul className="space-y-1">
                    {Object.entries(settings.storyModes)
                      .filter(([, enabled]) => enabled)
                      .map(([mode]) => (
                        <li key={mode} className="text-gray-600 capitalize flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {mode}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}