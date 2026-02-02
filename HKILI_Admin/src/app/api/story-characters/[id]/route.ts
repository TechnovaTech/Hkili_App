import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import StoryCharacter from '../../../../models/StoryCharacter'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }
    
    await dbConnect()
    
    const character = await StoryCharacter.findById(params.id)

    if (!character) {
      return NextResponse.json({ success: false, error: 'Story Character not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: character })
  } catch (error) {
    console.error('Story Character fetch error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }
    
    const body = await request.json()
    await dbConnect()
    
    const updatedCharacter = await StoryCharacter.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )

    if (!updatedCharacter) {
      return NextResponse.json({ success: false, error: 'Story Character not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updatedCharacter })
  } catch (error) {
    console.error('Story Character update error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }
    
    await dbConnect()
    
    const deletedCharacter = await StoryCharacter.findByIdAndDelete(params.id)

    if (!deletedCharacter) {
      return NextResponse.json({ success: false, error: 'Story Character not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Story Character deleted successfully' })
  } catch (error) {
    console.error('Story Character delete error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
