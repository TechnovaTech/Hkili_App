import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    
    // 4. Generate Images using OpenAI DALL-E 3 (More reliable than free video APIs)
    const generatedContentUrls: string[] = [];

    // Check for OpenAI Key again (redundant but safe)
    if (!process.env.OPENAI_API_KEY) {
       return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY is missing.' },
        { status: 500 }
      );
    }

    let lastError = '';

    for (const prompt of prompts.slice(0, 4)) { // Limit to 4
      try {
        console.log(`Generating image for prompt: ${prompt}`);
        
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt + " highly detailed, cartoon style, vibrant colors",
          n: 1,
          size: "1024x1024",
          response_format: "b64_json", 
        });

        const b64Data = imageResponse.data?.[0]?.b64_json;
        if (!b64Data) continue;

        // Upload to Cloudinary directly from base64
        const result = await cloudinary.uploader.upload(`data:image/png;base64,${b64Data}`, {
            folder: 'hkili_scenes',
            resource_type: 'image',
        });
        
        generatedContentUrls.push(result.secure_url);

      } catch (genError: any) {
        console.error("Image generation failed for prompt:", prompt, genError);
        lastError = genError.message || 'Unknown error';
        // Don't fail completely if one fails, just continue
      }
    }

    if (generatedContentUrls.length === 0) {
        return NextResponse.json(
            { success: false, error: `Failed to generate content. OpenAI Error: ${lastError}` },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, videos: generatedContentUrls, type: 'image' });

  } catch (error: any) {
    console.error('Video Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
