import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (e) {
      // Ignore if exists
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '') // Sanitize filename
    const ext = path.extname(originalName) || '.jpg' // Default extension if missing
    const filename = `category-${uniqueSuffix}${ext}`
    
    const filePath = path.join(uploadsDir, filename)
    await writeFile(filePath, buffer)
    
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
  }
}
