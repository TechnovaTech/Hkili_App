import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    await dbConnect()
    console.log('Database connected')
    
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })
    console.log('User found:', user ? 'Yes' : 'No')
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials', message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Comparing passwords...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isPasswordValid)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials', message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Creating JWT token...')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({ 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)

    console.log('Token created successfully')
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        tokens: {
          accessToken: token,
          refreshToken: token,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }
      },
      message: 'Login successful'
    })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error details:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
