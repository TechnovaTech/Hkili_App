import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '../../../lib/mongodb'
import Setting from '../../../models/Setting'

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

    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({
        signupBonusCoins: 0,
        storyCost: 10,
        languages: { EN: true, FR: true, AR: true },
        maxStoryLength: 1000,
        storyModes: { adventure: true, educational: true, bedtime: true, interactive: false }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json()

    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create(body)
    } else {
      settings = await Setting.findOneAndUpdate({}, body, { new: true })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
