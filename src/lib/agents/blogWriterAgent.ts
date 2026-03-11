import { generateText } from '../tools/aiTool';

export interface BlogDraft {
  title: string;
  content: string;
}

export async function generateBlogPost(topic: string, context: string): Promise<BlogDraft> {
  console.log(`[Blog Writer Agent] Writing blog post for topic: ${topic}...`);

  const prompt = `
Write a comprehensive, SEO-optimized technical blog post about: "${topic}".
Context/Source Information: ${context}

Requirements:
- Target word count: 1500-2500 words.
- Use proper Markdown headings (H1 for title, H2, H3).
- Include practical code examples.
- Include a "Summary" or "Conclusion" at the end.
- Include a "Frequently Asked Questions (FAQ)" section.

Return ONLY the markdown content. The first line should be the H1 title.
  `;

  const content = await generateText(prompt, "You are an expert technical blogger and developer.");
  
  // Extract title (assume first line is H1)
  const lines = content.split('\n');
  let title = topic;
  if (lines[0].startsWith('# ')) {
    title = lines[0].replace('# ', '').trim();
  }

  return { title, content };
}
