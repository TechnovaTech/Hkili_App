import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Otp from '../../../../models/Otp'
import { isEmailConfigured, sendMail, otpEmailHtml } from '../../../../lib/mailer'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

// POST /api/auth/send-otp  body: { email, purpose: 'register' | 'reset' }
// Sends a 6-digit code to the email. For 'register' the email must be new;
// for 'reset' an account must exist. Returns { otpRequired: false } when no
// SMTP server is configured (register then proceeds without verification).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const purpose = body?.purpose === 'reset' ? 'reset' : 'register'

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address', message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    await dbConnect()

    const existingUser = await User.findOne({ email })
    if (purpose === 'register' && existingUser) {
      return NextResponse.json(
        { success: false, error: 'This email is already in use', message: 'This email is already in use' },
        { status: 400 }
      )
    }
    // ANTI-ENUMERATION: for password reset we return the same success response
    // whether or not an account exists — no code is actually sent for unknown
    // emails, so the flow simply can't be completed. A 404 here would let
    // attackers probe which emails have accounts.
    if (purpose === 'reset' && !existingUser) {
      return NextResponse.json({ success: true, otpRequired: true, message: 'Verification code sent' })
    }

    if (!isEmailConfigured()) {
      if (purpose === 'reset') {
        return NextResponse.json(
          { success: false, error: 'Password reset by email is not available yet. Please contact support.', message: 'Email service not configured' },
          { status: 503 }
        )
      }
      // Registration continues without a code when no mail server is set up.
      return NextResponse.json({ success: true, otpRequired: false })
    }

    // Basic resend throttle: at most one code per 60s per email+purpose.
    const existing = await Otp.findOne({ email, purpose })
    if (existing && Date.now() - new Date(existing.createdAt).getTime() < 60 * 1000) {
      return NextResponse.json(
        { success: false, error: 'Please wait a minute before requesting another code', message: 'Too many requests' },
        { status: 429 }
      )
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const codeHash = await bcrypt.hash(code, 10)

    await Otp.findOneAndUpdate(
      { email, purpose },
      { codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS), attempts: 0, createdAt: new Date() },
      { upsert: true }
    )

    await sendMail(
      email,
      purpose === 'register' ? 'Your Unaï verification code' : 'Your Unaï password reset code',
      otpEmailHtml(code, purpose)
    )

    return NextResponse.json({ success: true, otpRequired: true, message: 'Verification code sent' })
  } catch (error: any) {
    console.error('send-otp error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Could not send the verification code. Please try again.', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
