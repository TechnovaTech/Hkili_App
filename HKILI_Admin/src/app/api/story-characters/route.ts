import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import StoryCharacter from '../../../models/StoryCharacter'
import Category from '../../../models/Category'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    const query: any = {}
    if (categoryId) {
      query.categoryId = categoryId
    }

    const characters = await StoryCharacter.find(query)
      .sort({ createdAt: -1 })
      .populate('categoryId', 'name')

    return NextResponse.json({ success: true, data: characters })
  } catch (error) {
    console.error('Story Characters fetch error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    
    const character = await StoryCharacter.create(body)
    return NextResponse.json({ success: true, data: character }, { status: 201 })
  } catch (error) {
    console.error('Story Character creation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
