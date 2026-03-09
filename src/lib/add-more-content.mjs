import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

function stripHtml(input = '') {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getWordCount(input = '') {
  return stripHtml(input).split(/\s+/).filter(Boolean).length;
}

const contentAdditions = {
  'rahul-gandhis-prime-ministerial-ambitions-and-congress-strategy': `
    <h2>The Evolution of Indian Politics</h2>
    <p>Indian politics has witnessed significant transformations over the past decade. The political landscape continues to evolve with changing voter demographics, emerging issues, and new political formations. Understanding these dynamics is crucial for analyzing the future of Indian democracy.</p>
    
    <h2>Economic Policies and Their Impact</h2>
    <p>Economic policies play a crucial role in electoral outcomes. The Congress party has emphasized inclusive growth, welfare schemes, and addressing income inequality. Their policy proposals focus on creating jobs, supporting small businesses, and ensuring economic opportunities reach rural India.</p>
    
    <h2>Social Justice and Welfare Schemes</h2>
    <p>The Congress party has historically championed social justice and affirmative action. Their election manifesto typically includes provisions for reservation, welfare schemes for marginalized communities, and measures to address historical injustices.</p>
    
    <h2>Foreign Policy Positioning</h2>
    <p>International relations and foreign policy have become significant electoral issues. The Congress party's approach emphasizes strategic autonomy, maintaining relationships with Western democracies while preserving traditional friendships with Russia's neighbors.</p>
    
    <h2>Youth Engagement and Digital Politics</h2>
    <p>Engaging young voters has become crucial. Digital campaigns, social media presence, and connecting with youth through issues like employment and education have become central to electoral strategies.</p>
    
    <h2>Coalition Politics and Alliances</h2>
    <p>Building successful coalitions with regional parties remains essential for national elections. The Congress has been working on expanding its alliance network to present a unified opposition to the ruling dispensation.</p>
  `,
  
  'what-ai-tools-will-marketers-be-using-in-2026articulate-marketing': `
    <h2>The Evolution of AI in Marketing</h2>
    <p>Artificial intelligence has completely transformed marketing over the past few years. What started as simple automation has evolved into sophisticated machine learning systems capable of predicting consumer behavior, personalizing experiences, and optimizing campaigns in real-time.</p>
    
    <h2>AI for Customer Journey Mapping</h2>
    <p>Marketers now use AI to analyze customer touchpoints across multiple channels. This helps create detailed customer journey maps and identify the most effective touchpoints for engagement and conversion.</p>
    
    <h2>Personalization at Scale</h2>
    <p>AI enables hyper-personalization by analyzing individual user behavior, preferences, and historical data. This allows marketers to deliver highly relevant content, product recommendations, and offers to each customer.</p>
    
    <h2>Predictive Analytics for Campaign Optimization</h2>
    <p>Predictive analytics powered by AI helps forecast campaign performance, identify potential churn, and optimize marketing spend. Marketers can make data-driven decisions that improve ROI significantly.</p>
    
    <h2>Voice Search Optimization</h2>
    <p>With the rise of voice assistants, AI helps optimize content for voice search queries. This includes understanding natural language patterns and optimizing for conversational keywords.</p>
    
    <h2>AI in Advertising</h2>
    <p>Programmatic advertising has been revolutionized by AI. Automated bidding, ad placement optimization, and audience targeting have become more sophisticated, improving ad performance and reducing wasted spend.</p>
    
    <h2>Measuring AI Marketing ROI</h2>
    <p>Understanding the return on investment for AI tools is crucial. Marketers should track metrics like conversion rates, customer lifetime value, and engagement metrics to quantify AI's impact.</p>
  `,
  
  'getting-started-xai': `
    <h2>Advanced Grok API Features</h2>
    <p>The Grok API offers several advanced features that set it apart from other AI APIs. Understanding these capabilities can help developers build more sophisticated applications.</p>
    
    <h2>System Prompts and Behavior Customization</h2>
    <p>One of Grok's strengths is its ability to adapt to different personalities through system prompts. Developers can customize the assistant's tone, knowledge domain, and response style.</p>
    
    <h2>Handling Conversations and Context</h2>
    <p>Maintaining conversation context is crucial for building engaging AI experiences. The API supports multi-turn conversations with proper context management.</p>
    
    <h2>Error Handling and Rate Limits</h2>
    <p>Understanding API rate limits and implementing proper error handling is essential for production applications. The xAI API provides clear documentation on limits and best practices.</p>
    
    <h2>Integrating Grok with Other Services</h2>
    <p>Grok can be integrated with various services including databases, messaging platforms, and automation tools. This enables building comprehensive AI-powered workflows.</p>
    
    <h2>Security Best Practices</h2>
    <p>When using AI APIs, security is paramount. Protect your API keys, validate user inputs, and implement proper access controls to ensure safe deployments.</p>
    
    <h2>Testing and Optimization</h2>
    <p>Regular testing and optimization of AI responses helps improve user experience. Collect feedback and iterate on your implementation for better results.</p>
  `,
  
  'macbook-neo-price-india-specs-availability': `
    <h2>MacBook Neo vs Other Apple Laptops</h2>
    <p>Comparing the MacBook Neo with other laptops in Apple's lineup helps understand its positioning in the market. It bridges the gap between entry-level and mid-range laptops.</p>
    
    <h2>Educational Pricing and Student Discounts</h2>
    <p>Students can avail significant discounts on the MacBook Neo through Apple's Education Store. This makes it an attractive option for students and educators.</p>
    
    <h2>Available Configurations</h2>
    <p>The MacBook Neo comes in multiple storage configurations. Users can choose between 256GB and 512GB SSD options based on their storage needs.</p>
    
    <h2>Accessories and Peripherals</h2>
    <p>Essential accessories for MacBook Neo include USB-C hubs, chargers, and protective cases. Apple's ecosystem offers seamless integration with iPhones and iPads.</p>
    
    <h2>Warranty and AppleCare+</h2>
    <p>Understanding warranty coverage and AppleCare+ options helps make informed purchase decisions. Extended warranty provides additional peace of mind for long-term use.</p>
  `,
  
  'machine-learning-applications': `
    <h2>Machine Learning Implementation Challenges</h2>
    <p>While machine learning offers tremendous benefits, organizations face several challenges in implementation. These include data quality issues, skill gaps, computational costs, and integration with existing systems.</p>
    
    <h2>MLOps and Model Deployment</h2>
    <p>MLOps has emerged as a critical discipline for deploying and maintaining ML models in production. Best practices include version control, automated testing, and continuous monitoring of model performance.</p>
    
    <h2>Ethical Considerations in Machine Learning</h2>
    <p>Ethical AI has become a major concern. Issues like bias in algorithms, privacy implications, and transparency need careful consideration when developing ML applications.</p>
    
    <h2>Cloud vs On-Premise ML</h2>
    <p>Organizations must choose between cloud-based ML services and on-premise infrastructure. Each approach has trade-offs in terms of cost, control, and scalability.</p>
    
    <h2>Future Trends in Machine Learning</h2>
    <p>Emerging trends include federated learning, edge ML, and no-code ML platforms. These developments will make machine learning more accessible and privacy-preserving.</p>
  `
};

async function addMoreContent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const blogs = await db.collection('blogs').find({}).toArray();
    
    let updated = 0;
    for (const blog of blogs) {
      const additionalContent = contentAdditions[blog.slug];
      if (additionalContent) {
        const newContent = (blog.content || '') + additionalContent;
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: { content: newContent } }
        );
        updated++;
        console.log(`Added content to: ${blog.slug} (${getWordCount(newContent)} words)`);
      }
    }

    console.log(`\nTotal blogs updated: ${updated}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

addMoreContent();
