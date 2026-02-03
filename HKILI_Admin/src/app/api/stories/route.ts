import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import Story from '../../../models/Story'

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const storyCharacterId = searchParams.get('storyCharacterId')

    console.log(`[API] Fetching stories. Filters: categoryId=${categoryId}, storyCharacterId=${storyCharacterId}`);

    const query: any = {}
    if (categoryId) query.categoryId = categoryId
    if (storyCharacterId) query.storyCharacterId = storyCharacterId
    
    const stories = await Story.find(query)
      .populate('userId', 'email')
      .populate('categoryId', 'name')
      .populate('storyCharacterId', 'name image')
      .sort({ createdAt: -1 })
    
    console.log(`[API] Found ${stories.length} stories matching criteria.`);

    return NextResponse.json(stories)
  } catch (error) {
    console.error('[API] Error fetching stories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    const { title, content, characters, genre, categoryId, storyCharacterId, video1, video2, video3 } = await request.json()

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
      categoryId,
      storyCharacterId,
      video1,
      video2,
      video3,
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