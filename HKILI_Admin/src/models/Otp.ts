import mongoose from 'mongoose'

/**
 * One-time verification codes for email flows.
 * purpose 'register' — verify the email before creating the account.
 * purpose 'reset'    — verify ownership before changing the password.
 * One active code per (email, purpose); requesting again overwrites it.
 */
const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  purpose: {
    type: String,
    enum: ['register', 'reset'],
    required: true,
  },
  // bcrypt hash of the 6-digit code — never store the raw code.
  codeHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

OtpSchema.index({ email: 1, purpose: 1 }, { unique: true })
// Let MongoDB purge expired codes automatically.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema)
