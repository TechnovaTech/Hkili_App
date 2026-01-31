import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Character from '../../../../models/Character'

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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }
    
    await dbConnect()
    
    const character = await Character.findById(params.id)

    if (!character) {
      return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 })
    }

    // Check ownership
    if (decoded.role !== 'admin' && character.userId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized access to this character' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: character })
  } catch (error) {
    console.error('Character fetch error:', error)
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
    
    const body = await request.json()
    await dbConnect()
    
    // First find the character to check ownership
    const character = await Character.findById(params.id)

    if (!character) {
      return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 })
    }

    // Check ownership
    if (decoded.role !== 'admin' && character.userId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to update this character' }, { status: 403 })
    }
    
    // Perform update
    const updatedCharacter = await Character.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )

    return NextResponse.json({ success: true, data: updatedCharacter })
  } catch (error) {
    console.error('Character update error:', error)
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
    
    await dbConnect()
    
    const character = await Character.findById(params.id)

    if (!character) {
      return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 })
    }

    // Check ownership
    if (decoded.role !== 'admin' && character.userId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete this character' }, { status: 403 })
    }
    
    await Character.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true, message: 'Character deleted successfully' })
  } catch (error) {
    console.error('Character delete error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}