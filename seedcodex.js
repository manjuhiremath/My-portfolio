import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import slugify from 'slugify';
import OpenAI from 'openai';

// We delay model and connection imports until after config() has run
async function run() {
  try {
    const { connectDB } = await import('./src/lib/mongodb.js');
    const { default: Blog } = await import('./src/models/Blog.js');

    const ai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const MODEL = "stepfun/step-3.5-flash:free";

    console.log('Discovering high-competition keyword...');
    const kwRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: "Suggest one high-competition, high-volume keyword for a technical SEO blog. Return only the keyword." }],
    });
    const kw = kwRes.choices[0].message.content.trim();

    console.log(`Building outline for: ${kw}...`);
    const outlineRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: `Create a detailed SEO outline for "${kw}". Include H2, H3, and FAQ sections. Return JSON ONLY: {title, sections: [{heading, level, subheadings: []}], faqs: [{q, a}]}` }],
    });
    const outline = JSON.parse(outlineRes.choices[0].message.content.replace(/```json|```/g, '').trim());

    console.log(`Generating 2500+ word article...`);
    const articleRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ 
        role: "system", 
        content: "You are an elite SEO content creator. You write authoritative, long-form guides (2500+ words) using HTML tags (h2, h3, p, ul, li). Ensure keyword placement is natural but effective (1-2%)." 
      }, {
        role: "user",
        content: `Write a comprehensive guide for "${kw}" based on this outline: ${JSON.stringify(outline)}. Include the keyword in the first paragraph and several headers.`
      }]
    });
    const content = articleRes.choices[0].message.content;

    console.log("Saving to database...");
    await connectDB();
    
    const blog = new Blog({
      title: outline.title || kw,
      slug: slugify(outline.title || kw, { lower: true, strict: true }),
      content: content,
      excerpt: content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      category: "Technology",
      subcategory: "Software Development",
      tags: [kw, "SEO", "Guide"],
      keywords: [kw],
      seoTitle: outline.title,
      seoDescription: `Comprehensive guide about ${kw}. Read more to learn best practices and advanced techniques.`,
      published: true,
      publishedAt: new Date()
    });

    await blog.save();
    console.log(`✅ Blog saved: ${blog.slug}`);
  } catch (e) {
    console.error(e);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

run();
