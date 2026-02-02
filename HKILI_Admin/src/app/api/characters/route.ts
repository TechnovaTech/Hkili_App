import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import Character from '../../../models/Character'
import User from '../../../models/User'
import Category from '../../../models/Category'

// Ensure models are registered
const models = { User, Category }

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

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
    
    let query = {}
    if (decoded.role !== 'admin') {
      query = { userId: decoded.userId }
    }

    const characters = await Character.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('categoryId', 'name')

    return NextResponse.json({ success: true, data: characters })
  } catch (error) {
    console.error('Characters fetch error:', error)
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
    
    const body = await request.json()
    await dbConnect()
    
    const characterData = { ...body }
    
    // Assign userId if not admin, or if admin chooses to assign it (though usually admin creates system chars)
    // If admin and no userId provided, it remains undefined (system character)
    if (decoded.role !== 'admin') {
      characterData.userId = decoded.userId
    }
    
    const character = await Character.create(characterData)
    return NextResponse.json({ success: true, data: character }, { status: 201 })
  } catch (error) {
    console.error('Character creation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}