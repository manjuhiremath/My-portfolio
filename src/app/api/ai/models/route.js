import { connectDB } from '@/lib/mongodb';
import AIModel from '@/models/AIModel';
import { listOllamaModels } from '@/lib/ollama';

const OPENROUTER_MODELS_API = 'https://openrouter.ai/api/frontend/models';

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;
let cachedModels = null;
let lastFetchTime = null;

async function fetchModelsFromOpenRouter() {
  try {
    const response = await fetch(OPENROUTER_MODELS_API, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter only free models
    const freeModels = data.data.filter(model => {
      // Check if endpoint exists and has pricing
      const endpoint = model.endpoint;
      if (!endpoint) return false;
      
      // Check is_free flag or if pricing is $0
      const isFree = endpoint.is_free === true;
      const hasZeroPricing = endpoint.pricing && 
        parseFloat(endpoint.pricing.prompt) === 0 && 
        parseFloat(endpoint.pricing.completion) === 0;
      
      return isFree || hasZeroPricing;
    });

    // Transform to our format
    const transformedModels = freeModels.map(model => ({
      _id: model.slug, // Use slug as ID for API models
      modelId: model.slug,
      name: model.short_name || model.name,
      provider: model.author || 'Unknown',
      description: model.description?.substring(0, 200) || '',
      contextLength: model.context_length || 8192,
      weeklyTokens: '',
      isFree: true,
      isActive: true,
      isDefault: false,
      useForKeywordResearch: true,
      useForOutline: true,
      useForContent: true,
      isFromAPI: true,
      // Additional fields from API
      icon: model.endpoint?.provider_info?.icon?.url 
        ? `https://openrouter.ai${model.endpoint.provider_info.icon.url}` 
        : null,
      iconClassName: model.endpoint?.provider_info?.icon?.className || '',
      permaslug: model.permaslug || model.slug,
      hasTextOutput: model.has_text_output || false,
      group: model.group || '',
      outputModalities: model.output_modalities || [],
      inputModalities: model.input_modalities || [],
    }));

    return transformedModels;
  } catch (error) {
    console.error('Error fetching from OpenRouter:', error);
    return null;
  }
}

async function getModelsFromDatabase() {
  try {
    await connectDB();
    const models = await AIModel.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    
    return models.map(m => ({
      ...m,
      isFromAPI: false
    }));
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') || 'auto'; // 'auto', 'api', 'db', 'ollama'
    const includePaid = searchParams.get('includePaid') === 'true';

    let models = [];

    if (source === 'api') {
      // Fetch only from OpenRouter API
      models = await fetchModelsFromOpenRouter();
      if (!models) {
        return Response.json(
          { error: 'Failed to fetch models from OpenRouter' },
          { status: 500 }
        );
      }
    } else if (source === 'db') {
      // Fetch only from database
      models = await getModelsFromDatabase();
    } else if (source === 'ollama') {
      // Fetch only Ollama models
      models = await listOllamaModels();
    } else {
      // Auto: Try API first, fallback to DB, include Ollama
      const now = Date.now();

      // Use cache if available and fresh
      if (cachedModels && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
        models = cachedModels;
      } else {
        const [apiModels, ollamaModels] = await Promise.all([
          fetchModelsFromOpenRouter(),
          listOllamaModels()
        ]);

        // Get custom models from DB
        const dbModels = await getModelsFromDatabase();

        // Merge all models
        const apiSlugs = new Set(apiModels?.map(m => m.modelId) || []);
        const customDbModels = dbModels.filter(m => !apiSlugs.has(m.modelId));

        models = [
          ...(apiModels || []),
          ...customDbModels,
          ...ollamaModels
        ];

        // Update cache
        cachedModels = models;
        lastFetchTime = now;
      }
    }

    // Sort: default first, then by name
    models.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });

    return Response.json({
      models,
      count: models.length,
      source: source === 'auto' ? (cachedModels ? 'cache' : 'api+db+ollama') : source,
      cached: cachedModels === models
    });

  } catch (error) {
    console.error('Error in models API:', error);
    return Response.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// POST - Add custom model to database
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { modelId, name, provider, description, contextLength, weeklyTokens, 
            useForKeywordResearch, useForOutline, useForContent, isDefault } = body;

    if (!modelId || !name || !provider) {
      return Response.json(
        { error: 'Model ID, name, and provider are required' },
        { status: 400 }
      );
    }

    // Check if model already exists
    const existing = await AIModel.findOne({ modelId: modelId.trim() });
    if (existing) {
      return Response.json(
        { error: 'Model with this ID already exists' },
        { status: 409 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await AIModel.updateMany({}, { isDefault: false });
    }

    const newModel = await AIModel.create({
      modelId: modelId.trim(),
      name: name.trim(),
      provider: provider.trim(),
      description: description || '',
      contextLength: parseInt(contextLength) || 8192,
      weeklyTokens: weeklyTokens || '',
      useForKeywordResearch: useForKeywordResearch !== false,
      useForOutline: useForOutline !== false,
      useForContent: useForContent !== false,
      isDefault: isDefault || false,
      isFree: true,
      isActive: true
    });

    // Clear cache to include new model
    cachedModels = null;
    lastFetchTime = null;

    return Response.json(
      { message: 'AI Model created successfully', model: newModel },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating AI model:', error);
    return Response.json(
      { error: error.message || 'Failed to create AI model' },
      { status: 500 }
    );
  }
}
