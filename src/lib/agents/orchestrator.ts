import { findTrendingTopics } from './trendingAgent';
import { processStackOverflow } from './stackoverflowAgent';
import { processGithubIssues } from './githubAgent';
import { generateBlogPost } from './blogWriterAgent';
import { optimizeSeo } from './seoAgent';
import { addImagesToBlog } from './imageAgent';
import { generateMetadata } from './metadataAgent';
import { injectInternalLinks } from './internalLinkAgent';
import { auditAgent } from './auditAgent';
import { saveBlog } from '../tools/dbTool';

export class BlogOrchestrator {
  
  public async runFullPipeline() {
    console.log('🚀 [Orchestrator] Starting Autonomous AI Blog Workflow...');

    try {
      // Step 1: Find topics
      const topics = await findTrendingTopics();
      if (topics.length === 0) {
        console.log('[Orchestrator] No trending topics found. Exiting.');
        return;
      }
      const targetTopic = topics[0];
      console.log(`[Orchestrator] Selected Topic: ${targetTopic.topic}`);

      // Step 2: Gather technical context
      const soIdeas = await processStackOverflow(targetTopic.keywords[0] || 'javascript');
      const ghIdeas = await processGithubIssues('facebook/react'); // Hardcoded repo for demo

      let context = `Trending topic: ${targetTopic.topic}\n\n`;
      if (soIdeas.length > 0) context += `Community Problem: ${soIdeas[0].problem}\nSolution: ${soIdeas[0].solution}\n`;
      if (ghIdeas.length > 0) context += `GitHub Context: ${ghIdeas[0].issue}\nResolution: ${ghIdeas[0].resolution}\n`;

      // Step 3: Write Blog
      let draft = await generateBlogPost(targetTopic.topic, context);

      // Step 4: SEO Optimization
      draft = await optimizeSeo(draft, targetTopic.keywords);

      // Step 5: Add Images
      draft.content = await addImagesToBlog(draft.content, targetTopic.topic);

      // Step 6: Metadata Generation
      const metadata = await generateMetadata(draft.title, draft.content);

      // Step 7: Internal Linking
      draft.content = await injectInternalLinks(draft.content, draft.title);

      // Step 8: Save to Database
      const finalBlogDocument = {
        title: draft.title,
        content: draft.content,
        slug: metadata.slug,
        metaDescription: metadata.metaDescription,
        tags: metadata.tags,
        categories: metadata.categories,
        publishedAt: new Date(),
        status: 'published'
      };

      await saveBlog(finalBlogDocument);
      console.log(`✅ [Orchestrator] Successfully generated and published blog: "${draft.title}"`);

      // Step 9: Audit existing blogs
      await auditAgent.auditBlogs();

    } catch (error) {
      console.error('❌ [Orchestrator] Pipeline failed:', error);
    }
  }
}

// Export a singleton instance
export const orchestrator = new BlogOrchestrator();
