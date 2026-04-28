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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const prompt = await Prompt.findById(id);
  if (!prompt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: prompt });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const body = await request.json();

  // If activating this prompt, deactivate all others first
  if (body.isActive) {
    await Prompt.updateMany({ _id: { $ne: id } }, { isActive: false });
  }

  const prompt = await Prompt.findByIdAndUpdate(
    id,
    { ...body, updatedAt: new Date() },
    { new: true }
  );
  if (!prompt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: prompt });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbConnect();
  const prompt = await Prompt.findByIdAndDelete(id);
  if (!prompt) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
