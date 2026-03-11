import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(imageUrlOrBuffer: string, folder: string = 'blog_automation'): Promise<string | null> {
  try {
    if (!process.env.CLOUDINARY_API_KEY) {
      console.warn('[Cloudinary Tool] Missing API keys. Returning mock image URL.');
      return 'https://via.placeholder.com/800x400.png?text=Mock+Image';
    }

    const result = await cloudinary.uploader.upload(imageUrlOrBuffer, {
      folder,
      resource_type: 'image'
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary Tool] Error uploading image:', error);
    return null;
  }
}

export async function searchStockImage(query: string): Promise<string> {
  // In a real production system, this would call Unsplash API or Pexels.
  // We'll use a free image placeholder service that returns random images for the keyword.
  console.log(`[Cloudinary Tool] Searching stock image for: ${query}`);
  return `https://images.unsplash.com/featured/?${encodeURIComponent(query)}`;
}
