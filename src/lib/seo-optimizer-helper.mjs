import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function expandContentWithAI(title, currentContent, keywords, tags, retryCount = 0) {
  if (!OPENROUTER_API_KEY) return '';

  const allKeywords = [...(keywords || []), ...(tags || [])].join(', ');

  const prompt = `
    You are a master SEO content creator. 
    Topic: "${title}"
    Keywords: ${allKeywords}
    
    Task: Write a MASSIVE expansion for a blog post.
    I need at least 1000 additional words of highly detailed, expert-level content.
    Include:
    1. At least 4-5 major H2 sections.
    2. Detailed H3 sub-sections.
    3. Actionable tips and a data table.
    4. Natural use of the keywords.
    
    Format: Return ONLY the new HTML fragment.
  `;

  // Rotate models if failing
  const models = [
    'openrouter/free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free'
  ];
  
  const model = models[retryCount % models.length];

  try {
    await sleep(2000);
    console.log(`  [AI] Expanding: ${title.substring(0, 30)}... using ${model} (Attempt ${retryCount + 1})`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SEO Optimizer'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (response.status === 429 || response.status === 404 || response.status === 503) {
      if (retryCount < 5) {
        const wait = (retryCount + 1) * 3000;
        console.log(`  [AI] Model ${model} failed (${response.status}). Retrying with next model in ${wait/1000}s...`);
        await sleep(wait);
        return expandContentWithAI(title, currentContent, keywords, tags, retryCount + 1);
      }
    }

    if (!response.ok) {
      console.log(`  [AI] Final error: ${response.status}`);
      return '';
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    console.log(`  [AI] Success. Received ${result.length} characters.`);
    return result;
  } catch (error) {
    console.error('  [AI] Exception:', error.message);
    return '';
  }
}
