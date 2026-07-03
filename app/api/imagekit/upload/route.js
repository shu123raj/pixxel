import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import { v2 as cloudinary } from 'cloudinary';

// ==========================================
// 1. ImageKit Setup (नॉर्मल अपलोड के लिए)
// ==========================================
let imagekit;
if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });
}

// ==========================================
// 2. Cloudinary Setup (AI Editing के लिए)
// ==========================================
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('[UPLOAD] ContentType:', contentType.substring(0, 40));

    // ======================================================
    // ✨ NAYA FIX: Direct Binary Upload (Bypasses FormData issues)
    // ======================================================
    if (contentType.startsWith('image/')) {
      if (!imagekit) return NextResponse.json({ success: false, error: 'ImageKit missing' }, { status: 500 });

      try {
        const searchParams = new URL(request.url).searchParams;
        const fileName = searchParams.get('fileName') || `upload-${Date.now()}.png`;

        // Direct stream ko buffer mein convert karna (No FormData needed)
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await imagekit.upload({
          file: buffer,
          fileName: fileName,
          folder: '/ai-editor-uploads',
          isPrivateFile: false,
        });

        return NextResponse.json({ 
          success: true, 
          url: uploadResult.url,
          resultUrl: uploadResult.url,
          thumbnailUrl: uploadResult.url,
          width: uploadResult.width || 800,
          height: uploadResult.height || 600
        }, { status: 200 });
      } catch (err) {
        console.error('[UPLOAD-ERROR]', err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
    }

    // ======================================================
    // Purana FormData Logic (Fallback)
    // ======================================================
    if (contentType.startsWith('multipart/form-data')) {
      if (!imagekit) return NextResponse.json({ success: false, error: 'ImageKit missing' }, { status: 500 });
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await imagekit.upload({
          file: buffer,
          fileName: file.name || `upload-${Date.now()}.png`,
          folder: '/ai-editor-uploads',
          isPrivateFile: false,
        });

        return NextResponse.json({ 
          success: true, url: uploadResult.url, resultUrl: uploadResult.url, thumbnailUrl: uploadResult.url, width: uploadResult.width || 800, height: uploadResult.height || 600
        }, { status: 200 });
      } catch (err) {
        console.error('[UPLOAD-ERROR]', err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
    }

    // ======================================================
    // JSON AI editing (Cloudinary)
    // ======================================================
    if (contentType.includes('application/json')) {
      let body = await request.json();
      // Yahan destructure me width, height aur gravity bhi add kiya hai
      const { image, type, erasePrompt, prompt, width, height, gravity } = body;

      if (!image) return NextResponse.json({ success: false, error: 'No image' }, { status: 400 });
      if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) return NextResponse.json({ success: false, error: 'Cloudinary missing' }, { status: 500 });

      const uploadResult = await cloudinary.uploader.upload(image, { folder: 'ai-editor-temp' });
      const publicId = uploadResult.public_id;
      let aiResultUrl = '';

      if (type === 'eraser') {
        if (!erasePrompt) return NextResponse.json({ success: false, error: 'No prompt' }, { status: 400 });
        aiResultUrl = cloudinary.url(publicId, { effect: `gen_remove:prompt_${erasePrompt}` });
      } 
      else if (type === 'gen-fill') {
        if (!prompt) return NextResponse.json({ success: false, error: 'No prompt' }, { status: 400 });
        aiResultUrl = cloudinary.url(publicId, { effect: `gen_background_replace:prompt_${prompt}` });
      } 
      // ======================================================
      // 🌟 NEW: AI Extend (Outpainting) Logic added here
      // ======================================================
      else if (type === 'extend') {
        if (!width || !height || !gravity) {
           return NextResponse.json({ success: false, error: 'Missing dimensions or gravity for extending' }, { status: 400 });
        }
        
        // Cloudinary me generative fill ki background mapping (Padding se)
        aiResultUrl = cloudinary.url(publicId, {
          width: width,
          height: height,
          crop: "pad", // Canvas ko bada karo 
          gravity: gravity, // Original image ko anchor karo (jaise left badhana hai toh gravity 'east' hogi)
          background: "gen_fill" // Baki khali jagah pe AI se fill karo
        });
      }
      else {
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
      }

      return NextResponse.json({ resultUrl: aiResultUrl }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: 'Bad content-type' }, { status: 400 });

  } catch (error) {
    console.error('[ERROR]', error.message);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}