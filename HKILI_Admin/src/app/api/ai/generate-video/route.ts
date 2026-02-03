import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const HF_API_URL = "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate (Simple check for Admin Token presence, assuming middleware or client handles validity for now, 
    // or we can reuse the JWT logic if available/needed. For Admin panel, usually we check session/token)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // 2. Parse Request
    const { storyContent } = await request.json();

    if (!storyContent) {
      return NextResponse.json(
        { success: false, error: 'Story content is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API Key is missing.' },
        { status: 500 }
      );
    }

    // 3. Generate Visual Prompts using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a storyboard artist. Create 4 distinct, highly descriptive visual prompts for an AI video generator based on the provided story. 
          Each prompt should describe a single key scene in 1 sentence. 
          Focus on visual details, cartoon style, and action. 
          Return the response as a JSON object with a 'prompts' array of strings.`
        },
        { role: "user", content: storyContent }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('Failed to generate prompts');
    
    const { prompts } = JSON.parse(result);
    
    // 4. Generate Videos using Hugging Face (or Mock if key missing for testing)
    const generatedVideoUrls: string[] = [];

    // Fallback if no HF key provided, to prevent crash and show instructions
    if (!HF_API_KEY) {
       console.warn("HUGGINGFACE_API_KEY missing. Returning mock response or error.");
       // Ideally we should return error, but for user experience let's return a helpful error
       return NextResponse.json(
        { success: false, error: 'HUGGINGFACE_API_KEY is missing in .env' },
        { status: 500 }
      );
    }

    for (const prompt of prompts.slice(0, 4)) { // Limit to 4
      try {
        console.log(`Generating video for prompt: ${prompt}`);
        const response = await fetch(HF_API_URL, {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
           const errText = await response.text();
           console.error(`HF Error for prompt "${prompt}":`, errText);
           continue; // Skip failed generation
        }

        const videoBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(videoBuffer);
        
        // Save file
        const fileName = `video-${uuidv4()}.mp4`;
        const publicPath = path.join(process.cwd(), 'public', 'generated-videos');
        const filePath = path.join(publicPath, fileName);

        // Ensure directory exists (redundant safety)
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }

        fs.writeFileSync(filePath, buffer);
        generatedVideoUrls.push(`/generated-videos/${fileName}`);

      } catch (videoError) {
        console.error("Video generation failed:", videoError);
      }
    }

    if (generatedVideoUrls.length === 0) {
        return NextResponse.json(
            { success: false, error: 'Failed to generate any videos. Service might be busy or overloaded.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, videos: generatedVideoUrls });

  } catch (error: any) {
    console.error('Video Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
