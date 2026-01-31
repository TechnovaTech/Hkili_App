import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Setting from '../../../../models/Setting'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already in use', message: 'This email is already in use' },
        { status: 400 }
      )
    }

    // Fetch signup bonus coins from settings
    let bonusCoins = 0;
    try {
      const settings = await Setting.findOne();
      console.log('Found settings:', settings); // Debug log
      if (settings && settings.signupBonusCoins) {
        bonusCoins = Number(settings.signupBonusCoins);
      }
    } catch (err) {
      console.error('Error fetching signup bonus settings:', err);
    }

    console.log('Creating user with bonus coins:', bonusCoins); // Debug log

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      email,
      password: hashedPassword,
      coins: bonusCoins
    })

    // Create JWT token using jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({ 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          coins: user.coins
        },
        tokens: {
          accessToken: token,
          refreshToken: token,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        }
      },
      message: 'User created successfully'
    })

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
