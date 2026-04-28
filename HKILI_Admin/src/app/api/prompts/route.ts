import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Prompt from '@/models/Prompt';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const prompts = await Prompt.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: prompts });
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const { name, template, systemMessage, isActive } = body;

  if (!name || !template || !systemMessage) {
    return NextResponse.json({ success: false, error: 'name, template and systemMessage are required' }, { status: 400 });
  }

  // If setting this as active, deactivate all others
  if (isActive) {
    await Prompt.updateMany({}, { isActive: false });
  }

  const prompt = await Prompt.create({ name, template, systemMessage, isActive: !!isActive });
  return NextResponse.json({ success: true, data: prompt }, { status: 201 });
}
