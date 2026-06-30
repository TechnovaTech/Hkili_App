import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
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

// Image model. Newer OpenAI project keys only have access to the `gpt-image-*`
// family — the legacy `dall-e-3`/`dall-e-2` models return "model does not exist".
// gpt-image-1 returns base64 (b64_json), NOT a URL, so generated images are
// uploaded to Cloudinary for permanent storage. Override via OPENAI_IMAGE_MODEL.
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a base64-encoded image to Cloudinary and return its permanent secure URL.
async function uploadBase64ToCloudinary(b64: string): Promise<string | null> {
  try {
    const buffer = Buffer.from(b64, 'base64');
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'hkili-app/stories', resource_type: 'image' },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded))
        )
        .end(buffer);
    });
    return result?.secure_url ?? null;
  } catch (e) {
    console.error('Cloudinary upload failed:', e);
    return null;
  }
}

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

    // Enforce a strict JSON output schema so the result is ALWAYS parseable,
    // regardless of the admin-managed prompt template. The story is stored as
    // an array of chapter "segments" and each chapter carries its own English
    // image prompt used to generate a per-chapter illustration.
    finalSystemMessage = `${finalSystemMessage}

CRITICAL OUTPUT FORMAT — return ONE valid JSON object with EXACTLY this shape and nothing else:
{
  "title": "overall story title",
  "chapters": [
    { "title": "chapter title", "content": "the full chapter text", "imagePrompt": "a detailed prompt describing this chapter's main scene for AI image generation" }
  ],
  "moral": "the moral of the story"
}
Rules:
- Use 3 to 5 chapters.
- "title" and every chapter "content" MUST be written in ${targetLanguage.toUpperCase()}.
- Every "imagePrompt" MUST be written in ENGLISH (image models perform better in English), even when the story is in another language.
- Do NOT output any text, markdown, or code fences outside the JSON object.`;

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

    // ---- Normalize the model output into an array of chapters ----
    // Tolerates: { chapters: [...] }, { content: { "Chapter 1": {...} } },
    // { content: [...] }, and plain-string content. This is what fixes the
    // "Cast to string failed for value {...}" error: content is no longer
    // saved as a raw object.
    type Chapter = { title?: string; content: string; imagePrompt?: string };
    const pick = (o: any, ...keys: string[]): string | undefined => {
      for (const k of keys) {
        if (o && typeof o[k] === 'string' && o[k].trim()) return o[k] as string;
      }
      return undefined;
    };
    const toChapter = (c: any): Chapter => ({
      title: pick(c, 'title', 'Chapter Title', 'chapterTitle'),
      content: pick(c, 'content', 'Chapter Content', 'chapterContent', 'text') ?? (typeof c === 'string' ? c : ''),
      imagePrompt: pick(c, 'imagePrompt', 'Image Prompt', 'image_prompt', 'imagePromptEn'),
    });

    let chapters: Chapter[] = [];
    if (Array.isArray(parsedResult.chapters)) {
      chapters = parsedResult.chapters.map(toChapter);
    } else if (parsedResult.content && typeof parsedResult.content === 'object' && !Array.isArray(parsedResult.content)) {
      chapters = Object.values(parsedResult.content).map(toChapter);
    } else if (Array.isArray(parsedResult.content)) {
      chapters = parsedResult.content.map(toChapter);
    }
    chapters = chapters.filter(c => c.content && c.content.trim());

    // Fallback: treat whatever we got as a single plain-text chapter.
    if (chapters.length === 0) {
      const text = typeof parsedResult.content === 'string'
        ? parsedResult.content
        : (parsedResult.content != null ? JSON.stringify(parsedResult.content) : result);
      chapters = [{ content: text }];
    }

    console.log(`Story generated: ${storyTitle} in ${targetLanguage} (${chapters.length} chapters)`);

    // ---- Generate one illustration per chapter (capped) from its image prompt ----
    const MAX_IMAGES = 5;
    const imageChapters = chapters.slice(0, MAX_IMAGES);
    const imageContext = `Category: ${categoryName}, Setting: ${place || 'magical land'}, Characters: ${mainCharacterNames.join(', ')}`;
    const imagePrompts = imageChapters.map((c, i) =>
      c.imagePrompt
        ? `Children's storybook illustration. ${c.imagePrompt}. ${imageContext}. Colorful, warm, friendly art style, high quality.`
        : `Children's storybook illustration for "${storyTitle}", scene ${i + 1}. ${imageContext}. Colorful, warm, friendly art style, high quality.`
    );

    console.log(`Generating ${imagePrompts.length} images with model "${IMAGE_MODEL}"`);
    const imageResults = await Promise.allSettled(
      imagePrompts.map(prompt =>
        openai.images.generate({
          model: IMAGE_MODEL,
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'medium', // gpt-image-1 quality: low | medium | high | auto
        })
      )
    );

    // gpt-image-1 returns base64 (b64_json) which we persist to Cloudinary.
    // Fall back to a returned URL if a model/key ever provides one directly.
    const chapterImageUrls = await Promise.all(
      imageResults.map(async (r, idx) => {
        if (r.status !== 'fulfilled') {
          console.error(`Image ${idx + 1} generation failed:`, r.reason?.message || r.reason);
          return null;
        }
        const datum = r.value.data?.[0];
        if (datum?.b64_json) return uploadBase64ToCloudinary(datum.b64_json);
        if (datum?.url) return datum.url;
        console.error(`Image ${idx + 1} returned no image data`);
        return null;
      })
    );

    // ---- Build the segment array the mobile app expects (content is a JSON string) ----
    const segments: { id: string; text: string; imageUrl?: string }[] = chapters.map((c, i) => ({
      id: String(i + 1),
      text: c.title ? `${c.title}\n\n${c.content}` : c.content,
      imageUrl: chapterImageUrls[i] || undefined,
    }));
    if (typeof parsedResult.moral === 'string' && parsedResult.moral.trim()) {
      segments.push({ id: String(segments.length + 1), text: parsedResult.moral.trim() });
    }
    const storyContent = JSON.stringify(segments);

    // The current mobile viewer renders up to three images (start / middle / end).
    const generatedImages = chapterImageUrls.filter((u): u is string => !!u);
    const img1 = generatedImages[0] ?? null;
    const img2 = generatedImages.length > 2
      ? generatedImages[Math.floor(generatedImages.length / 2)]
      : (generatedImages[1] ?? null);
    const img3 = generatedImages.length > 1 ? generatedImages[generatedImages.length - 1] : null;
    console.log('Final image URLs to be saved:', { count: generatedImages.length, img1, img2, img3 });

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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
