import OpenAI from "openai"
import { connectDB } from "@/lib/mongodb"
import AIModel from "@/models/AIModel"
import { isOllamaModel, callOllama } from "@/lib/ollama"

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY
})

/**
 * Universal AI caller - routes to Ollama or OpenRouter based on model ID
 */
async function callAI(modelId, messages, options = {}) {
  if (isOllamaModel(modelId)) {
    return callOllama(modelId, messages, options)
  }

  // Use OpenRouter for other models
  return client.chat.completions.create({
    model: modelId,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 4000
  })
}

// ============================================
// Response Healing - Auto-fix malformed JSON
// ============================================

function healJSON(response) {
  let jsonStr = response

  // Remove markdown code blocks
  jsonStr = jsonStr.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim()

  // Remove preamble text
  jsonStr = jsonStr.replace(/^[\s\n]*(Here is|Here's|This is)[\s\n]*(the )?(JSON|response|data)?[\s\n]*:/i, '')

  // Extract JSON object
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
  }

  // Fix trailing commas
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1')

  // Fix unquoted keys
  jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')

  // Fix single quotes
  jsonStr = jsonStr.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')

  // Fix missing brackets
  const openBraces = (jsonStr.match(/{/g) || []).length
  const closeBraces = (jsonStr.match(/}/g) || []).length
  if (openBraces > closeBraces) jsonStr += '}'.repeat(openBraces - closeBraces)

  const openBrackets = (jsonStr.match(/\[/g) || []).length
  const closeBrackets = (jsonStr.match(/\]/g) || []).length
  if (openBrackets > closeBrackets) jsonStr += ']'.repeat(openBrackets - closeBrackets)

  // Sanitize control characters
  jsonStr = jsonStr.replace(/[\x00-\x1f\x7f]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return ' '
    return ''
  })

  // Collapse multiple spaces
  jsonStr = jsonStr.replace(/\s{2,}/g, ' ')

  return jsonStr
}

function parseWithHealing(response) {
  try {
    return JSON.parse(response)
  } catch (e) {}

  const healed = healJSON(response)
  try {
    return JSON.parse(healed)
  } catch (e) {}

  // Aggressive extraction
  let extracted = response
  const firstBrace = extracted.indexOf('{')
  if (firstBrace !== -1) extracted = extracted.substring(firstBrace)
  const lastBrace = extracted.lastIndexOf('}')
  if (lastBrace !== -1) extracted = extracted.substring(0, lastBrace + 1)

  extracted = extracted.replace(/,\s*([}\]])/g, '$1')
  extracted = extracted.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
  extracted = extracted.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')

  const opens = (extracted.match(/{/g) || []).length
  const closes = (extracted.match(/}/g) || []).length
  if (opens > closes) extracted += '}'.repeat(opens - closes)

  try {
    return JSON.parse(extracted)
  } catch (e) {
    throw new Error('Failed to parse JSON')
  }
}

async function getModelId(modelIdentifier) {
  try {
    // If it looks like a model slug (contains /), use it directly
    if (modelIdentifier && modelIdentifier.includes('/')) {
      return modelIdentifier
    }

    await connectDB()

    // If it's a valid ObjectId, fetch from DB
    if (modelIdentifier && modelIdentifier.length === 24) {
      const model = await AIModel.findById(modelIdentifier)
      if (model && model.useForOutline) {
        return model.modelId
      }
    }

    // If it's a modelId string, find in DB
    const model = await AIModel.findOne({ modelId: modelIdentifier, useForOutline: true })
    if (model) {
      return model.modelId
    }

    // Return default model from DB
    const defaultModel = await AIModel.findOne({ isDefault: true, useForOutline: true })
    if (defaultModel) {
      return defaultModel.modelId
    }

    // Fallback
    return "meta-llama/llama-3.3-70b-instruct:free"
  } catch (error) {
    console.error('Error getting model:', error)
    return "meta-llama/llama-3.3-70b-instruct:free"
  }
}

function normalizeOutline(data, primaryKeyword) {
  const raw = Array.isArray(data?.outline) ? data.outline : []
  const normalized = raw
    .map((item) => ({
      type: (item?.type || "h2").toLowerCase(),
      title: String(item?.title || "").trim(),
    }))
    .filter((item) => item.title)
    .map((item) => ({
      type: ["h1", "h2", "h3"].includes(item.type) ? item.type : "h2",
      title: item.title.slice(0, 140),
    }))

  if (!normalized.length) {
    return [
      { type: "h1", title: `${primaryKeyword} - Complete Guide` },
      { type: "h2", title: `What is ${primaryKeyword}?` },
      { type: "h2", title: `Key benefits of ${primaryKeyword}` },
      { type: "h2", title: `${primaryKeyword} best practices` },
      { type: "h2", title: `Common mistakes to avoid` },
      { type: "h2", title: "Conclusion and next steps" },
      { type: "h2", title: "FAQ" },
    ]
  }

  if (normalized[0].type !== "h1") {
    normalized.unshift({ type: "h1", title: `${primaryKeyword} - Complete Guide` })
  }

  return normalized
}

export async function POST(req) {
  try {
    const { primaryKeyword, secondaryKeywords, blogTitle, targetAudience, contentLength, tone, model } = await req.json()

    if (!primaryKeyword) {
      return Response.json(
        { error: "Primary keyword is required" },
        { status: 400 }
      )
    }

    const prompt = `
Generate a detailed blog outline as valid JSON only. No markdown, no code blocks.

Topic/Keyword: ${primaryKeyword}
${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
${blogTitle ? `Suggested Title: ${blogTitle}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
Tone: ${tone || 'Professional'}
Approximate Length: ${contentLength || 1200} words

JSON structure:
{
  "outline": [
    { "type": "h1", "title": "Main Title" },
    { "type": "h2", "title": "Section Title" },
    { "type": "h3", "title": "Subsection Title" }
  ]
}

Requirements:
- Start with H1 for main title
- Include 6-10 H2 sections for main content
- Include 2-3 H3 subsections under major sections
- Outline should cover: introduction, main points, practical tips, conclusion, FAQ
- Make sections SEO-friendly with the primary keyword in mind
- Each section should have descriptive, click-worthy titles
`

    const selectedModelId = await getModelId(model)
    console.log('Using model for outline:', selectedModelId)

    let completion;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        completion = await callAI(selectedModelId, [
          { role: "user", content: prompt }
        ], {
          temperature: 0.2,
          max_tokens: 4000
        })
        break; // Success
      } catch (err) {
        if (err.status === 429 && retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          console.warn(`Rate limited (429). Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }

    const result = completion.choices[0].message.content

    let outlineData
    try {
      // Use Response Healing to parse AI JSON response
      outlineData = parseWithHealing(result)
    } catch (parseError) {
      console.error("Parse Error:", parseError)
      return Response.json(
        { error: "Failed to parse AI response", raw: result.substring(0, 500) },
        { status: 500 }
      )
    }

    const outline = normalizeOutline(outlineData, primaryKeyword)

    return Response.json({
      success: true,
      outline
    })

  } catch (error) {
    console.error("AI Outline Generation Error:", error)
    return Response.json(
      { error: error.message || "Failed to generate outline" },
      { status: 500 }
    )
  }
}
