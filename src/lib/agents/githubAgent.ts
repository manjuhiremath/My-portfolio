import { scrapeGithubIssues } from '../tools/scraperTool';
import { generateText } from '../tools/aiTool';

export interface GithubIdea {
  title: string;
  issue: string;
  resolution: string;
  repo: string;
}

export async function processGithubIssues(repo: string): Promise<GithubIdea[]> {
  console.log(`[Github Agent] Scanning resolved issues in ${repo}...`);
  
  const issues = await scrapeGithubIssues(repo);
  const ideas: GithubIdea[] = [];

  // Process top 3 issues
  for (const issue of issues.slice(0, 3)) {
    const prompt = `
GitHub Issue from ${repo}: "${issue.title}"
Body: ${issue.body?.substring(0, 500)}...

This issue is closed/resolved. Extract the technical problem and explain how it was likely solved to form a blog topic.
Format:
Issue: (brief)
Resolution: (brief)
    `;

    const analysis = await generateText(prompt, "You are a developer advocate.");

    const issueMatch = analysis.match(/Issue:\s*(.*)/i);
    const resMatch = analysis.match(/Resolution:\s*([\s\S]*)/i);

    ideas.push({
      title: `Understanding ${repo}: ${issue.title}`,
      issue: issueMatch ? issueMatch[1].trim() : 'Technical issue',
      resolution: resMatch ? resMatch[1].trim() : analysis,
      repo
    });
  }

  return ideas;
}
