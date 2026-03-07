export function fixUnsplashUrl(url) {
  if (!url) return '/placeholder-image.svg';
  
  // If it's already a direct Unsplash image URL or a local path, return as is
  if (url.includes('images.unsplash.com') || url.startsWith('/')) {
    return url;
  }

  // If it's a photo page URL like https://unsplash.com/photos/team-working-on-laptops-in-office-ikKwMKJ_9qM
  // We can't reliably construct an images.unsplash.com URL from the slug.
  // Unsplash direct image URLs use a different ID format (e.g., photo-1504384308090-c894fdcc538d)
  // that doesn't match the page slug format. Fall back to placeholder.
  if (url.includes('unsplash.com/photos/') || url.includes('unsplash.com')) {
    return '/placeholder-image.svg';
  }

  return url;
}

export function slugify(text = '') {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
