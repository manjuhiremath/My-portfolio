import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const blogContentUpdates = {
  'machine-learning-applications': {
    title: "Machine Learning Applications: Transforming Industries in 2026",
    seoTitle: "Machine Learning Applications 2026: Complete Guide",
    seoDescription: "Discover how machine learning applications are revolutionizing healthcare, finance, and technology. Learn about the latest ML use cases and implementations.",
    excerpt: "Explore the transformative power of machine learning applications across healthcare, finance, and technology sectors. Discover practical implementations driving innovation in 2026.",
    content: `
      <h1>Machine Learning Applications: Transforming Industries in 2026</h1>
      <p>Machine learning has evolved from an experimental technology to a fundamental driver of business innovation. In 2026, ML applications are transforming every industry, from healthcare diagnostics to financial forecasting.</p>
      
      <h2>What is Machine Learning?</h2>
      <p>Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It uses algorithms to identify patterns in data and make predictions or decisions.</p>
      
      <h2>Key Machine Learning Applications</h2>
      
      <h3>1. Healthcare and Medical Diagnostics</h3>
      <p>Machine learning is revolutionizing healthcare through improved diagnostics, drug discovery, and personalized treatment plans. ML algorithms can analyze medical images with accuracy surpassing human experts, detecting early signs of diseases like cancer, diabetic retinopathy, and cardiovascular conditions.</p>
      
      <h3>2. Financial Services</h3>
      <p>In finance, ML powers fraud detection systems, algorithmic trading, credit risk assessment, and personalized banking. Banks use machine learning to analyze transaction patterns and identify suspicious activities in real-time, preventing fraudulent transactions before they occur.</p>
      
      <h3>3. Natural Language Processing</h3>
      <p>NLP applications have seen explosive growth with transformer-based models. Virtual assistants, chatbots, language translation, sentiment analysis, and content generation all rely on advanced ML algorithms to understand and generate human language.</p>
      
      <h3>4. Computer Vision</h3>
      <p>Computer vision ML applications include autonomous vehicles, facial recognition systems, quality control in manufacturing, agricultural monitoring, and security surveillance. These systems can identify objects, people, and patterns with remarkable accuracy.</p>
      
      <h3>5. Recommendation Systems</h3>
      <p>Streaming services, e-commerce platforms, and social media use ML to power recommendation engines that personalize user experiences. These systems analyze user behavior, preferences, and historical data to suggest relevant content and products.</p>
      
      <h2>Machine Learning in Business</h2>
      <p>Businesses are leveraging machine learning to optimize operations, improve customer experiences, and drive innovation. From predictive maintenance in manufacturing to customer churn prediction in SaaS companies, ML applications are becoming essential competitive advantages.</p>
      
      <h2>Getting Started with Machine Learning</h2>
      <p>Organizations beginning their ML journey should start with well-defined problems and quality data. Popular ML frameworks include TensorFlow, PyTorch, and scikit-learn. Cloud platforms like AWS, Google Cloud, and Azure provide managed ML services that accelerate deployment.</p>
      
      <h2>Future of Machine Learning</h2>
      <p>The future of ML lies in federated learning, edge computing, and multimodal models. These advances will enable privacy-preserving ML, real-time inference on edge devices, and AI systems that can process multiple types of data simultaneously.</p>
      
      <h2>Conclusion</h2>
      <p>Machine learning applications continue to transform industries, creating new possibilities and efficiencies. Organizations that embrace ML strategically will be better positioned to compete in an increasingly data-driven world.</p>
    `
  },
  
  'getting-started-xai': {
    title: "Getting Started with xAI: Complete Guide to Grok API",
    seoTitle: "Getting Started with xAI API: Grok Tutorial 2026",
    seoDescription: "Learn how to use xAI's Grok API for AI-powered applications. Step-by-step tutorial covering authentication, API calls, and best practices.",
    excerpt: "A comprehensive guide to getting started with xAI's Grok API. Learn authentication, make your first API calls, and build AI-powered applications with Grok models.",
    content: `
      <h1>Getting Started with xAI: Complete Guide to Grok API</h1>
      <p>xAI, founded by Elon Musk, has developed Grok - an AI assistant designed to answer questions with a bit of wit and personality. This guide will walk you through getting started with the xAI API.</p>
      
      <h2>What is xAI and Grok?</h2>
      <p>Grok is xAI's AI assistant that has access to real-time information through the X platform. Unlike other AI assistants, Grok is designed to answer questions with humor and a slightly rebellious attitude while providing helpful information.</p>
      
      <h2>Prerequisites</h2>
      <ul>
        <li>An xAI account with API access</li>
        <li>API key from xAI console</li>
        <li>Basic understanding of REST APIs</li>
        <li>Programming knowledge (Python recommended)</li>
      </ul>
      
      <h2>Setting Up Your Environment</h2>
      <p>First, sign up for xAI and obtain your API key from the developer console. Install the xAI Python SDK or use HTTP requests directly with your preferred programming language.</p>
      
      <h2>Making Your First API Call</h2>
      <p>The Grok API follows REST conventions. You'll need to authenticate using your API key and send prompts to generate responses. The API supports various parameters for controlling output length, creativity, and more.</p>
      
      <h3>Python Example</h3>
      <pre><code>import requests

api_key = "your-api-key"
url = "https://api.x.ai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "model": "grok-2",
    "messages": [
        {"role": "user", "content": "Explain quantum computing in simple terms"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())</code></pre>
      
      <h2>API Parameters</h2>
      <p>Key parameters include model selection, temperature for creativity control, max_tokens for response length, and system messages for setting assistant behavior.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Handle API rate limits gracefully</li>
        <li>Implement proper error handling</li>
        <li>Cache responses when appropriate</li>
        <li>Monitor API usage and costs</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>xAI's Grok API provides a powerful way to integrate AI capabilities into your applications. With proper setup and understanding of the API, you can build innovative solutions powered by Grok's unique capabilities.</p>
    `
  },
  
  'rahul-gandhis-prime-ministerial-ambitions-and-congress-strategy': {
    title: "Rahul Gandhi's PM Ambitions: Congress Strategy for 2024 and Beyond",
    seoTitle: "Rahul Gandhi PM Candidacy: Congress Strategy 2024 Analysis",
    seoDescription: "An in-depth analysis of Rahul Gandhi's prime ministerial ambitions and the Indian National Congress party's electoral strategy for 2024 and beyond.",
    excerpt: "Comprehensive analysis of Rahul Gandhi's political journey and Congress party's strategy as they position for the next general elections. Expert insights on political dynamics.",
    content: `
      <h1>Rahul Gandhi's PM Ambitions: Congress Strategy for 2024 and Beyond</h1>
      <p>Rahul Gandhi, the scion of India's most prominent political family, has been at the center of the Indian National Congress's electoral strategy for over two decades. His journey from a reluctant politician to the principal opposition leader represents one of Indian democracy's most compelling political narratives.</p>
      
      <h2>Rahul Gandhi's Political Journey</h2>
      <p>First elected to Parliament in 2004 from Amethi, Rahul Gandhi has represented constituencies in Uttar Pradesh and served in various party capacities. His political philosophy emphasizes grassroots connectivity, democratic institutions, and inclusive governance.</p>
      
      <h2>Congress Party's Electoral Strategy</h2>
      <p>The Indian National Congress, India's oldest political party, has crafted a multi-pronged strategy to counter the ruling Bharatiya Janata Party. This includes coalition building, regional party alliances, and emphasizing secular governance.</p>
      
      <h3>Key Elements of Congress Strategy</h3>
      <ul>
        <li>Alliance building with regional parties</li>
        <li>Focus on welfare schemes and social justice</li>
        <li>Highlighting economic policies and job creation</li>
        <li>Emphasizing democratic values and institutions</li>
      </ul>
      
      <h2>Challenges and Opportunities</h2>
      <p>The Congress party faces significant challenges including organizational restructuring, generational leadership change, and electoral competition. However, there are opportunities in emerging voter demographics and anti-incumbency sentiments.</p>
      
      <h2>Looking Ahead</h2>
      <p>As India approaches future electoral battles, Rahul Gandhi's leadership and the Congress party's strategic adaptations will significantly influence the country's political landscape. The interplay between tradition and modernization remains crucial.</p>
      
      <h2>Conclusion</h2>
      <p>Rahul Gandhi's political journey reflects the evolving nature of Indian politics. His PM ambitions represent not just personal political aspirations but also broader ideological debates about India's future direction.</p>
    `
  },
  
  'what-ai-tools-will-marketers-be-using-in-2026articulate-marketing': {
    title: "AI Tools for Marketers in 2026: Complete Guide",
    seoTitle: "AI Tools for Marketers 2026: Complete Guide",
    seoDescription: "Discover the top AI tools transforming digital marketing in 2026. From content creation to analytics, learn how AI is revolutionating marketing strategies.",
    excerpt: "Explore the revolutionary AI tools that marketers are using in 2026. Learn how artificial intelligence is transforming content creation, analytics, and marketing automation.",
    content: `
      <h1>AI Tools for Marketers in 2026: Complete Guide</h1>
      <p>Artificial intelligence has become indispensable for modern marketers. In 2026, AI tools are transforming every aspect of digital marketing, from content creation to customer analytics.</p>
      
      <h2>AI in Content Creation</h2>
      <p>AI-powered content tools have evolved to produce high-quality, engaging content at scale. Marketers use these tools for blog posts, social media content, email campaigns, and video scripting. Advanced language models can now adapt tone, style, and voice to match brand guidelines.</p>
      
      <h3>Key AI Content Tools</h3>
      <ul>
        <li>AI writing assistants for content generation</li>
        <li>Image and video creation tools</li>
        <li>Copywriting optimization platforms</li>
        <li>Content repurposing solutions</li>
      </ul>
      
      <h2>AI-Powered Analytics</h2>
      <p>Marketing analytics has been revolutionized by AI's ability to process vast amounts of data and extract actionable insights. Predictive analytics helps marketers anticipate customer behavior and optimize campaigns in real-time.</p>
      
      <h2>Customer Segmentation and Targeting</h2>
      <p>AI algorithms can identify distinct customer segments based on behavior, preferences, and demographics. This enables hyper-targeted marketing campaigns that deliver higher conversion rates and better ROI.</p>
      
      <h2>Chatbots and Customer Service</h2>
      <p>AI-powered chatbots have become sophisticated enough to handle complex customer queries. They provide 24/7 support, qualify leads, and even assist in closing sales.</p>
      
      <h2>Social Media Management</h2>
      <p>AI tools now manage social media presence through automated posting, engagement optimization, trend analysis, and performance tracking. Marketers can focus on strategy while AI handles execution.</p>
      
      <h2>SEO and Search Optimization</h2>
      <p>AI SEO tools analyze search patterns, optimize content for ranking factors, and provide recommendations for improving organic visibility. Understanding search intent has never been more precise.</p>
      
      <h2>Email Marketing Automation</h2>
      <p>AI optimizes email campaigns through send time optimization, subject line testing, content personalization, and automated follow-up sequences. Machine learning continuously improves performance based on engagement data.</p>
      
      <h2>Choosing the Right AI Tools</h2>
      <p>When selecting AI marketing tools, consider integration capabilities, pricing, ease of use, and specific features that align with your marketing objectives.</p>
      
      <h2>Conclusion</h2>
      <p>AI tools have become essential for marketers seeking competitive advantage. Embracing these technologies enables teams to work smarter, create better campaigns, and achieve superior results.</p>
    `
  }
};

async function fixLowScoringBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    const blogs = await db.collection('blogs').find({}).toArray();
    let updated = 0;

    for (const blog of blogs) {
      const updateData = blogContentUpdates[blog.slug];
      if (updateData) {
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: updateData }
        );
        updated++;
        console.log(`Updated: ${blog.slug}`);
      }
    }

    console.log(`\nTotal blogs updated: ${updated}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixLowScoringBlogs();
