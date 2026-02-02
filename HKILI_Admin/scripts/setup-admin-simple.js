const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: false },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  coins: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function setupAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hkili.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'

    const existingAdmin = await User.findOne({ email: adminEmail })
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      status: 'active'
    })

    await admin.save()
    console.log('Admin user created successfully')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
  } catch (error) {
    console.error('Error setting up admin:', error)
  } finally {
    await mongoose.disconnect()
  }
}

setupAdmin()