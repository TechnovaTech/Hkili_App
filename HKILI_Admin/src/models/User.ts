import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  coins: {
    type: Number,
    default: 0,
  },
  // ISO 3166-1 alpha-2 country code (e.g. 'US', 'IN', 'FR'). Drives the
  // currency shown for coin plans. Empty until the user sets it.
  country: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)