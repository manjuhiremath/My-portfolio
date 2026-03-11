import { calculateSeoScore, extractKeywords } from '../tools/seoTool';
import { generateText } from '../tools/aiTool';
import { BlogDraft } from './blogWriterAgent';

export async function optimizeSeo(draft: BlogDraft, targetKeywords: string[]): Promise<BlogDraft> {
  console.log(`[SEO Agent] Optimizing SEO for: ${draft.title}...`);
  
  let currentContent = draft.content;
  let score = calculateSeoScore(currentContent, draft.title, targetKeywords);
  
  console.log(`[SEO Agent] Initial SEO Score: ${score}`);

  if (score < 90) {
    console.log('[SEO Agent] Score is below 90. Rewriting content to improve SEO...');
    
    const prompt = `
I have a blog post that needs better SEO optimization.
Target Keywords: ${targetKeywords.join(', ')}

Please improve the content to:
1. Naturally include the target keywords more frequently.
2. Ensure there are good H2 and H3 headings.
3. Expand the content if it's too short (aim for depth and value).
4. Add a FAQ section if it's missing.

Current Content:
${currentContent}
    `;

    const optimizedContent = await generateText(prompt, "You are a Master SEO Content Optimizer.");
    
    // Re-evaluate
    const newScore = calculateSeoScore(optimizedContent, draft.title, targetKeywords);
    console.log(`[SEO Agent] New SEO Score: ${newScore}`);
    
    return {
      title: draft.title,
      content: optimizedContent
    };
  }

  return draft;
}
