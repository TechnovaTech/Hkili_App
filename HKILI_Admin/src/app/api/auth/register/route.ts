import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Setting from '../../../../models/Setting'
import Otp from '../../../../models/Otp'
import { isEmailConfigured } from '../../../../lib/mailer'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { password, otp } = body
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required', message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters', message: 'Password must be at least 6 characters' },
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

    // Email OTP verification — enforced whenever an SMTP server is configured.
    if (isEmailConfigured()) {
      const hasCode = await Otp.exists({ email, purpose: 'register' })
      if (!hasCode) {
        return NextResponse.json(
          { success: false, error: 'Please request a verification code first', message: 'Verification code required' },
          { status: 400 }
        )
      }
      // Atomically consume one attempt slot before comparing — parallel guesses
      // each burn a slot, so the 5-attempt cap can't be raced past.
      const otpDoc = await Otp.findOneAndUpdate(
        { email, purpose: 'register', attempts: { $lt: 5 }, expiresAt: { $gt: new Date() } },
        { $inc: { attempts: 1 } },
        { new: true }
      )
      if (!otpDoc) {
        await Otp.deleteOne({ email, purpose: 'register' })
        return NextResponse.json(
          { success: false, error: 'Verification code expired. Please request a new one.', message: 'Verification code expired' },
          { status: 400 }
        )
      }
      const codeOk = otp && (await bcrypt.compare(String(otp), otpDoc.codeHash))
      if (!codeOk) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code', message: 'Invalid verification code' },
          { status: 400 }
        )
      }
      await Otp.deleteOne({ _id: otpDoc._id })
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
