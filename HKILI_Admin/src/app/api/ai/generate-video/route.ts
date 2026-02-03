import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import RunwayML from '@runwayml/sdk';

// Allow up to 60 seconds for video generation (if supported by platform)
export const maxDuration = 60;

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

// Initialize RunwayML
// Note: RunwayML SDK automatically looks for RUNWAYML_API_SECRET env var.
// We also allow RUNWAY_API_KEY for convenience if the user sets that.
const runwayClient = new RunwayML({
    apiKey: process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
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
    
    // Check Runway API Key
    if (!process.env.RUNWAYML_API_SECRET && !process.env.RUNWAY_API_KEY) {
         return NextResponse.json(
        { success: false, error: 'RUNWAYML_API_SECRET is missing. Please add it to .env' },
        { status: 500 }
      );
    }

    // 3. Generate Visual Prompts using OpenAI (GPT-3.5)
    // Refine the story into a good visual description
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a storyboard artist. Create ONE highly descriptive visual prompt for an AI video generator based on the provided story. 
          The prompt should describe a single key scene in 1 sentence. 
          Focus on visual details, cartoon style, and action. 
          Return the response as a JSON object with a 'prompts' array containing exactly one string.`
        },
        { role: "user", content: storyContent }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('Failed to generate prompts');
    
    const { prompts } = JSON.parse(result);
    const promptText = prompts[0];
    
    console.log(`Generated Prompt: ${promptText}`);

    // 4. Generate Image using DALL-E 3 (for high quality base)
    console.log("Generating base image with DALL-E 3...");
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: promptText + " Cartoon style, vivid colors, high quality, cinematic lighting.",
      n: 1,
      size: "1792x1024", // Landscape
      response_format: "url",
    });

    const imageUrl = imageResponse.data?.[0]?.url;
    if (!imageUrl) throw new Error("Failed to generate base image from DALL-E 3");
    console.log("Base image generated:", imageUrl);

    // 5. Generate Video using RunwayML (Image to Video)
    console.log("Animating image with Runway Gen-3 Alpha Turbo...");
    
    // Poll for completion (waitForTaskOutput throws on failure)
    const finishedTask = await runwayClient.imageToVideo.create({
      model: 'gen3a_turbo',
      promptImage: imageUrl,
      promptText: promptText,
    }).waitForTaskOutput();
    
    console.log("Runway Task ID:", finishedTask.id);

    // output is usually an array of strings (URLs)
    const runwayVideoUrl = finishedTask.output[0];
    console.log("Runway Video URL:", runwayVideoUrl);

    // 6. Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(runwayVideoUrl, {
        folder: 'hkili_videos',
        resource_type: 'video',
    });

    const finalVideoUrl = uploadResult.secure_url;
    console.log("Final Video URL:", finalVideoUrl);

    return NextResponse.json({ success: true, videos: [finalVideoUrl], type: 'video' });

  } catch (error: any) {
    console.error('Video Generation Error:', error);
    // Provide more detailed error message if possible
    const errorMessage = error.message || 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
