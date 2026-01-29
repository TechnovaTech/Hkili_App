import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import Character from '../../../models/Character'
import User from '../../../models/User'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    await dbConnect()

    let query = {}
    if (decoded.role !== 'admin') {
      query = { userId: decoded.userId }
    }

    const characters = await Character.find(query).sort({ createdAt: -1 })

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const body = await request.json()
    await dbConnect()
    
    const characterData = {
      ...body,
      userId: decoded.userId
    }
    
    const character = await Character.create(characterData)
    return NextResponse.json({ success: true, data: character }, { status: 201 })
  } catch (error) {
    console.error('Character creation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}