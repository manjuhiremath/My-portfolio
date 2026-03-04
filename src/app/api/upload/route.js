import { cloudinary } from '@/lib/cloudinary';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'blog-images',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return Response.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = String(error?.message || '');
    if (message.toLowerCase().includes('cloud_name')) {
      return Response.json(
        { error: 'Invalid Cloudinary config. Update CLOUDINARY_CLOUD_NAME in .env.local (use your real Cloudinary cloud name).' },
        { status: 500 }
      );
    }
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
