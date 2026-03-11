import { NextRequest, NextResponse } from 'next/server';
import { withNoAuth } from '@/lib/middleware';
import { uploadFile, getFileUrl } from '@/lib/s3';

async function uploadImage(req: NextRequest, userId: string) {
  try {
    console.log('📤 Upload: Starting image upload for user:', userId);
    const data = await req.formData();
    const file: File | null = data.get('image') as unknown as File;

    console.log('📤 Upload: File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'null');

    if (!file) {
      console.log('❌ Upload: No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Upload: Invalid file type:', file.type);
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Upload: File too large:', file.size, 'bytes');
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('✅ Upload: File validation passed');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for S3
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `uploads/${timestamp}-${sanitizedFileName}`;

    console.log('📁 Upload: Uploading to S3 with key:', s3Key);

    // Upload file to S3
    await uploadFile(buffer, s3Key, file.type);

    // Get the public URL for the uploaded file
    const url = getFileUrl(s3Key);
    
    console.log('✅ Upload: File uploaded successfully to S3:', url);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export const POST = withNoAuth(uploadImage);
