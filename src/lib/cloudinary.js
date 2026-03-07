import { v2 as cloudinary } from 'cloudinary';

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || 'dmn2neefw').trim().toLowerCase();

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isCloudinaryUrl(url) {
  if (!url) return false;
  return /res\.cloudinary\.com/i.test(url);
}

export async function normalizeFeaturedImageUrl(imageUrl, folder = 'blog-images') {
  if (!cloudName) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME in .env.local');
  }

  if (!imageUrl || typeof imageUrl !== 'string') return '';
  if (isCloudinaryUrl(imageUrl)) return imageUrl;

  const isHttp = /^https?:\/\//i.test(imageUrl);
  const isDataUri = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(imageUrl);

  if (!isHttp && !isDataUri) {
    return imageUrl;
  }

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: 'image',
  });

  return result.secure_url;
}

export { cloudinary };
