const bcrypt = require('bcryptjs')
const dbConnect = require('../src/lib/mongodb.ts')
const User = require('../src/models/User.ts')
const Story = require('../src/models/Story.ts')

const seedData = async () => {
  try {
    await dbConnect()
    
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