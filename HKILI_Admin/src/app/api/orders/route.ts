import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import Plan from '@/models/Plan'
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

// GET /api/orders — the current user's purchase history (newest first).
export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    await dbConnect()
    const orders = await Order.find({ userId })
      .populate('planId', 'name coins')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    console.error('Orders list error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders — buy a coin plan.
// body: { planId }
//
// ⚠️ STUB CHECKOUT: this credits coins WITHOUT taking a real payment. It exists
// so the whole purchase flow (order record + coin balance update) is wired up
// end to end. Before going live, replace the "mark completed + credit coins"
// block with: create the order as 'pending', hand off to the real gateway
// (IAP / RevenueCat / Stripe), and only credit coins after verifying the
// payment (ideally via the provider's server-to-server webhook).
export async function POST(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { planId } = await request.json()
    if (!planId) {
      return NextResponse.json({ success: false, message: 'planId is required' }, { status: 400 })
    }

    await dbConnect()

    const [plan, user] = await Promise.all([
      Plan.findById(planId),
      User.findById(userId),
    ])
    if (!plan) {
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 })
    }
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // --- STUB payment: succeeds immediately, no money changes hands ---
    const order = await Order.create({
      userId,
      planId: plan._id,
      coins: plan.coins,
      amount: plan.discountPrice,
      currency: 'INR', // plans are authored in INR (base); display currency is client-side
      provider: 'stub',
      providerRef: '',
      status: 'completed',
    })

    user.coins = (user.coins || 0) + plan.coins
    await user.save()

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        coinsAdded: plan.coins,
      },
      coins: user.coins,
      message: 'Purchase completed',
    })
  } catch (error: any) {
    console.error('Order create error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
