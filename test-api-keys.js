import { config } from 'dotenv';
config({ path: '.env.local' });

const providers = [
  {
    name: 'OpenRouter',
    key: process.env.OPENROUTER_API_KEY,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    body: { model: 'stepfun/step-3.5-flash:free', messages: [{ role: 'user', content: 'say hi' }] },
    auth: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  {
    name: 'Groq',
    key: process.env.GROQ_API_KEY,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    body: { model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: 'say hi' }] },
    auth: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  {
    name: 'Mistral',
    key: process.env.MISTRAL_API_KEY,
    url: 'https://api.mistral.ai/v1/chat/completions',
    body: { model: 'mistral-small-latest', messages: [{ role: 'user', content: 'say hi' }] },
    auth: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  {
    name: 'SambaNova',
    key: process.env.SAMBANOVA_API_KEY,
    url: 'https://api.sambanova.ai/v1/chat/completions',
    body: { model: 'Meta-Llama-3.1-8B-Instruct', messages: [{ role: 'user', content: 'say hi' }] },
    auth: (key) => ({ 'Authorization': `Bearer ${key}` })
  },
  {
    name: 'Cerebras',
    key: process.env.CEREBRAS_API_KEY,
    url: 'https://api.cerebras.ai/v1/chat/completions',
    body: { model: 'llama3.1-8b', messages: [{ role: 'user', content: 'say hi' }] },
    auth: (key) => ({ 'Authorization': `Bearer ${key}` })
  }
];

async function testKey(provider) {
  if (!provider.key) return { name: provider.name, status: 'SKIPPED', message: 'Key not found' };

  try {
    const res = await fetch(provider.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...provider.auth(provider.key) },
      body: JSON.stringify(provider.body)
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) {
      return { name: provider.name, status: 'FAILED', message: `Invalid JSON: ${text.substring(0, 50)}` };
    }
    
    if (res.ok) return { name: provider.name, status: 'WORKING', message: 'Connection successful' };
    return { name: provider.name, status: 'FAILED', message: data.error?.message || res.statusText };
  } catch (e) {
    return { name: provider.name, status: 'ERROR', message: e.message };
  }
}

async function runDiagnostics() {
  console.log('🧪 API Key Diagnostics (Cleaned)...\n');
  const results = await Promise.all(providers.map(testKey));
  console.table(results);
}

runDiagnostics();
