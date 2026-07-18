import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '../../../../lib/mongodb'
import User from '../../../../models/User'
import Otp from '../../../../models/Otp'

// POST /api/auth/reset-password  body: { email, otp, newPassword }
// Completes the forgot-password flow: the user first requested a code via
// /api/auth/send-otp {purpose:'reset'}; here we verify it and set the password.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const { otp, newPassword } = body

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code and new password are required', message: 'Missing fields' },
        { status: 400 }
      )
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters', message: 'Weak password' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email', message: 'User not found' },
        { status: 404 }
      )
    }

    const otpDoc = await Otp.findOne({ email, purpose: 'reset' })
    if (!otpDoc) {
      return NextResponse.json(
        { success: false, error: 'Please request a reset code first', message: 'Code required' },
        { status: 400 }
      )
    }
    if (otpDoc.expiresAt < new Date() || otpDoc.attempts >= 5) {
      await Otp.deleteOne({ _id: otpDoc._id })
      return NextResponse.json(
        { success: false, error: 'Code expired. Please request a new one.', message: 'Code expired' },
        { status: 400 }
      )
    }
    const codeOk = await bcrypt.compare(String(otp), otpDoc.codeHash)
    if (!codeOk) {
      otpDoc.attempts += 1
      await otpDoc.save()
      return NextResponse.json(
        { success: false, error: 'Invalid code', message: 'Invalid code' },
        { status: 400 }
      )
    }

    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()
    await Otp.deleteOne({ _id: otpDoc._id })

    return NextResponse.json({ success: true, message: 'Password updated. You can sign in now.' })
  } catch (error: any) {
    console.error('reset-password error:', error?.message || error)
    return NextResponse.json(
      { success: false, error: 'Could not reset the password. Please try again.', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
