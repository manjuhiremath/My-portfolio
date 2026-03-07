/**
 * AI Provider Configurations
 * Supports multiple free providers for fallback generation
 */

export const providers = {
  OPENROUTER: 'openrouter',
  GROQ: 'groq',
  MISTRAL: 'mistral',
  CEREBRAS: 'cerebras',
  SAMBANOVA: 'sambanova',
  OLLAMA: 'ollama',
};

// Fallback Chain Priority Order
export const FALLBACK_CHAIN = [
  // 1️⃣ Primary models
  { provider: providers.OPENROUTER, model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { provider: providers.OPENROUTER, model: 'mistralai/mistral-small-3.1-24b-instruct:free' },
  { provider: providers.OPENROUTER, model: 'google/gemma-3-27b-it:free' },
  
  // 2️⃣ Secondary models
  { provider: providers.OPENROUTER, model: 'google/gemma-3-12b-it:free' },
  { provider: providers.OPENROUTER, model: 'google/gemma-3-4b-it:free' },
  { provider: providers.OPENROUTER, model: 'qwen/qwen3-next-80b-a3b-instruct:free' },
  
  // 3️⃣ Lightweight fallback
  { provider: providers.OPENROUTER, model: 'meta-llama/llama-3.2-3b-instruct:free' },
  { provider: providers.OPENROUTER, model: 'qwen/qwen-vl-chat:free' }, // Assuming qwen3-4b substitute
  
  // 4️⃣ Local fallback (Ollama)
  { provider: providers.OLLAMA, model: 'llama3' },
  { provider: providers.OLLAMA, model: 'mistral' }
];

export const getProviderConfig = (providerName) => {
  switch (providerName) {
    case providers.OPENROUTER:
      return {
        baseURL: 'https://openrouter.ai/api/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'AI Blog Generator'
        })
      };
    case providers.GROQ:
      return {
        baseURL: 'https://api.groq.com/openai/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      };
    case providers.MISTRAL:
      return {
        baseURL: 'https://api.mistral.ai/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      };
    case providers.CEREBRAS:
      return {
        baseURL: 'https://api.cerebras.ai/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      };
    case providers.SAMBANOVA:
      return {
        baseURL: 'https://api.sambanova.ai/v1/chat/completions',
        headers: (apiKey) => ({
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        })
      };
    case providers.OLLAMA:
      return {
        baseURL: process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat',
        headers: () => ({
          'Content-Type': 'application/json'
        })
      };
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
};
