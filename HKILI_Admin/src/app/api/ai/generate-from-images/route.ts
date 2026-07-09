import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Story from '@/models/Story';
import User from '@/models/User';
import Setting from '@/models/Setting';
import Category from '@/models/Category';
import Character from '@/models/Character';
import dbConnect from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

// Vision-capable model. The user supplies 3-5 illustration images and we write
// ONE section of story per image, in order, so text and pictures line up.
// No image generation happens here — the images come from the user.
const VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o';

export const maxDuration = 60;

const languageNames: Record<string, string> = {
  EN: 'English',
  AR: 'Arabic',
  FR: 'French',
};

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
      images,
      description,
      categoryId,
      mainCharacterIds,
      place,
      moral,
    } = body;

    // Validate the provided images (3-5 expected, but we tolerate 1-5).
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'Please provide 1 to 5 images' }, { status: 400 });
    }
    const imageUrls: string[] = images
      .slice(0, 5)
      .filter((u: any) => typeof u === 'string' && u.trim());
    if (imageUrls.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid image URLs provided' }, { status: 400 });
    }

    const targetLanguage = languageNames[language] || 'English';

    // Optional story context (category + main characters).
    let categoryName = '';
    let mainCharacterNames: string[] = [];
    if (categoryId) {
      const category = await Category.findById(categoryId).catch(() => null);
      categoryName = category?.name || '';
    }
    if (Array.isArray(mainCharacterIds) && mainCharacterIds.length > 0) {
      const chars = await Character.find({ _id: { $in: mainCharacterIds } });
      mainCharacterNames = chars.map((c: any) => c.name);
    }

    const n = imageUrls.length;

    const systemMessage = `You are a creative children's story writer. The user provides ${n} illustration image(s) IN ORDER${description ? ', plus a short description' : ''}. Write ONE cohesive, age-appropriate children's story with EXACTLY ${n} sections: section 1 corresponds to image 1, section 2 to image 2, and so on, in the given order. Each section MUST describe what is happening in its matching image, so the words and the picture agree.
${categoryName ? `Theme / category: ${categoryName}.` : ''}
${mainCharacterNames.length ? `Main character(s): ${mainCharacterNames.join(', ')}.` : ''}
${place ? `Setting / place: ${place}.` : ''}
${moral ? `Moral of the story: ${moral}.` : ''}

CRITICAL RULES:
- Write EVERYTHING (title and every section) in ${targetLanguage.toUpperCase()}. Do NOT use any other language except for the JSON keys.
- Return ONE valid JSON object with EXACTLY this shape and nothing else:
{"title":"overall title","sections":[{"content":"the section text"}],"moral":"the moral"}
- The "sections" array MUST have EXACTLY ${n} items, in the same order as the images.
- Do NOT output any text, markdown, or code fences outside the JSON object.`;

    // Build a multimodal user message: description + each image labelled in order.
    const userContent: any[] = [
      {
        type: 'text',
        text: description
          ? `Description: ${description}\n\nHere are the ${n} images in order:`
          : `Here are the ${n} images in order. Write the story that matches them:`,
      },
    ];
    imageUrls.forEach((url, i) => {
      userContent.push({ type: 'text', text: `Image ${i + 1}:` });
      userContent.push({ type: 'image_url', image_url: { url } });
    });

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userContent as any },
      ],
    });

    const result = completion.choices[0].message.content;
    if (!result) throw new Error('No content generated');

    const parsed = JSON.parse(result);
    const storyTitle = parsed.title || 'Untitled Story';

    // Normalize the sections into an array of strings.
    const pickText = (s: any): string =>
      typeof s === 'string' ? s : (s?.content || s?.text || '');
    let sections: string[] = [];
    if (Array.isArray(parsed.sections)) {
      sections = parsed.sections.map(pickText).filter(Boolean);
    } else if (Array.isArray(parsed.content)) {
      sections = parsed.content.map(pickText).filter(Boolean);
    } else if (typeof parsed.content === 'string') {
      sections = [parsed.content];
    }
    if (sections.length === 0) sections = [result];

    // One segment per image (in order), each carrying its user-provided image.
    const segments: { id: string; text: string; imageUrl?: string }[] = imageUrls.map((url, i) => ({
      id: String(i + 1),
      text: sections[i] || sections[sections.length - 1] || '',
      imageUrl: url,
    }));
    // Any extra sections beyond the image count are appended as text-only.
    for (let i = imageUrls.length; i < sections.length; i++) {
      segments.push({ id: String(i + 1), text: sections[i] });
    }
    if (typeof parsed.moral === 'string' && parsed.moral.trim()) {
      segments.push({ id: String(segments.length + 1), text: parsed.moral.trim() });
    }

    const storyContent = JSON.stringify(segments);

    const newStory = await Story.create({
      title: storyTitle,
      content: storyContent,
      userId,
      genre: 'AI Generated (from images)',
      language,
      categoryId: categoryId || undefined,
      place: place || undefined,
      moral: moral || undefined,
      mainCharacters: mainCharacterNames,
      prompt: description || 'Generated from user-provided images',
      image1: imageUrls[0] || null,
      image2: imageUrls[Math.floor(imageUrls.length / 2)] || null,
      image3: imageUrls[imageUrls.length - 1] || null,
      createdAt: new Date(),
    });

    if (user.role !== 'admin') {
      user.coins -= storyCost;
      await user.save();
    }

    return NextResponse.json({ success: true, data: newStory, remainingCoins: user.coins });
  } catch (error: any) {
    console.error('AI Generate-from-images Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate story from images' },
      { status: 500 }
    );
  }
}
