import { getAllBlogs, updateBlog } from '../tools/dbTool';
import { calculateSeoScore } from '../tools/seoTool';

export class AuditAgent {
  public async auditBlogs(): Promise<void> {
    console.log('[Audit Agent] Starting full blog audit...');
    
    try {
      const blogs = await getAllBlogs();
      console.log(`[Audit Agent] Found ${blogs.length} blogs to audit.`);

      for (const blog of blogs) {
        let needsUpdate = false;
        const updates: any = {};

        // Check SEO score
        const content = blog.content || '';
        const keywords = blog.tags || [];
        const seoScore = calculateSeoScore(content, blog.title || '', keywords);
        
        if (seoScore < 70) {
          console.log(`[Audit Agent] Blog "${blog.title}" has low SEO score: ${seoScore}`);
          updates.seoAuditFlag = true;
          updates.lastAuditScore = seoScore;
          needsUpdate = true;
        }

        // Check missing metadata
        if (!blog.metaDescription || blog.metaDescription.length < 50) {
          console.log(`[Audit Agent] Blog "${blog.title}" has missing/short meta description.`);
          updates.needsMetaUpdate = true;
          needsUpdate = true;
        }

        // Update DB if necessary
        if (needsUpdate) {
          await updateBlog(blog._id.toString(), updates);
          console.log(`[Audit Agent] Updated audit metadata for "${blog.title}".`);
        }
      }

      console.log('[Audit Agent] Audit complete.');
    } catch (error) {
      console.error('[Audit Agent] Audit failed:', error);
    }
  }
}

export const auditAgent = new AuditAgent();