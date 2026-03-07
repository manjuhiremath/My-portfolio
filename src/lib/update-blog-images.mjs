import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const updates = [
  {
    slug: "global-conflict-economy-2026-impact-analysis",
    featuredImage: "https://images.unsplash.com/photo-1611974714851-48206138d731?auto=format&fit=crop&q=80&w=1200",
    content_updates: [
      { 
        marker: "[IMAGE: global conflict impact on energy markets 2026 chart]", 
        replacement: '<div class="my-8"><img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800" alt="Global energy trade disruption 2026" class="rounded-xl w-full h-auto shadow-lg" /><p class="text-center text-xs text-slate-500 mt-2">Visual representation of maritime logistics pressure in early 2026.</p></div>' 
      },
      {
        marker: "[INFOGRAPHIC: AI productivity gains vs conflict-driven costs 2026]",
        replacement: '<div class="my-8 bg-slate-50 p-6 rounded-xl border border-slate-200"><h4 class="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Productivity Delta 2026</h4><div class="space-y-4 text-xs"><div class="flex justify-between"><span>AI Optimization (Automation)</span><span class="text-emerald-600 font-bold">+12%</span></div><div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 w-[12%] animate-pulse"></div></div><div class="flex justify-between"><span>Energy Cost Spike (Conflict)</span><span class="text-rose-600 font-bold">+15%</span></div><div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div class="h-full bg-rose-500 w-[15%]"></div></div></div></div>'
      }
    ]
  },
  {
    slug: "t20-world-cup-2026-schedule-venues-teams-guide",
    featuredImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=1200",
    content_updates: [
      {
        marker: "[IMAGE: T20 World Cup 2026 venue map India and Sri Lanka]",
        replacement: '<div class="my-8"><img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800" alt="Cricket Stadium Atmosphere 2026" class="rounded-xl w-full h-auto shadow-lg" /><p class="text-center text-xs text-slate-500 mt-2">Fans prepare for the expanded 20-team format across India and Sri Lanka.</p></div>'
      },
      {
        marker: "[IMAGE: India vs Pakistan 2026 match promo poster]",
        replacement: '<div class="my-8 relative overflow-hidden rounded-xl aspect-video bg-indigo-900 flex items-center justify-center text-white"><div class="absolute inset-0 opacity-30 bg-[url(\'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800\')] bg-cover"></div><div class="relative z-10 text-center"><h4 class="text-2xl font-bold italic tracking-tighter mb-1">THE MOTHER OF ALL BATTLES</h4><div class="flex items-center gap-4 text-4xl font-black tracking-widest"><span class="text-blue-400">IND</span><span class="text-xl text-white/50">VS</span><span class="text-emerald-400">PAK</span></div><p class="mt-4 text-sm font-bold bg-white text-indigo-900 px-4 py-1 rounded-full uppercase">Feb 15, 2026 • Colombo</p></div></div>'
      }
    ]
  },
  {
    slug: "global-politics-policy-trends-2026-ai-tariffs",
    featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
    content_updates: [
      {
        marker: "[INFOGRAPHIC: Global tariff comparison 2024 vs 2026]",
        replacement: '<div class="my-8 bg-white p-6 rounded-xl border border-indigo-100 shadow-sm"><h4 class="text-sm font-bold text-slate-900 mb-4">Effective Tariff Rates: US Import Surge</h4><div class="space-y-4 text-[10px] uppercase font-bold text-slate-500"><div class="flex justify-between"><span>China (2024)</span><span>19%</span></div><div class="h-1.5 w-full bg-slate-100 rounded-full"><div class="h-full bg-slate-400 w-[19%]"></div></div><div class="flex justify-between text-indigo-600"><span>China (2026)</span><span>54%</span></div><div class="h-1.5 w-full bg-indigo-50 rounded-full"><div class="h-full bg-indigo-600 w-[54%]"></div></div><div class="flex justify-between text-rose-600"><span>Canada/Mexico (2026)</span><span>25%</span></div><div class="h-1.5 w-full bg-rose-50 rounded-full"><div class="h-full bg-rose-600 w-[25%]"></div></div></div></div>'
      },
      {
        marker: "[IMAGE: massive AI data center construction 2026]",
        replacement: '<div class="my-8"><img src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800" alt="Energy infrastructure for AI 2026" class="rounded-xl w-full h-auto shadow-lg" /><p class="text-center text-xs text-slate-500 mt-2">New high-density power grids being fast-tracked for AI infrastructure.</p></div>'
      }
    ]
  },
  {
    slug: "digital-crime-trends-2026-ai-scams-crypto-evasion",
    featuredImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    content_updates: [
      {
        marker: "[IMAGE: Europol cybercrime unit operations center]",
        replacement: '<div class="my-8"><img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800" alt="Global Cyber Defense Center" class="rounded-xl w-full h-auto shadow-lg" /><p class="text-center text-xs text-slate-500 mt-2">Law enforcement agencies coordinate the LeakBase takedown in early 2026.</p></div>'
      },
      {
        marker: "[IMAGE: illicit crypto transaction volume chart 2024-2026]",
        replacement: '<div class="my-8 bg-slate-900 p-6 rounded-xl text-white"><h4 class="text-sm font-bold mb-4 text-emerald-400">Illicit Crypto Inflow ($bn)</h4><div class="flex items-end gap-2 h-24"><div class="flex-1 bg-white/20 rounded-t h-[40%] relative group"><div class="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 text-[10px]">$62bn</div></div><div class="flex-1 bg-white/40 rounded-t h-[60%] relative group"><div class="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 text-[10px]">$94bn</div></div><div class="flex-1 bg-emerald-500 rounded-t h-[95%] relative group"><div class="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 text-[10px]">$154bn</div></div></div><div class="flex justify-between mt-2 text-[9px] font-bold text-white/50 italic"><span>2024</span><span>2025</span><span>2026 (Est)</span></div></div>'
      }
    ]
  }
];

async function updateBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    for (const update of updates) {
      const blog = await Blog.findOne({ slug: update.slug });
      if (!blog) {
        console.log(`Blog not found: ${update.slug}`);
        continue;
      }

      let newContent = blog.content;
      for (const cu of update.content_updates) {
        newContent = newContent.replace(cu.marker, cu.replacement);
      }

      await Blog.updateOne(
        { _id: blog._id },
        { 
          featuredImage: update.featuredImage,
          content: newContent
        }
      );
      console.log(`Updated images for: ${update.slug}`);
    }

    console.log('All images added successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateBlogs();
