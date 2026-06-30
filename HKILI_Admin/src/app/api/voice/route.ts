import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import VoiceProfile from '@/models/VoiceProfile'
import { getVoiceProvider, assertVoiceConfigured, VoiceProviderError } from '@/lib/voiceProvider'

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

// GET /api/voice — list the current user's cloned voices
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const voices = await VoiceProfile.find({ userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: voices.map((v: any) => ({
        id: v._id.toString(),
        name: v.name,
        language: v.language,
        status: v.status,
        sampleUrl: v.sampleUrl,
        createdAt: v.createdAt,
      })),
    })
  } catch (error: any) {
    console.error('Voice list error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/voice — clone a voice from a recorded sample
// body: { name, sampleUrl, language }
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { name, sampleUrl, language } = await request.json()
    if (!name || !sampleUrl) {
      return NextResponse.json(
        { success: false, message: 'name and sampleUrl are required' },
        { status: 400 }
      )
    }

    const provider = getVoiceProvider()
    assertVoiceConfigured(provider)

    const { providerVoiceId } = await provider.cloneVoice({
      name,
      sampleUrl,
      language: language || 'EN',
    })

    await dbConnect()
    const voice = await VoiceProfile.create({
      userId,
      name,
      provider: provider.name,
      providerVoiceId,
      sampleUrl,
      language: language || 'EN',
      status: 'ready',
    })

    return NextResponse.json({
      success: true,
      data: {
        id: voice._id.toString(),
        name: voice.name,
        language: voice.language,
        status: voice.status,
        sampleUrl: voice.sampleUrl,
        createdAt: voice.createdAt,
      },
      message: 'Voice cloned successfully',
    })
  } catch (error: any) {
    if (error instanceof VoiceProviderError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error('Voice clone error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
