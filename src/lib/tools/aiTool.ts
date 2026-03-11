/**
 * Generalized AI Tool for text generation.
 * This can be wired up to OpenAI, Anthropic, or Ollama.
 */

export async function generateText(prompt: string, systemRole: string = "You are a senior AI developer and content creator."): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY; // Replace with your primary AI key
  
  if (!apiKey) {
    console.warn("[AI Tool] OPENAI_API_KEY is not set. Using a fallback mock response.");
    return `Mock AI Response for prompt: ${prompt.substring(0, 50)}...
    
# Generated Content

This is an automated fallback response because the AI provider API key was missing.

## Details
- Please configure your environment variables.
- Ensure the AI provider is properly hooked up.
`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", // or 'gpt-3.5-turbo'
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[AI Tool] Error generating text:", error);
    throw error;
  }
}
