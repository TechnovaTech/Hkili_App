import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'

function getUserId(request: NextRequest): string | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded.userId || null
  } catch {
    return null
  }
}

// POST /api/orders/verify  body: { orderId }
// Called by the app after the user returns from Stripe Checkout. Confirms the
// payment with Stripe and credits coins exactly once (atomic pending->completed).
export async function POST(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'orderId is required' }, { status: 400 })
    }

    await dbConnect()
    const order = await Order.findOne({ _id: orderId, userId })
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Already credited (idempotent) — just report current balance.
    if (order.status === 'completed') {
      return NextResponse.json({ success: true, status: 'completed', coins: user.coins })
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (order.provider !== 'stripe' || !order.providerRef || !stripeKey) {
      return NextResponse.json({ success: true, status: order.status, coins: user.coins })
    }

    const stripe = new Stripe(stripeKey)
    const session = await stripe.checkout.sessions.retrieve(order.providerRef)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ success: true, status: 'pending', coins: user.coins })
    }

    // Atomically flip pending -> completed so a concurrent verify can't double-credit.
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, status: { $ne: 'completed' } },
      { status: 'completed' },
      { new: true }
    )
    if (claimed) {
      user.coins = (user.coins || 0) + claimed.coins
      await user.save()
    }

    return NextResponse.json({ success: true, status: 'completed', coins: user.coins })
  } catch (error: any) {
    console.error('Order verify error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
