const HEADING_REGEX = /<h[1-6][^>]*>/gi;
const WORD_REGEX = /\S+/g;

export function stripHtml(input = '') {
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getWordCount(input = '') {
  const normalized = stripHtml(input);
  const matches = normalized.match(WORD_REGEX);
  return matches ? matches.length : 0;
}

function hasInRange(length, min, max) {
  return length >= min && length <= max;
}

export function keywordCoverage(input = '', keywords = []) {
  if (!keywords.length) return 0;
  const lowered = stripHtml(input).toLowerCase();
  let matches = 0;
  for (const keyword of keywords) {
    const token = String(keyword || '').trim().toLowerCase();
    if (!token) continue;
    if (lowered.includes(token)) matches += 1;
  }
  return matches / keywords.length;
}

export function calculateReadabilityScore(content = '') {
  const plain = stripHtml(content);
  if (!plain) return 0;

  const sentences = Math.max(
    1,
    plain
      .split(/[.!?]+/)
      .map((item) => item.trim())
      .filter(Boolean).length
  );
  const words = Math.max(1, getWordCount(plain));
  const averageWordsPerSentence = words / sentences;

  if (averageWordsPerSentence <= 16) return 92;
  if (averageWordsPerSentence <= 20) return 78;
  if (averageWordsPerSentence <= 26) return 62;
  return 46;
}

export function calculateBlogSeoScore(blog = {}) {
  const title = String(blog.title || '');
  const seoTitle = String(blog.seoTitle || '');
  const seoDescription = String(blog.seoDescription || '');
  const excerpt = String(blog.excerpt || '');
  const content = String(blog.content || '');
  const keywords = [
    ...(Array.isArray(blog.keywords) ? blog.keywords : []),
    ...(Array.isArray(blog.tags) ? blog.tags : []),
  ].filter(Boolean);

  let score = 0;

  if (hasInRange(title.length, 25, 70)) score += 16;
  if (hasInRange(seoTitle.length, 30, 60)) score += 16;
  if (hasInRange(seoDescription.length, 120, 170)) score += 16;
  if (hasInRange(excerpt.length, 90, 260)) score += 10;

  const headings = (content.match(HEADING_REGEX) || []).length;
  if (headings >= 3) score += 10;
  else if (headings > 0) score += 6;

  const words = getWordCount(content);
  if (words >= 1200) score += 16;
  else if (words >= 700) score += 12;
  else if (words >= 400) score += 8;

  const coverage = keywordCoverage(content, keywords);
  if (coverage >= 0.65) score += 16;
  else if (coverage >= 0.35) score += 10;
  else if (coverage > 0) score += 6;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getSeoScoreBucket(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Poor';
}

