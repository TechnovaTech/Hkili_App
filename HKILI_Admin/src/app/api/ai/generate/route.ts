import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Story from '@/models/Story';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Category from '@/models/Category';
import Character from '@/models/Character';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    await dbConnect();

    const setting = await Setting.findOne();
    const storyCost = setting?.storyCost ?? 10;
    const apiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && user.coins < storyCost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient coins to generate story' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      language = 'EN',
      // New structured fields from app
      categoryId,
      mainCharacterIds,
      sideCharacterIds,
      place,
      moral,
      // Legacy: direct prompt from admin panel
      prompt: directPrompt,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API Key is missing. Please add it in Admin Settings.' },
        { status: 500 }
      );
    }

    let finalPrompt = directPrompt;
    let categoryName = '';
    let mainCharacterNames: string[] = [];
    let sideCharacterNames: string[] = [];

    // Build structured prompt when called from the app
    if (categoryId && mainCharacterIds?.length > 0) {
      const category = await Category.findById(categoryId);
      categoryName = category?.name || 'General';

      const mainChars = await Character.find({ _id: { $in: mainCharacterIds } });
      mainCharacterNames = mainChars.map((c: any) => c.name);

      if (sideCharacterIds?.length > 0) {
        const sideChars = await Character.find({ _id: { $in: sideCharacterIds } });
        sideCharacterNames = sideChars.map((c: any) => c.name);
      }

      const moralText = moral || 'No specific moral';
      const placeText = place || 'a magical land';

      finalPrompt = `Write a ${categoryName} story set in ${placeText}.\n\nMain character(s): ${mainCharacterNames.join(', ')}\nSide character(s): ${sideCharacterNames.length > 0 ? sideCharacterNames.join(', ') : 'None'}\nMoral of the story: ${moralText}\n\nMake the story immersive, coherent, and end with the moral clearly reflected in the outcome.`;
    }

    if (!finalPrompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a creative children's story writer. Write an engaging, age-appropriate story based on the user's prompt. Write in ${language}. Return JSON with 'title' and 'content' fields.`,
        },
        { role: 'user', content: finalPrompt },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('No content generated');

    const parsedResult = JSON.parse(result);

    const newStory = await Story.create({
      title: parsedResult.title || 'Untitled AI Story',
      content: parsedResult.content,
      userId,
      genre: 'AI Generated',
      language,
      categoryId: categoryId || undefined,
      place: place || undefined,
      moral: moral || undefined,
      mainCharacters: mainCharacterNames,
      sideCharacters: sideCharacterNames,
      prompt: finalPrompt,
      createdAt: new Date(),
    });

    if (user.role !== 'admin') {
      user.coins -= storyCost;
      await user.save();
    }

    return NextResponse.json({ success: true, data: newStory, remainingCoins: user.coins });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
