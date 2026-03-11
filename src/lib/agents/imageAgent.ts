import { searchStockImage, uploadImage } from '../tools/cloudinaryTool';
import { generateText } from '../tools/aiTool';

export async function addImagesToBlog(content: string, topic: string): Promise<string> {
  console.log(`[Image Agent] Analyzing topic "${topic}" for image injection...`);

  // 1. Identify 2-3 logical places to insert images
  // For simplicity, we will just insert a featured image at the top
  const aiPrompt = `Generate a highly specific search query to find a stock image representing: ${topic}`;
  const searchQuery = await generateText(aiPrompt, "You output only short search queries.");

  // 2. Fetch an image URL
  const rawImageUrl = await searchStockImage(searchQuery.trim());

  // 3. Upload to Cloudinary to host it securely
  const hostedUrl = await uploadImage(rawImageUrl, 'automated_blogs');
  const finalUrl = hostedUrl || rawImageUrl; // Fallback to raw if upload fails

  // 4. Generate Alt Text
  const altText = await generateText(`Write a short, descriptive alt text for an image about: ${topic}`);

  // 5. Inject into content
  const markdownImage = `\n![${altText.trim()}](${finalUrl})\n\n`;
  
  // Insert after the H1
  const contentParts = content.split('\n');
  if (contentParts[0].startsWith('# ')) {
    contentParts.splice(1, 0, markdownImage);
  } else {
    contentParts.unshift(markdownImage);
  }

  return contentParts.join('\n');
}
