import { NextRequest, NextResponse } from 'next/server'

// Mock settings data - replace with actual database operations
let appSettings = {
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
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(appSettings)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    appSettings = { ...appSettings, ...body }
    
    // In a real app, save to database
    return NextResponse.json(appSettings)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}