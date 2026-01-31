import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret)
      payload = verifiedPayload
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid token', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        coins: user.coins || 0,
        isGuest: false
      }
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
