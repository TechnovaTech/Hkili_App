import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import UserStory from '../../../models/UserStory';
import Story from '../../../models/Story';

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

    // Find all UserStory entries for this user and populate the story details
    const userStories = await UserStory.find({ userId })
      .populate({
        path: 'storyId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'storyCharacterId', select: 'name image' }
        ]
      })
      .sort({ savedAt: -1 });

    // Transform to return the Story objects enriched with library metadata if needed
    // Or just return the populated list.
    // The app likely expects a list of Stories.
    const stories = userStories
      .filter(us => us.storyId) // Filter out any null stories (deleted ones)
      .map(us => ({
        ...us.storyId.toObject(),
        libraryId: us._id, // Reference to the library entry
        savedAt: us.savedAt,
        isFavorite: us.isFavorite,
        lastReadAt: us.lastReadAt
      }));

    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
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

    // Check if already exists to avoid duplicates (or upsert)
    // We use findOneAndUpdate with upsert to handle "add to library" idempotently
    const userStory = await UserStory.findOneAndUpdate(
      { userId, storyId },
      { 
        $set: { lastReadAt: new Date() },
        $setOnInsert: { savedAt: new Date(), isFavorite: false }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, data: userStory });
  } catch (error) {
    console.error('Add to library error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
