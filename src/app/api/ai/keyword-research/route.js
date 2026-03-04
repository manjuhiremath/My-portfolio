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
      if (model && model.useForKeywordResearch) {
        return model.modelId
      }
    }

    // If it's a modelId string, find in DB
    const model = await AIModel.findOne({ modelId: modelIdentifier, useForKeywordResearch: true })
    if (model) {
      return model.modelId
    }

    // Return default model from DB
    const defaultModel = await AIModel.findOne({ isDefault: true, useForKeywordResearch: true })
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

function normalizeKeywordOutput(data) {
  const source = data && typeof data === "object" ? data : {}
  const toArray = (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean)
    }
    return []
  }

  const pickEnum = (value, allowed, fallback) => {
    const normalized = String(value || "").toLowerCase()
    return allowed.includes(normalized) ? normalized : fallback
  }

  return {
    ...source,
    mainTopic: String(source.mainTopic || "").trim(),
    industry: String(source.industry || "").trim(),
    category: String(source.category || "").trim(),
    subcategory: String(source.subcategory || "").trim(),
    primaryKeyword: String(source.primaryKeyword || "").trim(),
    secondaryKeywords: toArray(source.secondaryKeywords).slice(0, 12),
    longTailKeywords: toArray(source.longTailKeywords).slice(0, 10),
    suggestedTitles: toArray(source.suggestedTitles).slice(0, 10),
    contentAngles: toArray(source.contentAngles).slice(0, 6),
    relatedTopics: toArray(source.relatedTopics).slice(0, 10),
    seoRecommendations: toArray(source.seoRecommendations).slice(0, 10),
    targetAudience: String(source.targetAudience || "").trim(),
    searchIntent: pickEnum(source.searchIntent, ["informational", "transactional", "navigational", "commercial"], "informational"),
    competitionLevel: pickEnum(source.competitionLevel, ["low", "medium", "high"], "medium"),
    contentLength: ["1500", "2000", "2500"].includes(String(source.contentLength || "")) ? String(source.contentLength) : "1500",
    keywordDifficulty: pickEnum(source.keywordDifficulty, ["low", "medium", "high"], "medium"),
    monthlySearchVolume: String(source.monthlySearchVolume || "").trim(),
  }
}

function toTitleCase(value = "") {
  return String(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function buildFallbackKeywordOutput(allData = [], aiRawText = "") {
  const corpus = allData
    .map((item) => [
      item.title,
      item.description,
      ...(item.h1s || []),
      ...(item.h2s || []),
      ...(item.h3s || []),
      ...(item.metaKeywords || []),
      ...(item.categories || []),
      item.bodyText,
    ].join(" "))
    .join(" ")
    .concat(" ", aiRawText || "");

  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "from", "your", "have", "are",
    "was", "were", "into", "about", "what", "when", "where", "which", "will",
    "would", "could", "should", "their", "them", "they", "than", "then", "also",
    "using", "used", "use", "guide", "best", "tips", "how", "why", "can", "you",
    "our", "its", "it", "not", "but", "all", "one", "two", "new", "more", "most",
  ]);

  const words = corpus
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !stopWords.has(word));

  const freq = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  const primaryA = topWords[0] || "seo";
  const primaryB = topWords[1] || "content";
  const primaryKeyword = `${primaryA} ${primaryB}`.trim();
  const category = toTitleCase(topWords[0] || "Technology");
  const subcategory = toTitleCase(topWords[2] || "SEO");

  const secondaryKeywords = topWords.slice(0, 8).map((word) => toTitleCase(word));
  const longTailKeywords = [
    `${primaryKeyword} best practices`,
    `${primaryKeyword} strategy for beginners`,
    `how to improve ${primaryKeyword}`,
    `${primaryKeyword} checklist`,
    `${primaryKeyword} examples`,
  ];

  const suggestedTitles = [
    `${toTitleCase(primaryKeyword)}: Complete Starter Guide`,
    `${toTitleCase(primaryKeyword)} Best Practices for 2026`,
    `How to Improve ${toTitleCase(primaryKeyword)} Effectively`,
  ].map((title) => title.slice(0, 60));

  return normalizeKeywordOutput({
    mainTopic: toTitleCase(primaryKeyword),
    industry: "Technology",
    category,
    subcategory,
    primaryKeyword,
    secondaryKeywords,
    longTailKeywords,
    suggestedTitles,
    contentAngles: ["Beginner guide", "Step-by-step tutorial", "Common mistakes to avoid"],
    targetAudience: "Developers, marketers, and content creators",
    relatedTopics: secondaryKeywords.slice(0, 5),
    searchIntent: "informational",
    competitionLevel: "medium",
    contentLength: "1500",
    seoRecommendations: [
      "Use the primary keyword in title and first paragraph",
      "Add clear H2/H3 structure for scannability",
      "Include internal and external reference links",
      "Write a concise meta description (150-160 chars)",
      "Add FAQ section targeting long-tail queries",
    ],
    keywordDifficulty: "medium",
    monthlySearchVolume: "1K-10K",
  });
}

