const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hkili_db')
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

// Story Schema
const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  characters: [{ name: String, description: String }],
  genre: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)
const Story = mongoose.model('Story', StorySchema)

const seedData = async () => {
  try {
    await connectDB()
    
    // Clear existing data
    await User.deleteMany({})
    await Story.deleteMany({})
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await User.create({
      email: 'admin@hkili.com',
      password: adminPassword,
      role: 'admin'
    })

    // Create sample users
    const userPassword = await bcrypt.hash('user123', 12)
    const users = await User.insertMany([
      { email: 'john@example.com', password: userPassword, role: 'user' },
      { email: 'sarah@example.com', password: userPassword, role: 'user' },
      { email: 'mike@example.com', password: userPassword, role: 'user' }
    ])

    // Create sample stories
    const stories = [
      {
        title: 'The Magic Forest',
        content: 'Once upon a time, in a magical forest filled with talking animals and glowing trees, a young girl named Luna discovered she had the power to communicate with nature.',
        userId: users[0]._id,
        characters: [{ name: 'Luna', description: 'A brave young girl' }],
        genre: 'fantasy'
      },
      {
        title: 'Space Adventure',
        content: 'Captain Rex and his crew embarked on a journey to explore the mysterious planet Zephyr, where they encountered alien civilizations and ancient technologies.',
        userId: users[1]._id,
        characters: [{ name: 'Captain Rex', description: 'Space explorer' }],
        genre: 'sci-fi'
      },
      {
        title: 'The Lost Treasure',
        content: 'Pirates sailed across the seven seas in search of the legendary treasure of Captain Blackbeard, facing storms, sea monsters, and rival crews.',
        userId: users[2]._id,
        characters: [{ name: 'Captain Morgan', description: 'Pirate captain' }],
        genre: 'adventure'
      }
    ]

    await Story.insertMany(stories)

    console.log('✅ Database seeded successfully!')
    console.log(`👤 Created ${users.length + 1} users (including admin)`)
    console.log(`📚 Created ${stories.length} stories`)
    console.log('\n🔑 Admin Login:')
    console.log('Email: admin@hkili.com')
    console.log('Password: admin123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedData()