import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import BackgroundMusic from '../../../../models/BackgroundMusic'
import { adminAuthError } from '../../../../lib/adminAuth'
import { musicFieldsFromBody } from '../../../../lib/backgroundMusic'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = adminAuthError(request)
  if (authError) return authError

  try {
    const { id } = await params
    const fields = musicFieldsFromBody(await request.json())
    if (!fields.name || !fields.url) {
      return NextResponse.json({ success: false, error: 'Name and music file are required' }, { status: 400 })
    }

    await dbConnect()
    const track = await BackgroundMusic.findByIdAndUpdate(id, fields, { new: true })
    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: track })
  } catch (error) {
    console.error('Music update error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = adminAuthError(request)
  if (authError) return authError

  try {
    const { id } = await params
    await dbConnect()
    const track = await BackgroundMusic.findByIdAndDelete(id)
    if (!track) {
      return NextResponse.json({ success: false, error: 'Track not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Music delete error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
