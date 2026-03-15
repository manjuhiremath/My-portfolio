export function fixUnsplashUrl(url) {
  if (!url) return '/placeholder-image.svg';
  
  // If it's already a direct Unsplash image URL or a local path, return as is
  if (url.includes('images.unsplash.com') || url.startsWith('/')) {
    return url;
  }

  // If it's a photo page URL like https://unsplash.com/photos/team-working-on-laptops-in-office-ikKwMKJ_9qM
  // Try to extract the ID (last part of the URL)
  if (url.includes('unsplash.com')) {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      // Unsplash photo IDs are usually alphanumeric, e.g., 'ikKwMKJ_9qM'
      // If it's a full slug, the ID is typically the last part after the hyphen
      const id = lastPart.includes('-') ? lastPart.split('-').pop() : lastPart;
      
      if (id && id.length >= 5) {
        return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=1200`;
      }
    } catch (e) {
      console.error('Error parsing Unsplash URL:', e);
    }
  }

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
