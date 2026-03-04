import ollama from 'ollama';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * Check if a model identifier is an Ollama model
 * Ollama models don't contain '/' like OpenRouter models do
 */
export function isOllamaModel(modelId) {
  if (!modelId) return false;
  // Ollama models are simple names without provider prefix
  // e.g., 'llama3.2', 'deepseek-coder', 'mistral'
  return !modelId.includes('/') && !modelId.includes(':');
}

/**
 * Call Ollama chat completion
 */
export async function callOllama(modelId, messages, options = {}) {
  try {
    const response = await ollama.chat({
      model: modelId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.max_tokens ?? 4000,
      },
      baseUrl: OLLAMA_BASE_URL,
    });

    return {
      choices: [{
        message: {
          content: response.message.content,
          role: 'assistant'
        }
      }]
    };
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw new Error(`Ollama error: ${error.message}`);
  }
}

/**
 * List available Ollama models
 */
export async function listOllamaModels() {
  try {
    const response = await ollama.list({
      baseUrl: OLLAMA_BASE_URL,
    });

    return response.models.map(model => ({
      modelId: model.name,
      name: model.name,
      provider: 'ollama',
      description: `Ollama local model - ${model.details?.parameter_size || 'Unknown size'}`,
      contextLength: model.details?.context_length || 8192,
      isFree: true,
      isActive: true,
    }));
  } catch (error) {
    console.error('Failed to list Ollama models:', error);
    return [];
  }
}

/**
 * Pull a model from Ollama (download if not exists)
 */
export async function pullOllamaModel(modelId) {
  try {
    const response = await ollama.pull({
      model: modelId,
      baseUrl: OLLAMA_BASE_URL,
      stream: false,
    });
    return response;
  } catch (error) {
    console.error('Failed to pull Ollama model:', error);
    throw error;
  }
}

/**
 * Universal AI caller - routes to Ollama or OpenRouter based on model ID
 */
export async function callAI(modelId, messages, options = {}) {
  if (isOllamaModel(modelId)) {
    return callOllama(modelId, messages, options);
  }

  // Use OpenRouter/OpenAI for other models
  const { default: OpenAI } = await import('openai');

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
  });

  return client.chat.completions.create({
    model: modelId,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 4000
  });
}
