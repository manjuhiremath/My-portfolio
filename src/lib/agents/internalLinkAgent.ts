import { getAllBlogs } from '../tools/dbTool';

export async function injectInternalLinks(content: string, currentTitle: string): Promise<string> {
  console.log(`[Internal Link Agent] Scanning for internal linking opportunities...`);

  // Fetch all published blogs to map potential keywords to URLs
  const blogs = await getAllBlogs();
  if (blogs.length === 0) return content;

  let modifiedContent = content;
  let linksAdded = 0;

  for (const blog of blogs) {
    if (blog.title === currentTitle || linksAdded >= 3) continue; // Max 3 internal links

    // Use the blog's primary keyword or title as anchor text
    // A simplistic exact match replacement for demonstration:
    const targetPhrase = blog.tags && blog.tags.length > 0 ? blog.tags[0] : blog.title.split(' ')[0];
    
    const regex = new RegExp(`\\b(${targetPhrase})\\b`, 'i');
    
    if (regex.test(modifiedContent) && !modifiedContent.includes(blog.slug)) {
      modifiedContent = modifiedContent.replace(
        regex, 
        `[$1](/blog/${blog.slug})`
      );
      linksAdded++;
    }
  }

  console.log(`[Internal Link Agent] Added ${linksAdded} internal links.`);
  return modifiedContent;
}
