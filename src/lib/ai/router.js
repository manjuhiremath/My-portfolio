import { FALLBACK_CHAIN, getProviderConfig, providers } from './providers';

/**
 * Helper to pause execution for a given time
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error should trigger a fallback switch or a simple retry
 */
const shouldRetry = (status) => {
  // Retry on rate limits or server errors
  return status === 429 || status >= 500;
};

/**
 * Formats messages for Ollama vs OpenAI-compatible APIs (OpenRouter, Groq, Mistral, etc.)
 */
const formatPayload = (provider, model, messages, temperature = 0.7) => {
  if (provider === providers.OLLAMA) {
    return {
      model: model,
      messages: messages,
      stream: false,
      options: { temperature }
    };
  }

  // Default for OpenAI-compatible APIs
  return {
    model: model,
    messages: messages,
    temperature: temperature
  };
};

/**
 * Attempts to call a specific AI provider and model
 */
async function callProvider(provider, model, messages, apiKey, temperature) {
  const config = getProviderConfig(provider);
  const payload = formatPayload(provider, model, messages, temperature);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(config.baseURL, {
      method: 'POST',
      headers: config.headers(apiKey),
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw { status: response.status, message: await response.text() };
    }

    const data = await response.json();
    
    // Parse response based on provider
    if (provider === providers.OLLAMA) {
      return data.message?.content || '';
    } else {
      return data.choices?.[0]?.message?.content || '';
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { status: 408, message: 'Request timeout' };
    }
    throw error;
  }
}

/**
 * AI Router
 * Handles intelligent fallback, context preservation, and exponential backoff.
 */
export class AIRouter {
  /**
   * Main entry point to generate content with fallback mechanism
   */
  static async generateWithFallback({
    systemPrompt,
    prompt,
    temperature = 0.7,
    maxRetriesPerModel = 1
  }) {
    // Shared generation context
    const context = {
      systemPrompt,
      prompt,
      conversationHistory: [],
      generatedText: '' // Used to accumulate text if a model partially fails (advanced feature)
    };

    let attemptCount = 0;

    for (let i = 0; i < FALLBACK_CHAIN.length; i++) {
      const currentConfig = FALLBACK_CHAIN[i];
      const { provider, model } = currentConfig;
      
      // Determine API key based on provider (You would hook up actual env vars here)
      let apiKey = '';
      if (provider === providers.OPENROUTER) apiKey = process.env.OPENROUTER_API_KEY;
      if (provider === providers.GROQ) apiKey = process.env.GROQ_API_KEY;
      if (provider === providers.MISTRAL) apiKey = process.env.MISTRAL_API_KEY;
      
      // Skip if no API key and not a local model
      if (!apiKey && provider !== providers.OLLAMA) {
        console.warn(`[AI Router] Skipping ${provider} - No API key found.`);
        continue;
      }

      console.log(`[AI Router] Attempting generation with ${provider} : ${model}`);

      // Prepare messages payload
      const messages = [
        { role: 'system', content: context.systemPrompt },
        ...context.conversationHistory,
        { role: 'user', content: context.prompt }
      ];

      // If we are continuing from a partial generation (context preservation)
      if (context.generatedText) {
        messages.push({ role: 'assistant', content: context.generatedText });
        messages.push({ role: 'user', content: 'Please continue exactly from where you left off. Do not repeat what you have already written.' });
      }

      let modelRetries = 0;

      while (modelRetries <= maxRetriesPerModel) {
        try {
          const result = await callProvider(provider, model, messages, apiKey, temperature);
          
          if (result) {
            console.log(`[AI Router] Success with ${provider} : ${model}`);
            // Return accumulated text if we are continuing, otherwise just result
            return context.generatedText ? context.generatedText + result : result;
          }
        } catch (error) {
          const status = error.status || 500;
          console.error(`[AI Router] Error with ${provider} : ${model} - Status: ${status}`, error.message);
          
          if (shouldRetry(status) && modelRetries < maxRetriesPerModel) {
            modelRetries++;
            const backoffTime = Math.pow(2, modelRetries) * 1000; // Exponential backoff: 2s, 4s...
            console.log(`[AI Router] Retrying ${provider} : ${model} in ${backoffTime}ms (Attempt ${modelRetries}/${maxRetriesPerModel})`);
            await sleep(backoffTime);
          } else {
            console.warn(`[AI Router] ${provider} : ${model} failed persistently. Switching to next model in fallback chain.`);
            break; // Break inner loop to move to the next model in FALLBACK_CHAIN
          }
        }
      }
    }

    // If we exhaust the entire fallback chain
    throw new Error('All AI providers in the fallback chain failed.');
  }
}
