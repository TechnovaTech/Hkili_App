import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import RunwayML from '@runwayml/sdk';
import Setting from '@/models/Setting';
import dbConnect from '@/lib/mongodb';

// Allow up to 60 seconds for video generation (if supported by platform)
export const maxDuration = 60;

// Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// RunwayML client is initialized lazily inside the handler to avoid build-time errors

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }
    
    await dbConnect();

    // Fetch Settings
    const setting = await Setting.findOne();
    const apiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY;

    // 2. Parse Request
    const { storyContent } = await request.json();

    if (!storyContent) {
      return NextResponse.json(
        { success: false, error: 'Story content is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API Key is missing. Please add it in Admin Settings or .env file.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    
    // Check Runway API Key
    const runwayApiKey = process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY;
    if (!runwayApiKey) {
      return NextResponse.json(
        { success: false, error: 'RUNWAYML_API_SECRET is missing. Please add it to .env' },
        { status: 500 }
      );
    }
    const runwayClient = new RunwayML({ apiKey: runwayApiKey });

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

    // 4. Generate base image. Newer OpenAI keys only have the gpt-image-* family
    // (legacy dall-e-3 returns "model does not exist"). gpt-image-1 returns base64,
    // so we upload it to Cloudinary to obtain a public URL for RunwayML.
    const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
    console.log(`Generating base image with ${imageModel}...`);
    const imageResponse = await openai.images.generate({
      model: imageModel,
      prompt: promptText + " Cartoon style, vivid colors, high quality, cinematic lighting.",
      n: 1,
      size: "1536x1024", // Landscape (gpt-image-1 supported size)
      quality: "high",
    });

    const baseImage = imageResponse.data?.[0];
    let imageUrl = baseImage?.url ?? null;
    if (!imageUrl && baseImage?.b64_json) {
      const buffer = Buffer.from(baseImage.b64_json, 'base64');
      const uploaded: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: 'hkili_videos/base', resource_type: 'image' },
            (error, result) => (error ? reject(error) : resolve(result))
          )
          .end(buffer);
      });
      imageUrl = uploaded?.secure_url ?? null;
    }
    if (!imageUrl) throw new Error(`Failed to generate base image from ${imageModel}`);
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
