import { generateText } from '../tools/aiTool';

export interface BlogMetadata {
  slug: string;
  metaDescription: string;
  tags: string[];
  categories: string[];
}

export async function generateMetadata(title: string, content: string): Promise<BlogMetadata> {
  console.log(`[Metadata Agent] Generating metadata for: ${title}...`);

  const prompt = `
Generate metadata for the following blog post title.
Title: "${title}"

Return ONLY a JSON object with:
- slug: a URL friendly slug
- metaDescription: an SEO friendly description (max 160 chars)
- tags: array of 3-5 string tags
- categories: array of 1-2 string categories
  `;

  const response = await generateText(prompt, "You are an SEO metadata generator. Return ONLY valid JSON.");
  
  try {
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const metadata: BlogMetadata = JSON.parse(jsonStr);
    return metadata;
  } catch (error) {
    console.error('[Metadata Agent] Failed to parse metadata JSON, using fallbacks.', error);
    return {
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      metaDescription: `Read our latest post about ${title}. Discover tips, code examples, and best practices.`,
      tags: ['Development', 'Programming'],
      categories: ['Tech']
    };
  }
}
