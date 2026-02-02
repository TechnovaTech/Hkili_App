import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../../lib/mongodb'
import Story from '../../../../models/Story'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    // Verify token exists and is valid, but don't strictly require admin role for viewing
    jwt.verify(token, process.env.JWT_SECRET!)

    await dbConnect()
    
    const story = await Story.findById(id)
      .populate('userId', 'email')
      .populate('categoryId', 'name')
      .populate('storyCharacterId', 'name image')
    
    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 })
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error('Story fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    await dbConnect()
    
    const story = await Story.findByIdAndUpdate(id, body, { new: true })

    if (!story) {
      return NextResponse.json({ message: 'Story not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, story })
  } catch (error) {
    console.error('Story update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()
    
    const story = await Story.findByIdAndDelete(id)

    if (!story) {
      return NextResponse.json(
        { message: 'Story not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Story delete error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}