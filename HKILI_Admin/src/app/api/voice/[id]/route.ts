import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import VoiceProfile from '@/models/VoiceProfile'
import { getVoiceProvider } from '@/lib/voiceProvider'

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

// DELETE /api/voice/:id — remove one of the user's cloned voices
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const voice = await VoiceProfile.findOne({ _id: id, userId })
    if (!voice) {
      return NextResponse.json({ success: false, message: 'Voice not found' }, { status: 404 })
    }

    // Best-effort remote cleanup, then remove our record.
    try {
      const provider = getVoiceProvider()
      if (provider.name === voice.provider) {
        await provider.deleteVoice(voice.providerVoiceId)
      }
    } catch (e) {
      console.warn('Provider voice delete failed (continuing):', e)
    }

    await VoiceProfile.deleteOne({ _id: id, userId })

    return NextResponse.json({ success: true, message: 'Voice deleted' })
  } catch (error: any) {
    console.error('Voice delete error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
