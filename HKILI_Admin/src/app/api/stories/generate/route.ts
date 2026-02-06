import { NextRequest, NextResponse } from 'next/server';
import Story from '@/models/Story';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Category from '@/models/Category';
import StoryCharacter from '@/models/StoryCharacter';
import UserStory from '@/models/UserStory';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    // 2. Check User Coins and Story Cost
    const setting = await Setting.findOne();
    const storyCost = setting?.storyCost ?? 10;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 3. Parse Request
    const body = await request.json();
    const { 
      categoryId, 
      storyCharacterId, 
      place, 
      moral, 
      language = 'EN' 
    } = body;

    // 4. Find Existing Stories from Admin
    // Find all admin users
    const admins = await User.find({ role: 'admin' }).select('_id');
    const adminIds = admins.map(a => a._id);

    // Query for matching stories created by admins
    const query = {
      categoryId,
      storyCharacterId,
      userId: { $in: adminIds }
    };

    // Get all matching candidates
    const candidates = await Story.find(query);

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No stories available for this selection. Please try different options.' },
        { status: 404 }
      );
    }

    // 5. Filter out stories already in user's library
    const userLibrary = await UserStory.find({ userId }).select('storyId');
    const userStoryIds = new Set(userLibrary.map(ul => ul.storyId.toString()));

    const freshStories = candidates.filter(story => !userStoryIds.has(story._id.toString()));
    
    let selectedStory;
    let coinsDeducted = 0;

    if (freshStories.length > 0) {
      // Pick a random NEW story
      const random = Math.floor(Math.random() * freshStories.length);
      selectedStory = freshStories[random];
      
      // Check coins before deducting
      if (user.coins < storyCost) {
         return NextResponse.json(
          { success: false, error: 'Insufficient coins to unlock a new story' },
          { status: 403 }
        );
      }

      // Deduct coins
      user.coins -= storyCost;
      await user.save();
      coinsDeducted = storyCost;

      // Add to Library
      await UserStory.create({
        userId,
        storyId: selectedStory._id,
        savedAt: new Date(),
        isFavorite: false
      });

    } else {
      // All stories unlocked - pick a random one from candidates (re-read)
      // Do not deduct coins for re-reading
      const random = Math.floor(Math.random() * candidates.length);
      selectedStory = candidates[random];
      
      // Update last read time
      await UserStory.findOneAndUpdate(
        { userId, storyId: selectedStory._id },
        { lastReadAt: new Date() }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: selectedStory, 
      remainingCoins: user.coins,
      message: coinsDeducted > 0 ? 'New story unlocked!' : 'Story retrieved from library.'
    });

  } catch (error: any) {
    console.error('Story Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
