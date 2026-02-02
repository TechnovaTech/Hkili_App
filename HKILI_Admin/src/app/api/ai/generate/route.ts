import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Story from '@/models/Story';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-replace-me',
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    await dbConnect();
    
    // 2. Parse Request
    const { prompt, language = 'EN' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    // 3. Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a creative story writer. Write a short children's story based on the user's prompt. 
          The story should be engaging, appropriate for children, and written in ${language}.
          Return the response as a JSON object with 'title' and 'content' fields.`
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

    // 4. Create Story (Saved directly to Stories Management)
    const newStory = await Story.create({
      title: parsedResult.title || 'Untitled AI Story',
      content: parsedResult.content,
      userId: userId,
      genre: 'AI Generated',
      language: language,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: newStory });

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
