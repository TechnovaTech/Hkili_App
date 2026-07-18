import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
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

    const stripeKey = process.env.STRIPE_SECRET_KEY

    // Payments REQUIRE Stripe — there is deliberately no free/stub fallback in
    // production. Coins are only credited by /api/orders/verify after Stripe
    // confirms payment_status=paid.
    if (!stripeKey) {
      return NextResponse.json(
        { success: false, message: 'Payments are not configured yet. Please try again later.' },
        { status: 503 }
      )
    }

    {
      const stripe = new Stripe(stripeKey)
      const order = await Order.create({
        userId,
        planId: plan._id,
        coins: plan.coins,
        amount: plan.discountPrice,
        currency: 'INR',
        provider: 'stripe',
        providerRef: '',
        status: 'pending',
      })

      const origin = new URL(request.url).origin
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              unit_amount: Math.round(plan.discountPrice * 100), // paise
              product_data: { name: `${plan.coins} Coins${plan.name ? ' — ' + plan.name : ''}` },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/payment-complete.html?status=success`,
        cancel_url: `${origin}/payment-complete.html?status=cancel`,
        metadata: { orderId: order._id.toString(), userId, coins: String(plan.coins) },
      })

      order.providerRef = session.id
      await order.save()

      return NextResponse.json({
        success: true,
        mode: 'stripe',
        checkoutUrl: session.url,
        orderId: order._id.toString(),
      })
    }
  } catch (error: any) {
    console.error('Order create error:', error?.message || error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
