import { scrapeStackOverflow } from '../tools/scraperTool';
import { generateText } from '../tools/aiTool';

export interface StackOverflowIdea {
  title: string;
  problem: string;
  solution: string;
  sourceUrl: string;
}

export async function processStackOverflow(tag: string = 'reactjs'): Promise<StackOverflowIdea[]> {
  console.log(`[StackOverflow Agent] Scanning for tag: ${tag}...`);
  
  const questions = await scrapeStackOverflow(tag);
  if (!questions || questions.length === 0) return [];

  // Take top 3 questions
  const topQuestions = questions.slice(0, 3);
  const ideas: StackOverflowIdea[] = [];

  for (const q of topQuestions) {
    const prompt = `
I have a StackOverflow question: "${q.title}"
Convert this developer problem and its typical solution into a structured blog idea.
Provide:
Problem: (brief summary)
Solution: (brief summary)
    `;

    const summary = await generateText(prompt, "You are a technical writer.");
    
    // Naive parsing
    const problemMatch = summary.match(/Problem:\s*(.*)/i);
    const solutionMatch = summary.match(/Solution:\s*([\s\S]*)/i);

    ideas.push({
      title: `How to solve: ${q.title}`,
      problem: problemMatch ? problemMatch[1].trim() : 'Unknown problem',
      solution: solutionMatch ? solutionMatch[1].trim() : summary,
      sourceUrl: q.link
    });
  }

  return ideas;
}
