/**
 * A generalized scraper tool to fetch and parse content from various sources.
 * In a fully robust environment, this would use Cheerio or Puppeteer.
 */

export async function scrapeHackerNews(): Promise<any[]> {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = await res.json();
    const topIds = ids.slice(0, 10);
    
    const stories = await Promise.all(topIds.map(async (id: number) => {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return await itemRes.json();
    }));

    return stories.map(s => ({
      title: s.title,
      url: s.url,
      score: s.score
    }));
  } catch (e) {
    console.error('[Scraper Tool] HackerNews scrape failed', e);
    return [];
  }
}

export async function scrapeStackOverflow(tag: string): Promise<any[]> {
  try {
    const res = await fetch(`https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=${tag}&site=stackoverflow&filter=withbody`);
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    console.error('[Scraper Tool] StackOverflow scrape failed', e);
    return [];
  }
}

export async function scrapeGithubIssues(repo: string): Promise<any[]> {
  try {
    // repo format: "owner/repo"
    const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=closed&sort=comments&direction=desc`);
    const issues = await res.json();
    return Array.isArray(issues) ? issues.slice(0, 10) : [];
  } catch (e) {
    console.error('[Scraper Tool] Github scrape failed', e);
    return [];
  }
}
