import { config } from 'dotenv';
config({ path: '.env.local' });

import axios from 'axios';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import mongoose from 'mongoose';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    'X-Title': 'SEO Blog Generator'
  }
});

const CONFIG = {
  MAX_CONCURRENT_SCRAPES: 3,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  REQUEST_TIMEOUT: 30000,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  TARGET_ARTICLE_LENGTH: 2500,
  MODEL: 'google/gemini-2.0-flash-001',
  TOPICS: [
    'Next.js development',
    'React performance optimization',
    'Node.js API security',
    'MongoDB best practices',
    'JavaScript design patterns',
    'TypeScript advanced features',
    'Docker for developers',
    'AWS deployment strategies',
    'GraphQL implementation',
    'Microservices architecture'
  ]
};

const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.log(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warning: (msg) => console.log(`[WARNING] ${new Date().toISOString()} - ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getKeyword() {
  logger.section('STEP 1: Keyword Discovery');
  
  try {
    const baseTopic = CONFIG.TOPICS[Math.floor(Math.random() * CONFIG.TOPICS.length)];
    const modifiers = ['complete guide', 'best practices', 'tutorial', 'step by step', '2026'];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    
    const prompt = `Generate 5 high-value SEO keywords for "${baseTopic}" with modifier "${modifier}".
    
Return JSON array with objects containing:
- keyword: the full keyword phrase
- searchVolume: estimated monthly searches (high/medium/low)
- competition: competition level (low/medium/high)
- intent: search intent (informational/commercial/transactional)

Return ONLY valid JSON array.`;

    const response = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [
        { role: 'system', content: 'You are an SEO expert. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    const keywords = JSON.parse(cleanContent);
    
    const bestKeyword = keywords
      .filter(k => k.searchVolume === 'high' || k.competition === 'medium')
      .sort((a, b) => (b.searchVolume === 'high' ? 1 : 0) - (a.searchVolume === 'high' ? 1 : 0))[0] || keywords[0];
    
    logger.success(`Selected keyword: "${bestKeyword.keyword}"`);
    
    return {
      keyword: bestKeyword.keyword,
      topic: baseTopic,
      intent: bestKeyword.intent,
      competition: bestKeyword.competition
    };
  } catch (error) {
    logger.error(`Keyword discovery failed: ${error.message}`);
    const fallback = {
      keyword: 'React Performance Optimization Complete Guide 2026',
      topic: 'React performance optimization',
      intent: 'informational',
      competition: 'medium'
    };
    logger.warning(`Using fallback: "${fallback.keyword}"`);
    return fallback;
  }
}

async function scrapeCompetitorPages(keyword) {
  logger.section('STEP 2: Scraping Competitor Pages (Simulated)');
  
  try {
    const prompt = `Research top ranking pages for keyword: "${keyword}".
    Summarize their H2 headings and structure.
    Return JSON ONLY with: {results: [{title, h2s: []}]}`;

    const response = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const data = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, '').trim());
    return data.results;
  } catch (error) {
    logger.error(`SERP scraping failed: ${error.message}`);
    return [];
  }
}

function extractHeadings(competitorData) {
  logger.section('STEP 3: Extracting Headings & Topics');
  
  const allH2s = competitorData.flatMap(c => c.h2s || []);
  
  if (allH2s.length === 0) {
    return {
      commonH2s: ['Introduction', 'Concepts', 'Guide', 'Best Practices', 'Conclusion'],
      uniqueH3s: [],
      topTopics: []
    };
  }

  return {
    commonH2s: allH2s.slice(0, 8),
    uniqueH3s: [],
    topTopics: []
  };
}

async function createOutline(keyword, headings) {
  logger.section('STEP 4: Creating Content Outline');
  
  try {
    const prompt = `Create article outline for: "${keyword.keyword}"
Return JSON: {title, h2Sections: [{title, h3Subsections: [], includeList: boolean}]}`;

    const response = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const outline = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, '').trim());
    return outline;
  } catch (error) {
    return { title: keyword.keyword, h2Sections: [{title: 'Introduction', h3Subsections: []}] };
  }
}

async function writeSEOArticle(keyword, outline) {
  logger.section('STEP 5: Writing SEO Article');
  let content = "";
  for (const section of outline.h2Sections) {
    const res = await openai.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: "user", content: `Write HTML for section "${section.title}" of article "${outline.title}" about "${keyword.keyword}". Use p, h2, h3 tags.` }]
    });
    content += res.choices[0].message.content + "\n\n";
  }
  return { title: outline.title, content };
}

async function main() {
  try {
    const { connectDB } = await import('./src/lib/mongodb.js');
    const { default: Blog } = await import('./src/models/Blog.js');
    const { default: Category } = await import('./src/models/Category.js');

    await connectDB();
    const keyword = await getKeyword();
    const competitorData = await scrapeCompetitorPages(keyword.keyword);
    const headings = extractHeadings(competitorData);
    const outline = await createOutline(keyword, headings);
    const article = await writeSEOArticle(keyword, outline);
    
    const blogData = {
      title: article.title,
      slug: slugify(article.title, { lower: true, strict: true }),
      category: 'Technology',
      subcategory: keyword.topic.split(' ')[0],
      excerpt: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      content: article.content,
      published: true,
      publishedAt: new Date(),
    };
    
    await Blog.create(blogData);
    logger.success(`Blog saved!`);
  } catch (error) {
    logger.error(`Workflow failed: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
