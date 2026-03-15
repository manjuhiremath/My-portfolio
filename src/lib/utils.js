export function fixUnsplashUrl(url) {
  if (!url || typeof url !== 'string') return '/placeholder-image.svg';
  
  // If it's already a direct Unsplash/Cloudinary image URL or a local path, return as is
  if (
    url.includes('images.unsplash.com') || 
    url.includes('plus.unsplash.com') || 
    url.includes('res.cloudinary.com') ||
    url.startsWith('/') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  // If it's a photo page URL like https://unsplash.com/photos/team-working-on-laptops-in-office-ikKwMKJ_9qM
  if (url.includes('unsplash.com')) {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      // Unsplash photo IDs are usually alphanumeric, e.g., 'ikKwMKJ_9qM'
      const id = lastPart.includes('-') ? lastPart.split('-').pop() : lastPart;
      
      // Standard Unsplash IDs are typically 11 chars or 12 chars
      if (id && id.length >= 10 && id.length <= 15) {
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200`;
      }
    } catch (e) {
      console.error('Error parsing Unsplash URL:', e);
    }
  }

  // Default to returning the original URL instead of forcing a placeholder
  // This allows browser to try loading it directly
  return url;
}

export function slugify(text = '') {
  if (!text) return '';
  const stringText = typeof text === 'string' ? text : String(text);
  return stringText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
