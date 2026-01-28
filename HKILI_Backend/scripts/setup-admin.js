import bcrypt from 'bcryptjs'
import dbConnect from '../src/lib/mongodb'
import User from '../src/models/User'

async function setupAdmin() {
  try {
    await dbConnect()
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hkili.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const existingAdmin = await User.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    })

    console.log('Admin user created successfully')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
  } catch (error) {
    console.error('Error setting up admin:', error)
  }
}

setupAdmin()