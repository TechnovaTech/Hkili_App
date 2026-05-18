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

const DEFAULT_SYSTEM = `You are a creative children's story writer. Write an engaging, age-appropriate story based on the user's prompt. Return JSON with 'title' and 'content' fields.`;

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
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
      finalSystemMessage = `${buildPrompt(systemTpl, vars)}\n\nCRITICAL: THE ENTIRE OUTPUT MUST BE IN ${targetLanguage.toUpperCase()}. THIS INCLUDES BOTH THE "title" AND THE "content" FIELDS. DO NOT USE ANY ENGLISH IN THE OUTPUT EXCEPT FOR THE JSON KEYS.`;
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
      model: 'gpt-3.5-turbo', // Use a more modern version of 3.5 that handles JSON better
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('No content generated');

    const parsedResult = JSON.parse(result);
    const storyTitle = parsedResult.title || 'Untitled AI Story';
    const storyContent = parsedResult.content || '';

    console.log(`Story generated: ${storyTitle} in ${targetLanguage}`);

    // Generate 3 story-relevant images in parallel using DALL-E
    // Use English for image prompts as DALL-E performs better with English
    // We include the category and characters to provide context even if the title is in another language
    const imageContext = `Category: ${categoryName}, Setting: ${place || 'magical land'}, Characters: ${mainCharacterNames.join(', ')}`;
    const imagePrompts = [
      `Children's storybook illustration, opening scene for a ${categoryName} story titled "${storyTitle}". ${imageContext}. Colorful, warm, friendly art style, high quality.`,
      `Children's storybook illustration, middle action scene from the story "${storyTitle}". ${imageContext}. Vibrant, expressive, whimsical art style, high quality.`,
      `Children's storybook illustration, heartwarming ending for "${storyTitle}". ${imageContext}, moral: ${moral || 'be kind'}. Warm, uplifting, colorful art style, high quality.`,
    ];

    console.log('Generating images with prompts:', imagePrompts);
    const imageResults = await Promise.allSettled(
      imagePrompts.map(prompt =>
        openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        })
      )
    );

    const [img1, img2, img3] = imageResults.map((r, idx) => {
      if (r.status === 'fulfilled') {
        const url = r.value.data?.[0]?.url ?? null;
        console.log(`Image ${idx + 1} generated successfully:`, url);
        return url;
      } else {
        console.error(`Image ${idx + 1} failed with reason:`, r.reason);
        return null;
      }
    });

    console.log('Final image URLs to be saved:', { img1, img2, img3 });

    const newStory = await Story.create({
      title: storyTitle,
      content: Array.isArray(storyContent) ? storyContent : [{ id: '1', text: storyContent }],
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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
