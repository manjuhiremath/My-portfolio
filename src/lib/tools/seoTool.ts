/**
 * Calculates a basic SEO score based on standard on-page SEO factors.
 */
export function calculateSeoScore(content: string, title: string, keywords: string[]): number {
  let score = 100;
  const contentLower = content.toLowerCase();

  // 1. Content Length Check
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 1500) {
    score -= 10;
  } else if (wordCount < 800) {
    score -= 20;
  }

  // 2. Keyword Presence
  let keywordMatches = 0;
  for (const keyword of keywords) {
    if (contentLower.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }
  const keywordRatio = keywords.length > 0 ? keywordMatches / keywords.length : 1;
  if (keywordRatio < 0.5) score -= 15;
  else if (keywordRatio < 1.0) score -= 5;

  // 3. Heading Structure
  const h1Count = (content.match(/^# /gm) || []).length;
  const h2Count = (content.match(/^## /gm) || []).length;
  
  if (h1Count === 0) score -= 10; // Missing H1
  if (h1Count > 1) score -= 5;    // Multiple H1s is often a minor penalty
  if (h2Count === 0) score -= 10; // Missing H2s

  // 4. Links and Media
  const hasLinks = /\[.+?\]\(.+?\)/.test(content);
  const hasImages = /!\[.+?\]\(.+?\)/.test(content);

  if (!hasLinks) score -= 10;
  if (!hasImages) score -= 10;

  return Math.max(0, Math.min(score, 100)); // Clamp between 0 and 100
}

export function extractKeywords(content: string): string[] {
  // Basic keyword extraction logic (mocked for simplicity)
  const words = content.toLowerCase().match(/\b(\w+)\b/g) || [];
  const freq: Record<string, number> = {};
  words.forEach(w => {
    if (w.length > 4) freq[w] = (freq[w] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}
