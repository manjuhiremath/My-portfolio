import { connectDB } from "@/lib/mongodb"
import Blog from "@/models/Blog"
import AIModel from "@/models/AIModel"
import slugify from "slugify"
import { AIRouter } from "@/lib/ai/router"

// ============================================
// Response Healing - Auto-fix malformed JSON
// ============================================

/**
 * Comprehensive JSON response healer that fixes common AI response issues
 * Supports: missing brackets, trailing commas, markdown wrappers, unquoted keys, mixed text
 */
function healJSON(response) {
  let jsonStr = response

  // Step 1: Remove markdown code blocks (```json ... ``` or ``` ... ```)
  jsonStr = jsonStr.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim()

  // Step 2: Remove preamble text before JSON (e.g., "Here is the JSON:", "Here's the response:")
  jsonStr = jsonStr.replace(/^[\s\n]*(Here is|Here's|This is|Here's the|Output:|Response:)[\s\n]*(the )?(JSON|response|data|output)?[\s\n]*:/i, '')

  // Step 3: Extract JSON object from mixed text (find first { and last })
  const firstBrace = jsonStr.indexOf('{')
  const lastBrace = jsonStr.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
  }

  // Step 4: Fix trailing commas (e.g., {"a": 1,} -> {"a": 1})
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1')

  // Step 5: Fix unquoted keys (e.g., {name: "value"} -> {"name": "value"})
  jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')

  // Step 6: Fix single-quoted values to double-quoted
  jsonStr = jsonStr.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')

  // Step 7: Fix missing closing brackets/braces
  const openBraces = (jsonStr.match(/{/g) || []).length
  const closeBraces = (jsonStr.match(/}/g) || []).length
  const openBrackets = (jsonStr.match(/\[/g) || []).length
  const closeBrackets = (jsonStr.match(/\]/g) || []).length

  if (openBraces > closeBraces) {
    jsonStr += '}'.repeat(openBraces - closeBraces)
  }
  if (openBrackets > closeBrackets) {
    jsonStr += ']'.repeat(openBrackets - closeBrackets)
  }

  // Step 8: Sanitize control characters (except valid JSON escapes)
  jsonStr = jsonStr.replace(/[\x00-\x1f\x7f]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return ' '
    return ''
  })

  // Step 9: Collapse multiple spaces
  jsonStr = jsonStr.replace(/\s{2,}/g, ' ')

  // Step 10: Fix common escape sequence issues
  jsonStr = jsonStr.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')

  // Step 11: Try to fix unescaped quotes inside strings
  // This is a best-effort fix for responses like {"content": "text with "quotes" inside"}
  jsonStr = jsonStr.replace(/(?<!\\)"(?=[^"\\]*\\)*(?=[^"]*$)/g, '\\"')

  return jsonStr
}

/**
 * Attempts to parse JSON with healing, returns parsed object or throws error
 */
function parseWithHealing(response) {
  // First attempt: direct parse after basic cleaning
  try {
    return JSON.parse(response)
  } catch (e) {
    console.log('Direct parse failed, attempting healing...')
  }

  // Second attempt: heal and parse
  const healed = healJSON(response)
  try {
    return JSON.parse(healed)
  } catch (e) {
    console.log('Healed parse failed, trying advanced healing...')
  }

  // Third attempt: aggressive extraction
  const extracted = extractJSONAggressively(response)
  if (extracted) {
    try {
      return JSON.parse(extracted)
    } catch (e) {
      console.log('Aggressive extraction failed')
    }
  }

  throw new Error('Failed to parse JSON even after healing attempts')
}

/**
 * Aggressive JSON extraction - tries multiple strategies
 */
function extractJSONAggressively(response) {
  // Strategy 1: Find JSON-like structure and fix it
  let extracted = response

  // Remove everything before first {
  const firstBrace = extracted.indexOf('{')
  if (firstBrace !== -1) {
    extracted = extracted.substring(firstBrace)
  }

  // Remove everything after last }
  const lastBrace = extracted.lastIndexOf('}')
  if (lastBrace !== -1) {
    extracted = extracted.substring(0, lastBrace + 1)
  }

  // Fix common issues
  extracted = extracted.replace(/,\s*([}\]])/g, '$1')
  extracted = extracted.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
  extracted = extracted.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')

  // Ensure proper closure
  const opens = (extracted.match(/{/g) || []).length
  const closes = (extracted.match(/}/g) || []).length
  if (opens > closes) {
    extracted += '}'.repeat(opens - closes)
  }

  return extracted
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
      if (model && model.useForContent) {
        return model.modelId
      }
    }

    // If it's a modelId string, find in DB
    const model = await AIModel.findOne({ modelId: modelIdentifier, useForContent: true })
    if (model) {
      return model.modelId
    }

    // Return default model from DB
    const defaultModel = await AIModel.findOne({ isDefault: true, useForContent: true })
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

function normalizeArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean)
  }
  return []
}

function clampText(text, maxLength) {
  const value = String(text || "").trim()
  if (!value) return ""
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength).trim()
}

function normalizeBlogData(raw, topic) {
  const source = raw && typeof raw === "object" ? raw : {}
  const title = clampText(source.title || topic, 70) || topic
  const slug = slugify(source.slug || title, { lower: true, strict: true })
  const seoTitle = clampText(source.seoTitle || title, 60) || title
  const seoDescription = clampText(source.seoDescription || `Read this guide about ${topic}.`, 160)
  const featuredImagePrompt = clampText(source.featuredImagePrompt || `Professional featured image for ${title}`, 300)
  const content = String(source.content || "").trim()
  const tags = Array.from(
    new Set(
      normalizeArray(source.tags)
        .map((tag) => clampText(tag, 30))
        .filter(Boolean)
    )
  ).slice(0, 8)

  return {
    title,
    slug: slug || slugify(title, { lower: true, strict: true }),
    seoTitle,
    seoDescription,
    featuredImagePrompt,
    content,
    tags: tags.length ? tags : normalizeArray(topic).slice(0, 1),
  }
}

export async function POST(req) {
  try {
    const { topic, category, subcategory, model } = await req.json()

    if (!topic || !category || !subcategory) {
      return Response.json(
        { error: "Topic, category, and subcategory are required" },
        { status: 400 }
      )
    }

    const selectedModelId = await getModelId(model)
    console.log('Using model for content generation:', selectedModelId)

    const prompt = `
Generate a comprehensive SEO-friendly blog article as valid JSON only. No markdown, no code blocks, no explanations.

Topic: ${topic}
Category: ${category}
Subcategory: ${subcategory}

JSON structure (all fields required):
{
  "title": "SEO-friendly blog title (50-60 characters, include primary keyword)",
  "slug": "url-friendly-slug",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "seoTitle": "SEO title (55-60 characters with keyword)",
  "seoDescription": "SEO meta description (150-160 characters, compelling summary with keyword)",
  "featuredImagePrompt": "Detailed image generation prompt for featured image",
  "content": "Full article in plain HTML with 4-6 H2 sections, paragraphs, and FAQ at end"
}

Requirements:
- Content must be 1400-1600 words minimum
- Use plain HTML tags: <h2>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>
- Include 5-8 relevant tags
- SEO title and description must include primary keyword
- Add FAQ section at the end with 4-6 questions
- Write in engaging, informative style
- Include practical examples and actionable tips
`

    // AI Router handles retries, context preservation, and fallback chain automatically
    const result = await AIRouter.generateWithFallback({
      systemPrompt: "You are an expert SEO content writer and JSON formatter.",
      prompt: prompt,
      temperature: 0.2,
      maxRetriesPerModel: 1
    })

    console.log("AI Response:", result.substring(0, 500))

    let blogData
    try {
      // Use Response Healing to parse AI JSON response
      // This handles: missing brackets, trailing commas, markdown wrappers, unquoted keys, mixed text
      blogData = parseWithHealing(result)

      // Validate we got at least a title
      if (!blogData || !blogData.title) {
        throw new Error('Response healing failed - no title found')
      }

      console.log("Successfully parsed AI response:", blogData.title)
    } catch (parseError) {
      console.error("Parse Error:", parseError)
      console.error("Raw Response:", result)
      return Response.json(
        { error: "Failed to parse AI response as JSON", raw: result.substring(0, 500) },
        { status: 500 }
      )
    }

    const normalizedBlogData = normalizeBlogData(blogData, topic)

    if (!normalizedBlogData.content) {
      return Response.json(
        { error: "AI response did not include valid content" },
        { status: 500 }
      )
    }

    await connectDB()

    const blog = await Blog.create({
      title: normalizedBlogData.title,
      slug: normalizedBlogData.slug,
      category,
      subcategory,
      excerpt: normalizedBlogData.seoDescription,
      content: normalizedBlogData.content,
      featuredImage: "",
      tags: normalizedBlogData.tags,
      seoTitle: normalizedBlogData.seoTitle,
      seoDescription: normalizedBlogData.seoDescription,
      published: false
    })

    return Response.json({
      success: true,
      blog,
      preview: {
        title: normalizedBlogData.title,
        slug: normalizedBlogData.slug,
        tags: normalizedBlogData.tags,
        seoTitle: normalizedBlogData.seoTitle,
        seoDescription: normalizedBlogData.seoDescription,
        featuredImagePrompt: normalizedBlogData.featuredImagePrompt
      }
    })

  } catch (error) {
    console.error("AI Blog Generation Error:", error)
    return Response.json(
      { error: error.message || "Failed to generate blog" },
      { status: 500 }
    )
  }
}
