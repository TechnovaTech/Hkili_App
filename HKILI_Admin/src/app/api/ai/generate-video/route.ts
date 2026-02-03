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
    
    // 4. Generate Videos using Hugging Face (Restored & Fixed with Cloudinary)
    const generatedContentUrls: string[] = [];
    // Updated to use the new Router URL and the active ali-vilab model
    const HF_API_URL = "https://router.huggingface.co/models/ali-vilab/text-to-video-ms-1.7b";
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_KEY) {
       return NextResponse.json(
        { success: false, error: 'HUGGINGFACE_API_KEY is missing.' },
        { status: 500 }
      );
    }

    // Helper for retry logic
    const fetchWithRetry = async (url: string, body: any, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${HF_API_KEY}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body),
          });

          if (res.ok) {
            return await res.arrayBuffer();
          }

          const errorText = await res.text();
          
          if (res.status === 503) {
            const errorJson = JSON.parse(errorText);
            const waitTime = errorJson.estimated_time || 20;
            console.log(`Model loading. Waiting ${waitTime}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            continue;
          }

          throw new Error(`HF Error ${res.status}: ${errorText}`);
        } catch (err) {
           if (i === retries - 1) throw err;
           await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      throw new Error("Max retries exceeded");
    };

    let lastError = '';

    for (const prompt of prompts.slice(0, 4)) { 
      try {
        console.log(`Generating video for prompt: ${prompt}`);
        
        const videoBuffer = await fetchWithRetry(HF_API_URL, { inputs: prompt });
        const buffer = Buffer.from(videoBuffer as ArrayBuffer);
        const base64Data = buffer.toString('base64');
        const dataURI = `data:video/mp4;base64,${base64Data}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'hkili_videos',
            resource_type: 'video',
        });
        
        generatedContentUrls.push(result.secure_url);
        
        // Delay to prevent rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (genError: any) {
        console.error(`Video generation failed for prompt "${prompt}":`, genError);
        lastError = genError.message || 'Unknown error';
      }
    }

    if (generatedContentUrls.length === 0) {
        console.error("All video generation attempts failed. Last error:", lastError);
        return NextResponse.json(
            { success: false, error: `Failed to generate videos. Last Error: ${lastError}` },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, videos: generatedContentUrls, type: 'video' });

  } catch (error: any) {
    console.error('Video Generation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
