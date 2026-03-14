import { cloudinary } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';
import Media from '@/models/Media';

export async function POST(req) {
  try {
    await connectDB();
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

    // Save to database
    const asset = await Media.create({
      title: file.name || 'Uploaded Asset',
      url: result.secure_url,
      public_id: result.public_id,
      sizeLabel: `${(file.size / 1024).toFixed(1)} KB`,
      type: 'Upload',
      mimeType: file.type,
      width: result.width,
      height: result.height,
    });

    return Response.json({
      success: true,
      url: asset.url,
      public_id: asset.public_id,
      asset: {
        id: asset._id,
        title: asset.title,
        url: asset.url,
        public_id: asset.public_id,
        updatedAt: asset.updatedAt,
        sizeLabel: asset.sizeLabel,
        type: asset.type,
      }
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
