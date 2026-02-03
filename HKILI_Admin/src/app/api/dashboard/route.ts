import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Story from '@/models/Story'
import Character from '@/models/Character'

export async function GET() {
  try {
    await dbConnect()

    const [
      usersCount,
      storiesCount,
      charactersCount,
      users,
      recentStories
    ] = await Promise.all([
      User.countDocuments(),
      Story.countDocuments(),
      Character.countDocuments(),
      User.find({}).select('coins status createdAt'),
      Story.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
    ])

    const totalCoins = users.reduce((acc, user) => acc + (user.coins || 0), 0)
    const activeUsersCount = users.filter(user => user.status === 'active').length

    // Mock revenue calculation (since we don't have transactions yet)
    // We can assume some value per coin or just show 0
    const revenue = 0 

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: usersCount,
          activeUsers: activeUsersCount,
          totalStories: storiesCount,
          totalCharacters: charactersCount,
          totalCoins: totalCoins,
          revenue: revenue
        },
        recentStories
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
