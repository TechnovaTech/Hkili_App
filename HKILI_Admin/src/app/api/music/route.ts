import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import BackgroundMusic from '../../../models/BackgroundMusic'
import { adminAuthError } from '../../../lib/adminAuth'
import { musicFieldsFromBody } from '../../../lib/backgroundMusic'

export async function GET(request: NextRequest) {
  const authError = adminAuthError(request)
  if (authError) return authError

  try {
    await dbConnect()
    const tracks = await BackgroundMusic.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: tracks })
  } catch (error) {
    console.error('Music fetch error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = adminAuthError(request)
  if (authError) return authError

  try {
    const fields = musicFieldsFromBody(await request.json())
    if (!fields.name || !fields.url) {
      return NextResponse.json({ success: false, error: 'Name and music file are required' }, { status: 400 })
    }

    await dbConnect()
    const track = await BackgroundMusic.create(fields)
    return NextResponse.json({ success: true, data: track }, { status: 201 })
  } catch (error) {
    console.error('Music create error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
