import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import ollama from 'ollama';
import slugify from 'slugify';
import OpenAI from 'openai';

const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL = "stepfun/step-3.5-flash:free";

const C = { r: "\x1b[0m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", magenta: "\x1b[35m", dim: "\x1b[90m", bold: "\x1b[1m" };
const log = {
  agent: (name, msg) => console.log(`${C.magenta}[${name}]${C.r} ${msg}`),
  ok:    (msg) => console.log(`${C.green}  ✔ ${msg}${C.r}`),
  info:  (msg) => console.log(`${C.cyan}  ℹ ${msg}${C.r}`),
  banner: (t)  => { console.log(); console.log(`${C.bold}${C.magenta}  ╔${"═".repeat(58)}╗${C.r}`); console.log(`${C.bold}${C.magenta}  ║  ${t.padEnd(56)}║${C.r}`); console.log(`${C.bold}${C.magenta}  ╚${"═".repeat(58)}╝${C.r}`); console.log(); },
};

async function main() {
  log.banner("🚀 SEEDANTIGRAVITY — Final Version");
  try {
    const { connectDB } = await import('./src/lib/mongodb.js');
    const { default: Blog } = await import('./src/models/Blog.js');

    await connectDB();

    log.agent("researchAgent", "Discovering keyword...");
    const kwRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: "Suggest one high-competition SEO keyword for Next.js. Return only keyword." }]
    });
    const kw = kwRes.choices[0].message.content.trim();

    log.agent("writerAgent", `Generating content for "${kw}"...`);
    const artRes = await ai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: `Write a long-form SEO blog (1500+ words) about "${kw}" in HTML. Include headers, FAQs, and conclusion.` }]
    });
    const content = artRes.choices[0].message.content;

    const doc = {
      title: kw,
      slug: slugify(kw, { lower: true, strict: true }),
      category: "Technology",
      subcategory: "Web Development",
      excerpt: content.replace(/<[^>]*>/g, '').substring(0, 160) + "...",
      content: content,
      published: true,
      publishedAt: new Date(),
    };

    const saved = await Blog.create(doc);
    log.ok(`Blog saved! _id: ${saved._id}`);
    log.banner("✅ GENERATION COMPLETE");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
