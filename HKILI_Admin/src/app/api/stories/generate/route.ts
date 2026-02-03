import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Story from '@/models/Story';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Category from '@/models/Category';
import StoryCharacter from '@/models/StoryCharacter';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    if (user.coins < storyCost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient coins to generate story' },
        { status: 403 }
      );
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

    // 4. Fetch details for prompt
    let categoryName = 'General';
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (category) categoryName = category.name;
    }

    let characterName = 'a character';
    let characterDesc = '';
    if (storyCharacterId) {
      const character = await StoryCharacter.findById(storyCharacterId);
      if (character) {
        characterName = character.name;
        characterDesc = character.description || '';
      }
    }

    // 5. Construct Prompt
    const prompt = `Write a short children's story about ${characterName} (${characterDesc}).
    The story takes place in ${place || 'a magical world'}.
    The genre is ${categoryName}.
    ${moral ? `The moral of the story should be: ${moral}` : ''}
    The story should be engaging, appropriate for children, and written in ${language}.
    Return the response as a valid JSON object with 'title' and 'content' fields.`;

    // 6. Call OpenAI
    if (!process.env.OPENAI_API_KEY) {
       // Fallback for dev/test without key - OR return error
       // For this task, we assume key is present or we return error
       return NextResponse.json({ success: false, error: 'Server configuration error (OpenAI Key)' }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative story writer for children."
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) {
        throw new Error('No content generated');
    }

    const parsedResult = JSON.parse(result);

    // 7. Create Story
    const newStory = await Story.create({
      title: parsedResult.title || 'Untitled Story',
      content: parsedResult.content,
      userId: userId,
      genre: categoryName,
      categoryId: categoryId,
      storyCharacterId: storyCharacterId,
      language: language,
      createdAt: new Date(),
    });

    // 8. Deduct Coins
    user.coins -= storyCost;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      data: newStory, 
      remainingCoins: user.coins 
    });

  } catch (error: any) {
    console.error('Story Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
