import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const folder = 'hkili-app';
    
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder,
    }, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    })
  } catch (error) {
    console.error('Error signing Cloudinary request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