export async function POST(req) {
  try {
    const { url, competitorUrls, model } = await req.json()

    if (!url && !competitorUrls?.length) {
      return Response.json(
        { error: "At least one URL is required for analysis" },
        { status: 400 }
      )
    }

    const fetchPageContent = async (targetUrl) => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const response = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const html = await response.text()

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const title = titleMatch ? titleMatch[1].trim() : ''

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
        const description = descMatch ? descMatch[1].trim() : ''

        // Extract h1 headings
        const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []
        const h1s = h1Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean)

        // Extract h2 headings
        const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []
        const h2s = h2Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean)

        // Extract h3 headings
        const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []
        const h3s = h3Matches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean)

        // Extract meta keywords
        const keywordMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']keywords["']/i)
        const metaKeywords = keywordMatch ? keywordMatch[1].split(',').map(k => k.trim()).filter(Boolean) : []

        // Extract og:title
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
        const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : ''

        // Extract og:description
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
        const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : ''

        // Extract article tags/categories from common CMS patterns
        const categoryMatches = html.match(/class=["'][^"']*(?:category|tag)[^"']*["'][^>]*>([^<]+)<\/a>/gi) || []
        const categories = [...new Set(categoryMatches.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean))]

        // Extract schema.org data if present
        const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
        let schemaData = null
        if (schemaMatch) {
          try {
            schemaData = JSON.parse(schemaMatch[1])
          } catch (e) {
            // Ignore schema parse errors
          }
        }

        // Extract content body (more robust selectors)
        const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                         html.match(/<div[^>]*class=["'][^"']*(?:content|main|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                         html.match(/<div[^>]*id=["'][^"']*(?:content|main|article|post|entry)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
        
        let bodyText = ""
        if (bodyMatch) {
          bodyText = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 8000)
        } else {
          // Fallback to body content if specific containers not found
          const bodyTagMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
          if (bodyTagMatch) {
            bodyText = bodyTagMatch[1]
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
              .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
              .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 8000)
          }
        }

        return {
          url: targetUrl,
          title,
          description,
          h1s,
          h2s,
          h3s,
          metaKeywords,
          ogTitle,
          ogDescription,
          categories,
          schemaData,
          bodyText,
          contentLength: html.length
        }
      } catch (error) {
        console.error(`Error fetching ${targetUrl}:`, error.message)
        return {
          url: targetUrl,
          error: error.message,
          title: '',
          description: '',
          h1s: [],
          h2s: [],
          h3s: [],
          metaKeywords: [],
          categories: [],
          bodyText: ''
        }
      }
    }

    let allData = []

    // Fetch primary URL
    if (url) {
      const data = await fetchPageContent(url)
      allData.push(data)
    }

    // Fetch competitor URLs
    if (competitorUrls?.length) {
      for (const compUrl of competitorUrls.slice(0, 5)) {
        const data = await fetchPageContent(compUrl)
        allData.push(data)
      }
    }

    // Aggregate all data
    const allTitles = allData.filter(d => d.title).map(d => d.title).join(' | ')
    const allDescriptions = allData.filter(d => d.description).map(d => d.description).join(' ')
    const allH1s = allData.flatMap(d => d.h1s)
    const allH2s = allData.flatMap(d => d.h2s)
    const allH3s = allData.flatMap(d => d.h3s)
    const allMetaKeywords = [...new Set(allData.flatMap(d => d.metaKeywords))]
    const allCategories = [...new Set(allData.flatMap(d => d.categories))]
    const allBodyText = allData.filter(d => d.bodyText).map(d => d.bodyText).join('\n\n')

    const analysisPrompt = `
Analyze the following website content and provide comprehensive keyword research and categorization as valid JSON.

Website Titles:
${allTitles}

Meta Descriptions:
${allDescriptions}

H1 Headings:
${allH1s.join('\n')}

H2 Headings:
${allH2s.join('\n')}

H3 Headings:
${allH3s.join('\n')}

Existing Meta Keywords:
${allMetaKeywords.join(', ')}

Categories/Tags Found:
${allCategories.join(', ')}

Content Body Sample:
${allBodyText.substring(0, 3000)}

Based on this content, provide JSON with this structure:
{
  "mainTopic": "The main topic/niche identified from the content (e.g., 'React SEO', 'Digital Marketing')",
  "industry": "The industry this content belongs to (e.g., 'Technology', 'Health', 'Finance')",
  "category": "Suggested blog category name (single word or short phrase)",
  "subcategory": "Suggested subcategory name (more specific than category)",
  "primaryKeyword": "Best performing primary keyword with high search volume potential",
  "secondaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "longTailKeywords": ["long tail keyword phrase 1", "long tail keyword phrase 2", "long tail keyword phrase 3", "long tail keyword phrase 4", "long tail keyword phrase 5"],
  "suggestedTitles": ["SEO-friendly title 1 (50-60 chars)", "SEO-friendly title 2 (50-60 chars)", "SEO-friendly title 3 (50-60 chars)"],
  "contentAngles": ["angle 1", "angle 2", "angle 3"],
  "targetAudience": "Detailed target audience description (e.g., 'Web Developers', 'Marketing Managers', 'Small Business Owners')",
  "relatedTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "searchIntent": "informational|transactional|navigational|commercial",
  "competitionLevel": "low|medium|high",
  "contentLength": "1500|2000|2500",
  "seoRecommendations": ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"],
  "keywordDifficulty": "low|medium|high",
  "monthlySearchVolume": "estimated range like '1K-10K' or '10K-100K'"
}

Requirements:
- mainTopic: Extract the main topic directly from the content
- industry: Identify the industry based on content analysis
- category: Create a broad category that fits this content (e.g., 'Technology', 'Marketing')
- subcategory: Create a specific subcategory (e.g., 'Web Development', 'SEO')
- primaryKeyword: Must be high-value, high-search-volume keyword relevant to the content
- secondaryKeywords: Include 8 LSI keywords and semantic variations
- longTailKeywords: 5 specific long-tail phrases with lower competition
- targetAudience: Be specific about who would search for this content
- contentLength: Recommend 1500, 2000, or 2500 based on content depth needed
- All keywords should be SEO-optimized and competitive
`

    const selectedModelId = await getModelId(model)
    console.log('Using model for keyword research:', selectedModelId)

    let completion;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        completion = await callAI(selectedModelId, [
          { role: "user", content: analysisPrompt }
        ], {
          temperature: 0.2,
          max_tokens: 4000
        })
        break; // Success, exit loop
      } catch (err) {
        if (err.status === 429 && retries < maxRetries) {
          retries++;
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 2s, 4s
          console.warn(`Rate limited (429). Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw err; // Rethrow if not a 429 or max retries reached
      }
    }

    const result = completion.choices[0].message.content

    let keywordData
    let usedFallback = false
    try {
      // Use Response Healing to parse AI JSON response
      keywordData = parseWithHealing(result)
    } catch (parseError) {
      console.error("Parse Error:", parseError)
      usedFallback = true
      keywordData = buildFallbackKeywordOutput(allData.filter(d => !d.error), result)
    }

    const normalizedKeywords = normalizeKeywordOutput(keywordData)

    return Response.json({
      success: true,
      scrapedData: allData.filter(d => !d.error),
      keywords: normalizedKeywords,
      fallbackUsed: usedFallback,
      summary: {
        pagesAnalyzed: allData.filter(d => !d.error).length,
        errors: allData.filter(d => d.error).map(d => ({ url: d.url, error: d.error }))
      }
    })

  } catch (error) {
    console.error("Keyword Research Error:", error)
    return Response.json(
      { error: error.message || "Failed to perform keyword research" },
      { status: 500 }
    )
  }
}
