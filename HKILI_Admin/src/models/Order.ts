import mongoose from 'mongoose'

/**
 * A coin purchase. NOTE: today the checkout is a STUB — coins are credited
 * without a real charge (status goes straight to 'completed'). Before launch,
 * a real payment gateway (IAP / RevenueCat / Stripe) must create the order as
 * 'pending' and only flip it to 'completed' after server-side verification of
 * the payment. This model already carries the fields that flow needs.
 */
const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  coins: {
    type: Number,
    required: true,
    min: 0,
  },
  // Charged amount in the plan's base currency and the currency actually shown
  // to the user at purchase time.
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  provider: {
    type: String,
    default: 'stub', // 'stub' | 'stripe' | 'apple' | 'google' | ...
  },
  // Reference id from the payment provider (empty for the stub).
  providerRef: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
