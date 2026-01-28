import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import Story from '../../../models/Story'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    await dbConnect()
    
    const stories = await Story.find({}).populate('userId', 'email').sort({ createdAt: -1 })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Stories fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { title, content, characters, genre } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      )
    }

    await dbConnect()
    
    const story = await Story.create({
      title,
      content,
      userId: decoded.userId,
      characters: characters || [],
      genre: genre || 'general',
    })

    return NextResponse.json({
      message: 'Story created successfully',
      story,
    })
  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}