import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'

// Verify the bearer token and return its payload, or null when invalid/missing.
async function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId?: string }
  } catch {
    return null
  }
}

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

// Self-service profile update: change own name and/or password.
export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request)
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body || {}

    await dbConnect()
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', message: 'User not found' },
        { status: 404 }
      )
    }

    // Update display name when provided.
    if (typeof name === 'string') {
      user.name = name.trim()
    }

    // Optional password change — requires the current password to match.
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Weak password', message: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }
      const matches = await bcrypt.compare(currentPassword || '', user.password)
      if (!matches) {
        return NextResponse.json(
          { success: false, error: 'Invalid password', message: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      user.password = await bcrypt.hash(newPassword, 12)
    }

    await user.save()

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        coins: user.coins || 0,
        isGuest: false
      },
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Self-service account deletion: permanently remove the authenticated user.
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request)
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await dbConnect()
    const user = await User.findByIdAndDelete(payload.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
