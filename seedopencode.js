import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import slugify from 'slugify';
import OpenAI from 'openai';

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "stepfun/step-3.5-flash:free";

const KEYWORDS = [
  'Next.js performance optimization',
  'React best practices 2025',
  'MongoDB indexing strategies',
  'JavaScript memory management',
  'Node.js API security',
];

const SAMPLE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', alt: 'Code on computer screen' },
  { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', alt: 'Developer coding' },
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', alt: 'Laptop with code' },
];

async function run() {
  console.log('🚀 Starting OpenCode Blog Automation...');
  
  try {
    const { connectDB } = await import('./src/lib/mongodb.js');
    const { default: Blog } = await import('./src/models/Blog.js');

    await connectDB();

    const kw = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    console.log(`[1/4] Selected keyword: "${kw}"`);

    console.log(`[2/4] Generating SEO Outline...`);
    const outlineRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: `Create a detailed SEO blog outline for "${kw}". Return JSON ONLY: {title, sections: [{h2, points: []}], faqs: [{q, a}]}` }]
    });
    const outline = JSON.parse(outlineRes.choices[0].message.content.replace(/```json|```/g, '').trim());

    console.log(`[3/4] Generating Long-form Content (1500+ words)...`);
    const artRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert technical writer. Write in HTML format using h2, h3, p, ul, li tags. Natural keyword density 1.5%." },
        { role: "user", content: `Write a comprehensive 1500+ word article for: "${outline.title}" based on this outline: ${JSON.stringify(outline.sections)}. Include the keyword "${kw}" in the first paragraph.` }
      ]
    });
    const content = artRes.choices[0].message.content;

    console.log(`[4/4] Saving to MongoDB...`);
    const blog = new Blog({
      title: outline.title,
      slug: slugify(outline.title, { lower: true, strict: true }),
      content: content,
      featuredImage: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)].url,
      excerpt: content.replace(/<[^>]*>/g, '').substring(0, 160) + "...",
      category: "Technology",
      subcategory: "Open Source",
      tags: [kw, "Programming", "WebDev"],
      keywords: [kw],
      published: true,
      publishedAt: new Date()
    });

    await blog.save();
    console.log(`✅ Blog saved: ${blog.slug}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

run();
