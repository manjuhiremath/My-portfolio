import { scrapeHackerNews } from '../tools/scraperTool';
import { generateText } from '../tools/aiTool';

export interface TrendingTopic {
  topic: string;
  keywords: string[];
  searchVolume: string; // e.g. "High", "Medium"
}

export async function findTrendingTopics(): Promise<TrendingTopic[]> {
  console.log('[Trending Agent] Finding trending topics...');
  
  // 1. Scrape data sources
  const hnStories = await scrapeHackerNews();
  const storyTitles = hnStories.map(s => s.title).join('\n');

  // 2. Use AI to analyze and extract top 10 trends
  const prompt = `
Analyze the following top tech stories and identify the 10 best trending topics for a developer blog.
Format the output EXACTLY as a JSON array of objects with "topic", "keywords" (array of strings), and "searchVolume" (string: High/Medium/Low).

Stories:
${storyTitles}
  `;

  const aiResponse = await generateText(prompt, "You are a technical SEO analyst. Return ONLY valid JSON.");
  
  try {
    const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const topics: TrendingTopic[] = JSON.parse(jsonStr);
    return topics.slice(0, 10);
  } catch (error) {
    console.error('[Trending Agent] Failed to parse AI response into JSON:', error);
    return [];
  }
}
