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
       return NextResponse.json(
        { success: false, error: 'HUGGINGFACE_API_KEY is missing in .env' },
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
          
          // Handle 503 Model Loading
          if (res.status === 503) {
            const errorJson = JSON.parse(errorText);
            const waitTime = errorJson.estimated_time || 20;
            console.log(`Model is loading. Waiting ${waitTime}s... (Attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            continue;
          }

          // Handle other server errors with simple backoff
          if (res.status >= 500) {
             console.warn(`Server error ${res.status}: ${errorText}. Retrying...`);
             await new Promise(resolve => setTimeout(resolve, 3000));
             continue;
          }

          throw new Error(`HF Error ${res.status}: ${errorText}`);
        } catch (err) {
           if (i === retries - 1) throw err;
           console.log(`Fetch error: ${err}. Retrying...`);
           await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      throw new Error("Max retries exceeded");
    };

    for (const prompt of prompts.slice(0, 4)) { // Limit to 4
      try {
        console.log(`Generating video for prompt: ${prompt}`);
        
        const videoBuffer = await fetchWithRetry(HF_API_URL, { inputs: prompt });
        const buffer = Buffer.from(videoBuffer as ArrayBuffer);
        
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
        
        // Small delay between successful requests to be polite
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (videoError) {
        console.error("Video generation failed for prompt:", prompt, videoError);
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
