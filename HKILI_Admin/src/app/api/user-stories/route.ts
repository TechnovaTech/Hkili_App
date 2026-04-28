import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import UserStory from '../../../models/UserStory';
import '../../../models/Story';
import '../../../models/User';
import '../../../models/Category';
import '../../../models/StoryCharacter';

// GET: Fetch user's library stories
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    await dbConnect();

    const userStories = await UserStory.find({ userId })
      .populate({ path: 'storyId', populate: { path: 'categoryId', select: 'name' } })
      .sort({ savedAt: -1 })
      .lean();

    const stories = userStories
      .filter((us: any) => us.storyId != null)
      .map((us: any) => {
        const story = us.storyId;
        return {
          ...story,
          id: story._id?.toString(),
          _id: story._id?.toString(),
          savedAt: us.savedAt,
          isFavorite: us.isFavorite ?? false,
          lastReadAt: us.lastReadAt,
        };
      });

    return NextResponse.json({ success: true, data: stories });
  } catch (error: any) {
    console.error('Library fetch error:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a story to user's library
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const { storyId } = await request.json();
    if (!storyId) {
      return NextResponse.json({ message: 'Story ID is required' }, { status: 400 });
    }

    await dbConnect();

    const userStory = await UserStory.findOneAndUpdate(
      { userId, storyId },
      {
        $set: { lastReadAt: new Date() },
        $setOnInsert: { savedAt: new Date(), isFavorite: false },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: userStory });
  } catch (error: any) {
    console.error('Add to library error:', error?.message || error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
