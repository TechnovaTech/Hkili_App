import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import dbConnect from '@/lib/mongodb'
import VoiceProfile from '@/models/VoiceProfile'
import Story from '@/models/Story'
import { getVoiceProvider, assertVoiceConfigured, VoiceProviderError } from '@/lib/voiceProvider'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getUserId(request: NextRequest): string | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded.userId || null
  } catch {
    return null
  }
}

// Upload mp3 bytes to Cloudinary and return the permanent URL.
async function uploadAudioToCloudinary(buffer: Buffer): Promise<string | null> {
  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'hkili-app/voice-audio', resource_type: 'video' }, // audio = "video" in Cloudinary
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        )
        .end(buffer)
    })
    return result?.secure_url ?? null
  } catch (e) {
    console.error('Cloudinary audio upload failed:', e)
    return null
  }
}

// Strip a stored story (which may be a JSON string of segments) down to plain
// narration text for TTS.
function extractStoryText(raw: any, title?: string): string {
  if (!raw) return title || ''
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        const segs = Array.isArray(parsed) ? parsed : parsed.content
        if (Array.isArray(segs)) {
          return segs.map((s: any) => s?.text || '').filter(Boolean).join('\n\n')
        }
      } catch {
        /* not JSON, fall through */
      }
    }
    return trimmed
  }
  if (Array.isArray(raw)) {
    return raw.map((s: any) => s?.text || '').filter(Boolean).join('\n\n')
  }
  return String(raw)
}

// POST /api/voice/synthesize
// body: { voiceId, text? , storyId? , language? }
// Prefer `text` (exactly what the app displays); fall back to the stored story.
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { voiceId, text, storyId, language } = await request.json()
    if (!voiceId) {
      return NextResponse.json({ success: false, message: 'voiceId is required' }, { status: 400 })
    }

    await dbConnect()

    const voice = await VoiceProfile.findOne({ _id: voiceId, userId })
    if (!voice) {
      return NextResponse.json({ success: false, message: 'Voice not found' }, { status: 404 })
    }

    // Resolve the narration text.
    let narration = (text || '').trim()
    if (!narration && storyId) {
      const story = await Story.findById(storyId).lean<any>()
      narration = extractStoryText(story?.content, story?.title)
    }
    if (!narration) {
      return NextResponse.json(
        { success: false, message: 'No text to synthesize' },
        { status: 400 }
      )
    }

    const provider = getVoiceProvider()
    assertVoiceConfigured(provider)

    const audioBuffer = await provider.synthesize({
      text: narration,
      providerVoiceId: voice.providerVoiceId,
      language: language || voice.language || 'EN',
    })

    const audioUrl = await uploadAudioToCloudinary(audioBuffer)
    if (!audioUrl) {
      return NextResponse.json(
        { success: false, message: 'Failed to store generated audio' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: { audioUrl } })
  } catch (error: any) {
    if (error instanceof VoiceProviderError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error('Voice synthesize error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
