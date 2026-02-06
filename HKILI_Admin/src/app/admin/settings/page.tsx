'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AppSettings {
  signupBonusCoins: number | string
  storyCost: number | string
  openaiApiKey: string
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
    signupBonusCoins: 0,
    storyCost: 10,
    openaiApiKey: '',
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
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.data)
        }
      } else {
        if (response.status === 401) {
          router.push('/admin/login')
        }
        console.error('Failed to fetch settings')
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
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const settingsToSave = {
        ...settings,
        signupBonusCoins: Number(settings.signupBonusCoins),
        storyCost: Number(settings.storyCost)
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsToSave)
      })

      if (response.ok) {
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleBonusCoinsChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      signupBonusCoins: value
    }))
  }

  const handleStoryCostChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      storyCost: value
    }))
  }

  const handleApiKeyChange = (value: string) => {
    setSettings(prev => ({
      ...prev,
      openaiApiKey: value
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
                <p className="text-gray-600 mt-1">Configure application settings and preferences</p>
              </div>
              
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-4xl space-y-8">
            {/* Signup Bonus Coins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Up Bonus</h3>
              <p className="text-sm text-gray-600 mb-6">Set the number of free coins new users receive upon sign up</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Coins
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.signupBonusCoins}
                  onChange={(e) => handleBonusCoinsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Story Cost Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Story Cost</h3>
              <p className="text-sm text-gray-600 mb-6">Set the cost in coins for generating a new story</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Story
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.storyCost}
                  onChange={(e) => handleStoryCostChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* OpenAI API Key Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OpenAI API Key</h3>
              <p className="text-sm text-gray-600 mb-6">Set the OpenAI API Key for story generation (Leave empty to use environment variable)</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              <div className="text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Story Settings</h4>
                  <p className="text-gray-600">Story Cost: {settings.storyCost} coins</p>
                  <p className="text-gray-600">OpenAI Key: {settings.openaiApiKey ? '••••••••' : 'Not Set (Using Env)'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  )
}