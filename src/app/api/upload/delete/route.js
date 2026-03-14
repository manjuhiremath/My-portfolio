import { cloudinary } from '@/lib/cloudinary';
import { connectDB } from '@/lib/mongodb';
import Media from '@/models/Media';

export async function POST(req) {
  try {
    await connectDB();
    const { public_id } = await req.json();

    if (!public_id) {
      return Response.json({ error: 'Public ID is required' }, { status: 400 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    // Delete from Database (even if Cloudinary says not found, we want to clean up our DB)
    await Media.deleteOne({ public_id });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
