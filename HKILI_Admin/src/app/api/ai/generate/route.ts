import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Story from '@/models/Story';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Category from '@/models/Category';
import Character from '@/models/Character';
import Prompt from '@/models/Prompt';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const DEFAULT_TEMPLATE = `Write a [CATEGORY] story set in [PLACE] in [LANGUAGE] language.

Main character(s): [MAIN_CHARACTER_NAMES]
Side character(s): [SIDE_CHARACTER_NAMES]
Moral of the story: [MORAL]

Make the story immersive, coherent, and end with the moral clearly reflected in the outcome.`;

const DEFAULT_SYSTEM = `You are a creative children's story writer. Write an engaging, age-appropriate story based on the user's prompt. 
Return a JSON object with the following fields:
- title: The title of the story
- content: The story text
- imagePrompts: An array of 3 highly descriptive English prompts for DALL-E to illustrate the beginning, middle, and end of this story. Each prompt should be 1-2 sentences.`;

function buildPrompt(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [key, val]) => t.replace(new RegExp(key.replace(/[\[\]]/g, '\\$&'), 'g'), val),
    template
  );
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const userId = decoded.userId;

    await dbConnect();

    const setting = await Setting.findOne();
    const storyCost = setting?.storyCost ?? 10;
    const apiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY;

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (user.role !== 'admin' && user.coins < storyCost) {
      return NextResponse.json({ success: false, error: 'Insufficient coins to generate story' }, { status: 403 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API Key is missing. Please add it in Admin Settings.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      language = 'EN',
      categoryId,
      mainCharacterIds,
      sideCharacterIds,
      place,
      moral,
      prompt: directPrompt,
    } = body;

    const languageNames: Record<string, string> = {
      'EN': 'English',
      'AR': 'Arabic',
      'FR': 'French'
    };
    const targetLanguage = languageNames[language] || 'English';

    let finalPrompt = directPrompt;
    let finalSystemMessage = DEFAULT_SYSTEM;
    let categoryName = '';
    let mainCharacterNames: string[] = [];
    let sideCharacterNames: string[] = [];

    if (categoryId && mainCharacterIds?.length > 0) {
      const [category, mainChars] = await Promise.all([
        Category.findById(categoryId),
        Character.find({ _id: { $in: mainCharacterIds } }),
      ]);

      categoryName = category?.name || 'General';
      mainCharacterNames = mainChars.map((c: any) => c.name);

      if (sideCharacterIds?.length > 0) {
        const sideChars = await Character.find({ _id: { $in: sideCharacterIds } });
        sideCharacterNames = sideChars.map((c: any) => c.name);
      }

      // Load active prompt template from DB, fall back to default
      const activePrompt = await Prompt.findOne({ isActive: true });
      const template = activePrompt?.template || DEFAULT_TEMPLATE;
      const systemTpl = activePrompt?.systemMessage || DEFAULT_SYSTEM;

      const vars: Record<string, string> = {
        '[CATEGORY]': categoryName,
        '[PLACE]': place || 'a magical land',
        '[MAIN_CHARACTER_NAMES]': mainCharacterNames.join(', '),
        '[SIDE_CHARACTER_NAMES]': sideCharacterNames.length > 0 ? sideCharacterNames.join(', ') : 'None',
        '[MORAL]': moral || 'No specific moral',
        '[LANGUAGE]': targetLanguage,
      };

      finalPrompt = buildPrompt(template, vars);
      // Force language in system message regardless of template to ensure output language is correct
      finalSystemMessage = `${buildPrompt(systemTpl, vars)}\n\nCRITICAL: THE "title" AND "content" FIELDS MUST BE IN ${targetLanguage.toUpperCase()}. THE "imagePrompts" MUST ALWAYS BE IN ENGLISH.`;
    }

    if (!finalPrompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // Log the prompts being sent to OpenAI for debugging
    console.log('Final System Message:', finalSystemMessage);
    console.log('Final Prompt:', finalPrompt);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: finalSystemMessage },
        { role: 'user', content: finalPrompt },
      ],
      model: 'gpt-4o-mini', // Much more reliable for JSON mode than 3.5-turbo
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('No content generated');

    const parsedResult = JSON.parse(result);
    const storyTitle = parsedResult.title || 'Untitled AI Story';
    const storyContent = parsedResult.content || '';
    const generatedImagePrompts = parsedResult.imagePrompts || [];

    console.log(`Story generated: ${storyTitle} in ${targetLanguage}`);

    // Generate 3 story-relevant images in parallel
    const finalImagePrompts = generatedImagePrompts.length >= 3 
      ? generatedImagePrompts.slice(0, 3).map((p: string) => `Children's storybook illustration: ${p}. Colorful, whimsical art style.`)
      : [
          `Children's storybook illustration, opening scene for a ${categoryName} story titled "${storyTitle}". Colorful, warm, friendly art style.`,
          `Children's storybook illustration, middle action scene from the story "${storyTitle}". Vibrant, expressive, whimsical art style.`,
          `Children's storybook illustration, heartwarming ending for "${storyTitle}". Warm, uplifting, colorful art style.`,
        ];

    console.log('Generating images with prompts:', finalImagePrompts);
    
    // Function to generate image with fallback
    const generateImageWithFallback = async (prompt: string, idx: number) => {
      try {
        console.log(`Attempting DALL-E 3 for image ${idx + 1}...`);
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        });
        console.log(`DALL-E 3 success for image ${idx + 1}`);
        return response.data?.[0]?.url || null;
      } catch (de3Error: any) {
        console.error(`DALL-E 3 failed for image ${idx + 1}:`, de3Error.message);
        
        try {
          console.log(`Attempting DALL-E 2 fallback for image ${idx + 1}...`);
          const response = await openai.images.generate({
            model: 'dall-e-2',
            prompt: prompt.substring(0, 400), // DALL-E 2 has shorter prompt limit
            n: 1,
            size: '1024x1024',
          });
          console.log(`DALL-E 2 fallback success for image ${idx + 1}`);
          return response.data?.[0]?.url || null;
        } catch (de2Error: any) {
          console.error(`DALL-E 2 fallback also failed for image ${idx + 1}:`, de2Error.message);
          return null;
        }
      }
    };

    const imageResults = await Promise.all(
      finalImagePrompts.map((prompt, idx) => generateImageWithFallback(prompt, idx))
    );

    const [img1, img2, img3] = imageResults;

    const newStory = await Story.create({
      title: storyTitle,
      content: storyContent,
      userId,
      genre: 'AI Generated',
      language,
      categoryId: categoryId || undefined,
      place: place || undefined,
      moral: moral || undefined,
      mainCharacters: mainCharacterNames,
      sideCharacters: sideCharacterNames,
      prompt: finalPrompt,
      image1: img1,
      image2: img2,
      image3: img3,
      createdAt: new Date(),
    });

    if (user.role !== 'admin') {
      user.coins -= storyCost;
      await user.save();
    }

    return NextResponse.json({ success: true, data: newStory, remainingCoins: user.coins });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    const errorMessage = error.message || 'Failed to generate story';
    const errorStack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.response?.data || error.cause || null,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}
