import { connectDB } from '@/lib/mongodb';
import Media from '@/models/Media';

export async function GET(req) {
  try {
    await connectDB();
    const assets = await Media.find({}).sort({ createdAt: -1 });
    
    return Response.json({
      success: true,
      assets: assets.map(asset => ({
        id: asset._id,
        title: asset.title,
        url: asset.url,
        public_id: asset.public_id,
        updatedAt: asset.updatedAt,
        sizeLabel: asset.sizeLabel,
        type: asset.type,
      }))
    });
  } catch (error) {
    console.error('Fetch media error:', error);
    return Response.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
