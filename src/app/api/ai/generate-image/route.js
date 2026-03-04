import OpenAI from "openai";
import { normalizeFeaturedImageUrl } from "@/lib/cloudinary";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&h=630&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop",
];

function getSeededImage(prompt = "") {
  const hash = prompt.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[index];
}

function getImageInputUrl({ imageUrl, imageBase64, mimeType }) {
  if (imageUrl && typeof imageUrl === "string") return imageUrl;

  if (imageBase64 && typeof imageBase64 === "string") {
    const clean = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
    const safeMimeType = mimeType || "image/jpeg";
    return `data:${safeMimeType};base64,${clean}`;
  }

  return "";
}

async function describeImageWithAI(model, prompt, imageInputUrl) {
  if (!process.env.OPENROUTER_API_KEY || !imageInputUrl) return "";

  const completion = await client.chat.completions.create({
    model: model || "google/gemini-3-flash-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              prompt ||
              "Describe this image in one short line for a blog featured image caption.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageInputUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 200,
  });

  return completion.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req) {
  try {
    const {
      prompt,
      imageUrl,
      imageBase64,
      mimeType,
      model,
      storeInCloudinary = true,
    } = await req.json();

    const imageInputUrl = getImageInputUrl({ imageUrl, imageBase64, mimeType });
    const sourceImageUrl = imageInputUrl || getSeededImage(prompt || "");

    const cloudinaryUrl = storeInCloudinary
      ? await normalizeFeaturedImageUrl(sourceImageUrl, "blog-featured")
      : sourceImageUrl;

    let aiCaption = "";
    try {
      aiCaption = await describeImageWithAI(model, prompt, sourceImageUrl);
    } catch (error) {
      console.error("AI image description failed:", error);
    }

    return Response.json({
      success: true,
      url: cloudinaryUrl,
      source: imageInputUrl ? "input-image" : "fallback-image",
      aiCaption,
      prompt: prompt || "",
    });
  } catch (error) {
    console.error("Image processing error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}

