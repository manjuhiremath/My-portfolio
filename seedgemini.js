import { config } from 'dotenv';
import mongoose from 'mongoose';
import Blog from './src/models/Blog.js';
import slugify from 'slugify';

config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!GEMINI_API_KEY && !OPENROUTER_API_KEY) {
  console.error('Please define GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local');
  process.exit(1);
}

/**
 * Universal AI caller using fetch
 */
async function callGemini(prompt) {
  if (GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(`Gemini API Error: ${data.error.message}`);
    return data.candidates[0].content.parts[0].text;
  } else {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "stepfun/step-3.5-flash:free",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) {
      console.error('Full OpenRouter Error:', JSON.stringify(data.error, null, 2));
      throw new Error(`OpenRouter Error: ${data.error.message}`);
    }
    return data.choices[0].message.content;
  }
}

/**
 * 1. Find a high-competition keyword related to a topic
 */
async function discoverKeyword(topic = "Web Development") {
  console.log(`Discovering high-competition keyword for: ${topic}...`);
  const prompt = `Suggest a single high-competition, high-volume SEO keyword related to "${topic}". 
  Return only the keyword string, nothing else.`;
  
  const keyword = await callGemini(prompt);
  return keyword.trim().replace(/"/g, '');
}

/**
 * 2 & 3. Scrape and Extract competitor info
 * Since we don't have a Search API, we use Gemini to simulate the research 
 * of top-ranking articles for the given keyword.
 */
async function scrapeResults(keyword) {
  console.log(`Analyzing top search results for: ${keyword}...`);
  const prompt = `Research the top 3 ranking articles for the keyword "${keyword}".
  Provide a detailed summary of their:
  - Titles
  - Heading structures (H1, H2, H3)
  - Common FAQ questions
  - Visual elements used (images, videos)
  
  Format the output as a JSON object with fields: articles (array of {title, headings, faqs}), commonImages, commonVideos.`;
  
  const research = await callGemini(prompt + "\nReturn ONLY JSON.");
  try {
    // Basic cleanup in case of markdown blocks
    const jsonStr = research.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("Failed to parse research JSON, using raw text.");
    return { raw: research };
  }
}

/**
 * 4. Analyze structure and build a better outline
 */
async function buildOutline(keyword, research) {
  console.log(`Building optimized SEO outline for: ${keyword}...`);
  const prompt = `Based on this competitor research for "${keyword}":
  ${JSON.stringify(research)}
  
  Create a superior SEO article outline that is more comprehensive and better structured.
  Requirements:
  - Catchy SEO Title (with keyword)
  - Introduction (mention keyword)
  - 8-12 Heading sections (H2, H3)
  - Dedicated FAQ section
  - Conclusion
  
  Return ONLY the outline as a JSON object with fields: title, sections (array of {heading, level, points}).`;
  
  const outline = await callGemini(prompt + "\nReturn ONLY JSON.");
  const jsonStr = outline.replace(/```json|```/g, '').trim();
  return JSON.parse(jsonStr);
}

/**
 * 5. Generate a better SEO article (2000–3000 words)
 */
async function generateArticle(keyword, outline) {
  console.log(`Generating comprehensive SEO article (Target: 2000-3000 words)...`);
  
  // We'll generate in chunks if needed, but Gemini 1.5 Flash has a large output window.
  const prompt = `Write a professional, SEO-optimized blog article based on this outline:
  ${JSON.stringify(outline)}
  
  SEO Requirements:
  - Target Keyword: "${keyword}"
  - Title: ${outline.title}
  - Word count: 2000-3000 words.
  - Keyword in the first paragraph.
  - Keyword density around 1-2%.
  - Use HTML tags for formatting (<h2>, <h3>, <p>, <ul>, <li>).
  - Add a "Frequently Asked Questions" section at the end.
  - Add a final "Conclusion" section.
  
  Make it engaging, authoritative, and helpful.`;
  
  return await callGemini(prompt);
}

/**
 * 6 & 7. Insert images and Embed videos
 */
async function attachMedia(content, keyword) {
  console.log("Attaching media elements...");
  const prompt = `Given this article content for "${keyword}":
  ${content.substring(0, 1000)}...
  
  1. Find 2 relevant high-quality Unsplash image URLs related to the content.
     IMPORTANT: Return DIRECT image URLs from images.unsplash.com, NOT photo page links.
     Format: https://images.unsplash.com/photo-1234567890?w=1200&auto=format&fit=crop
  2. Find 1 relevant YouTube tutorial video ID.
  
  Return ONLY a JSON object with: 
  - images: array of {url, alt}
  - videoId: string (the ID only)`;
  
  const mediaRaw = await callGemini(prompt + "\nReturn ONLY JSON.");
  try {
    const media = JSON.parse(mediaRaw.replace(/```json|```/g, '').trim());
    
    let updatedContent = content;
    
    // Insert first image after intro (first <h2>)
    if (media.images && media.images[0]) {
      const imgHtml = `<figure class="my-8"><img src="${media.images[0].url}" alt="${media.images[0].alt}" class="rounded-lg shadow-lg w-full" /><figcaption class="text-center text-sm text-gray-500 mt-2">${media.images[0].alt}</figcaption></figure>`;
      updatedContent = updatedContent.replace(/<\/h2>/, `</h2>\n${imgHtml}`);
    }
    
    // Insert video before FAQ or Conclusion
    if (media.videoId) {
      const videoHtml = `<div class="my-10 aspect-video"><iframe src="https://www.youtube.com/embed/${media.videoId}" class="w-full h-full rounded-xl" frameborder="0" allowfullscreen></iframe></div>`;
      if (updatedContent.includes('<h2>Frequently Asked Questions')) {
        updatedContent = updatedContent.replace(/<h2>Frequently Asked Questions/, `${videoHtml}\n<h2>Frequently Asked Questions`);
      } else {
        updatedContent = updatedContent.replace(/<h2>Conclusion/, `${videoHtml}\n<h2>Conclusion`);
      }
    }

    return { content: updatedContent, featuredImage: media.images?.[0]?.url || '' };
  } catch (e) {
    console.warn("Media attachment failed, using original content.");
    return { content, featuredImage: '' };
  }
}

/**
 * 8. Generate SEO metadata and save to MongoDB
 */
async function saveBlog(keyword, article, outline) {
  console.log("Saving blog to database...");
  
  const prompt = `Generate SEO metadata for an article about "${keyword}".
  Title: ${outline.title}
  
  Return ONLY JSON with:
  - excerpt (approx 150 chars)
  - seoTitle (max 60 chars)
  - seoDescription (max 160 chars)
  - tags (array of 5 strings)
  - category (one of: Technology, Design, Business, Science)
  - subcategory (relevant sub-niche)`;
  
  const metaRaw = await callGemini(prompt + "\nReturn ONLY JSON.");
  const meta = JSON.parse(metaRaw.replace(/```json|```/g, '').trim());

  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const blogData = {
    title: outline.title,
    slug: slugify(outline.title, { lower: true, strict: true }),
    content: article.content,
    featuredImage: article.featuredImage,
    excerpt: meta.excerpt,
    category: meta.category,
    subcategory: meta.subcategory,
    tags: meta.tags,
    keywords: [keyword, ...meta.tags],
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    published: true,
    publishedAt: new Date(),
  };

  const newBlog = new Blog(blogData);
  await newBlog.save();
  
  console.log(`\n✅ Blog successfully created and saved!`);
  console.log(`Title: ${blogData.title}`);
  console.log(`Slug: ${blogData.slug}`);
  console.log(`Category: ${blogData.category} > ${blogData.subcategory}`);
}

/**
 * Main execution
 */
async function run() {
  try {
    console.log("🚀 Starting Gemini Blog Automation...");
    
    const keyword = await discoverKeyword();
    const research = await scrapeResults(keyword);
    const outline = await buildOutline(keyword, research);
    const rawArticle = await generateArticle(keyword, outline);
    const finalArticle = await attachMedia(rawArticle, keyword);
    
    await saveBlog(keyword, finalArticle, outline);
    
    console.log("\n✨ Automation Complete!");
  } catch (error) {
    console.error("\n❌ Automation Failed:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

run();
