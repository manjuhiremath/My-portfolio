import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const seoOptimizations = [
  // Lunar Eclipse Articles
  {
    slug: 'lunar-eclipse-march-2026-sutak-rules',
    seoTitle: 'Lunar Eclipse Sutak Kaal: Rules & Guidelines 2026',
    seoDescription: 'Complete guide to Sutak Kaal rules during Total Lunar Eclipse March 2026. Learn restrictions, precautions, and spiritual practices for Chandra Grahan in India.',
    excerpt: 'Complete guide to Sutak Kaal rules during Total Lunar Eclipse March 2026. Learn about restrictions, precautions, and spiritual practices for Chandra Grahan in India.',
  },
  {
    slug: 'blood-moon-2026-red-color-explained',
    seoTitle: 'Blood Moon 2026: Why Moon Turns Red',
    seoDescription: 'Discover why the Moon turns red during Total Lunar Eclipse. Learn about Rayleigh scattering and the science behind the Blood Moon phenomenon on March 3, 2026.',
    excerpt: 'Explore the science behind Blood Moon 2026 - why the Moon turns red during total lunar eclipses. Understanding Rayleigh scattering and the physics of lunar eclipses.',
  },
  {
    slug: 'chandra-grahan-2026-india-timings-sutak',
    seoTitle: 'Chandra Grahan 2026 India: Timings & Sutak',
    seoDescription: 'Complete timings for Chandra Grahan (Total Lunar Eclipse) in India on March 3, 2026. View visibility, Sutak Kaal timings, and eclipse details for all cities.',
    excerpt: 'Complete Chandra Grahan 2026 India timings - Total Lunar Eclipse on March 3, 2026. View visibility, Sutak Kaal, and details for all major Indian cities.',
  },
  {
    slug: 'total-lunar-eclipse-march-2026-complete-guide',
    seoTitle: 'Total Lunar Eclipse March 2026: Complete Guide',
    seoDescription: 'Complete guide to Total Lunar Eclipse on March 3, 2026. Everything about Chandra Grahan - timings, visibility, science, and viewing tips for India.',
    excerpt: 'Complete guide to Total Lunar Eclipse March 3, 2026 - Chandra Grahan with timings, visibility in India, science, and viewing tips for skywatchers.',
  },
  // MacBook Neo Articles
  {
    slug: 'macbook-neo-full-specifications-technical',
    seoTitle: 'MacBook Neo Specs: Complete Technical Details',
    seoDescription: 'Full technical specifications of MacBook Neo including A18 Pro chip, 13-inch Retina display, memory, storage, battery life, and connectivity options.',
    excerpt: 'Complete MacBook Neo specifications including A18 Pro chip, 13-inch display, 8GB RAM, 256GB SSD, battery life, and all connectivity options.',
  },
  {
    slug: 'macbook-neo-colors-guide-silver-blush-indigo-citrus',
    seoTitle: 'MacBook Neo Colors: Choose Your Style',
    seoDescription: 'Explore the four vibrant colors of MacBook Neo - Silver, Blush Pink, Indigo, and Citrus Yellow. Choose the perfect color for your style.',
    excerpt: 'Guide to MacBook Neo colors: Silver, Blush Pink, Indigo, and Citrus Yellow. Find the perfect MacBook Neo color to match your personality.',
  },
  {
    slug: 'macbook-neo-vs-windows-laptops-2026',
    seoTitle: 'MacBook Neo vs Windows Laptops 2026',
    seoDescription: 'Compare MacBook Neo with best Windows laptops under $600. Find out which budget laptop offers better performance, display, and value in 2026.',
    excerpt: 'MacBook Neo vs Windows laptops comparison. Find the best budget laptop under $600 - MacBook Neo or Windows alternatives in 2026.',
  },
  {
    slug: 'macbook-neo-for-students-guide-2026',
    seoTitle: 'MacBook Neo for Students: Best Budget Laptop',
    seoDescription: 'MacBook Neo is perfect for students. Learn why it is the best budget laptop for college in 2026 with features, price, and student discounts.',
    excerpt: 'Complete guide to MacBook Neo for students. Discover why it is the best budget laptop for college students in 2026 with amazing discounts.',
  },
  {
    slug: 'macbook-neo-worth-buying-2026',
    seoTitle: 'Is MacBook Neo Worth Buying? Honest Review',
    seoDescription: 'Honest MacBook Neo review covering performance, display quality, battery life, pros and cons. Find out if MacBook Neo is worth buying in 2026.',
    excerpt: 'Is MacBook Neo worth buying? Honest review of Apple\'s budget laptop - performance, display, battery, pros & cons in 2026.',
  },
  {
    slug: 'macbook-neo-vs-macbook-air-m2-comparison',
    seoTitle: 'MacBook Neo vs Air M2: Which to Buy?',
    seoDescription: 'Compare MacBook Neo with MacBook Air M2. Find which Apple laptop offers better value - budget Neo or premium Air in 2026.',
    excerpt: 'MacBook Neo vs MacBook Air M2 comparison. Which Apple laptop should you buy? Detailed comparison of specs, price, and features.',
  },
  {
    slug: 'macbook-neo-price-india-specs-availability',
    seoTitle: 'MacBook Neo Price in India: Starting ₹69,900',
    seoDescription: 'MacBook Neo price in India starting at ₹69,900. Check specs, availability, colors, and best deals on Apple\'s most affordable MacBook in India.',
    excerpt: 'MacBook Neo price in India starts at ₹69,900. Complete guide to specs, availability, colors, and the best deals on Apple\'s cheapest MacBook.',
  },
  {
    slug: 'macbook-neo-apple-most-affordable-laptop',
    seoTitle: 'MacBook Neo: Apple\'s Most Affordable Laptop',
    seoDescription: 'Discover MacBook Neo - Apple\'s most affordable laptop starting at $599. Features A18 Pro chip, 13-inch Retina display, and four vibrant colors.',
    excerpt: 'Discover the all-new MacBook Neo - Apple\'s cheapest laptop starting at $599. Features A18 Pro chip, 13-inch display, and vibrant colors.',
  },
];

const contentEnhancements = {
  'lunar-eclipse-march-2026-sutak-rules': `
    <h2>Understanding Sutak Kaal During Lunar Eclipse</h2>
    <p>Sutak Kaal is a period of inauspiciousness observed during lunar eclipses in Hindu tradition. During this time, devotees are advised to observe certain restrictions and engage in spiritual practices. The duration of Sutak Kaal varies depending on the type of eclipse.</p>
    
    <h2>March 3, 2026 Total Eclipse: Sutak Kaal Timings</h2>
    <p>The Total Lunar Eclipse on March 3, 2026, will be visible across India. Sutak Kaal begins approximately 9 hours before the eclipse reaches its maximum phase. During this period, devotees are advised to:</p>
    <ul>
      <li>Avoid cooking and eating food</li>
      <li>Refrain from sleeping during the eclipse</li>
      <li>Chant mantras and prayers</li>
      <li>Take a bath after the eclipse ends</li>
      <li>Donate food and clothes to the poor</li>
    </ul>
    
    <h2>Scientific Perspective vs Traditional Beliefs</h2>
    <p>While Sutak Kaal has deep cultural significance, modern science suggests that lunar eclipses pose no health risks to healthy individuals. However, many people continue to observe these traditions as part of their cultural heritage and spiritual practice.</p>
    
    <h2>Precautions During Sutak Kaal</h2>
    <p>Traditional guidelines suggest avoiding the following activities during Sutak Kaal:</p>
    <ul>
      <li>Consuming food or water</li>
      <li>Performing puja or religious ceremonies</li>
      <li>Cutting vegetables or cooking</li>
      <li>Sleeping or lying down</li>
      <li>Shaving or cutting hair</li>
    </ul>
    
    <h2>After Eclipse: Paushan Pratihara</h2>
    <p>After the eclipse concludes, devotees perform Paushan Pratihara - a ritual to mark the end of the inauspicious period. This includes taking a holy bath, changing into clean clothes, and performing puja.</p>
  `,
  'blood-moon-2026-red-color-explained': `
    <h2>The Science Behind the Blood Moon</h2>
    <p>A "Blood Moon" occurs during a total lunar eclipse when the Earth positioned between the Sun and Moon casts a shadow that completely covers the lunar surface. Despite being in Earth's shadow, the Moon doesn't go completely dark. Instead, it appears to turn reddish-orange, hence the name "Blood Moon."</p>
    
    <h2>Rayleigh Scattering: The Key to the Red Color</h2>
    <p>The reddish color of the Blood Moon is caused by Rayleigh scattering - the same phenomenon that gives us red sunrises and sunsets. Here's how it works:</p>
    
    <h3>How Light Behaves During an Eclipse</h3>
    <p>When sunlight enters Earth's atmosphere, shorter wavelengths (blue and violet) are scattered in all directions by gas molecules. Longer wavelengths (red and orange) pass through more easily and are refracted (bent) into Earth's shadow cone, ultimately reaching the Moon's surface.</p>
    
    <h2>Factors Affecting Blood Moon Color</h2>
    <p>The intensity of the red color can vary depending on several factors:</p>
    <ul>
      <li><strong>Atmospheric conditions:</strong> Dust, pollution, and clouds can affect the color intensity</li>
      <li><strong>Position of the Moon:</strong> The deeper the Moon is in Earth's umbra, the redder it appears</li>
      <li><strong>Recent volcanic activity:</strong> Volcanic eruptions can add particles to the atmosphere, intensifying the red color</li>
    </ul>
    
    <h2>Historical Significance of Blood Moons</h2>
    <p>Throughout history, lunar eclipses have been viewed with both fear and wonder. Many ancient cultures believed Blood Moons were omens of significant events, whether disasters or transformations.</p>
    
    <h2>Viewing the Blood Moon in 2026</h2>
    <p>The Total Lunar Eclipse on March 3, 2026, offers an excellent opportunity to witness this celestial phenomenon. Unlike solar eclipses, lunar eclipses are completely safe to view with the naked eye - no special equipment is required.</p>
  `,
  'chandra-grahan-2026-india-timings-sutak': `
    <h2>Chandra Grahan 2026: India Timings</h2>
    <p>The Total Lunar Eclipse (Chandra Grahan) on March 3, 2026, will be visible across most parts of India. This is a significant astronomical event that has been eagerly anticipated by skywatchers and those interested in celestial phenomena.</p>
    
    <h2>Eclipse Timings for Major Indian Cities</h2>
    <p>The eclipse will begin in the late afternoon and continue into the evening, making it ideal for viewing across India. Here are the key timings:</p>
    <ul>
      <li><strong>Eclipse Begins:</strong> 3:20 PM IST</li>
      <li><strong>Partial Eclipse Begins:</strong> 4:28 PM IST</li>
      <li><strong>Totality Begins:</strong> 5:33 PM IST</li>
      <li><strong>Maximum Eclipse:</strong> 5:33 PM IST</li>
      <li><strong>Totality Ends:</strong> 6:47 PM IST</li>
      <li><strong>Eclipse Ends:</strong> 8:11 PM IST</li>
    </ul>
    
    <h2>Visibility Across India</h2>
    <p>This eclipse will be visible throughout India, with optimal viewing conditions in:</p>
    <ul>
      <li>Delhi NCR</li>
      <li>Mumbai</li>
      <li>Bangalore</li>
      <li>Chennai</li>
      <li>Kolkata</li>
      <li>Hyderabad</li>
      <li>Pune</li>
      <li>All major cities</li>
    </ul>
    
    <h2>Best Viewing Practices</h2>
    <p>For the best viewing experience:</p>
    <ul>
      <li>Find a location with a clear view of the western horizon</li>
      <li>Arrive before sunset to set up your viewing position</li>
      <li>Use binoculars for a closer look (optional)</li>
      <li>Allow your eyes to adjust to the darkness</li>
    </ul>
    
    <h2>Cultural Significance in India</h2>
    <p>In Indian tradition, Chandra Grahan holds immense spiritual significance. Many temples perform special pujas during this time, and devotees observe fasting and prayer rituals.</p>
  `,
  'total-lunar-eclipse-march-2026-complete-guide': `
    <h2>Total Lunar Eclipse March 2026: Overview</h2>
    <p>The Total Lunar Eclipse on March 3, 2026, promises to be a spectacular celestial event visible across India and much of Asia, Europe, Africa, and Australia. This comprehensive guide covers everything you need to know about this astronomical phenomenon.</p>
    
    <h2>What is a Total Lunar Eclipse?</h2>
    <p>A total lunar eclipse occurs when the Earth passes directly between the Sun and Moon, casting a complete shadow (umbra) on the lunar surface. During totality, the Moon appears to turn a reddish-copper color, often called a "Blood Moon."</p>
    
    <h2>Eclipse Phases</h2>
    <p>The eclipse progresses through several distinct phases:</p>
    <ul>
      <li><strong>Penumbral Eclipse:</strong> Moon enters Earth's outer shadow</li>
      <li><strong>Partial Eclipse:</strong> Moon begins entering Earth's inner shadow</li>
      <li><strong>Totality:</strong> Moon completely within Earth's umbra</li>
      <li><strong>Partial Eclipse (End):</strong> Moon exits the umbra</li>
      <li><strong>Penumbral Eclipse (End):</strong> Moon exits the penumbra</li>
    </ul>
    
    <h2>Viewing Tips for the Best Experience</h2>
    <p>To make the most of this celestial event:</p>
    <ul>
      <li>Choose a location with minimal light pollution</li>
      <li>Check weather forecasts before heading out</li>
      <li>Bring warm clothing if viewing in cool weather</li>
      <li>Allow 20-30 minutes for your eyes to adapt to darkness</li>
      <li>Consider using binoculars for enhanced viewing</li>
    </ul>
    
    <h2>Photography Tips</h2>
    <p>Capturing the eclipse requires patience and the right settings:</p>
    <ul>
      <li>Use a tripod for stability</li>
      <li>Set ISO between 400-800</li>
      <li>Use a remote shutter or timer to avoid camera shake</li>
      <li>During totality, use longer exposures (2-10 seconds)</li>
    </ul>
  `,
  'macbook-neo-full-specifications-technical': `
    <h2>MacBook Neo: Complete Technical Specifications</h2>
    <p>Apple's most affordable laptop brings powerful features to a new price point. Here's a detailed look at the technical specifications that make the MacBook Neo an impressive entry-level machine.</p>
    
    <h2>Processor and Performance</h2>
    <p>The MacBook Neo is powered by Apple's A18 Pro chip, featuring a 6-core CPU and 5-core GPU. This processor handles everyday tasks with ease, from web browsing to document editing and light photo editing.</p>
    
    <h2>Display Technology</h2>
    <p>The 13-inch Liquid Retina display delivers stunning visuals with 500 nits of brightness, P3 wide color gamut, and True Tone technology for comfortable viewing in any lighting condition.</p>
    
    <h2>Memory and Storage</h2>
    <p>With 8GB of unified memory and 256GB SSD storage, the MacBook Neo provides snappy performance for typical workflows. The SSD ensures fast app launches and quick file access.</p>
    
    <h2>Battery Life</h2>
    <p>Apple claims up to 18 hours of battery life for the MacBook Neo, making it perfect for full-day use without worrying about charging.</p>
    
    <h2>Connectivity Options</h2>
    <p>The MacBook Neo includes two USB-C ports with Thunderbolt support and MagSafe charging, providing flexibility for peripherals and charging needs.</p>
  `,
  'macbook-neo-colors-guide-silver-blush-indigo-citrus': `
    <h2>MacBook Neo Colors: Find Your Perfect Match</h2>
    <p>Apple has introduced four stunning colors for the MacBook Neo, allowing users to express their personal style. Let's explore each option in detail to help you make the right choice.</p>
    
    <h2>Silver: Classic Elegance</h2>
    <p>The timeless Silver finish represents Apple's signature aesthetic. It complements any environment, from professional offices to creative studios. Silver remains the most popular choice for those who prefer understated sophistication.</p>
    
    <h2>Blush Pink: Modern Romance</h2>
    <p>The Blush Pink option brings a fresh, contemporary feel to the MacBook Neo. This soft pink hue appeals to users who want their laptop to stand out while maintaining elegance.</p>
    
    <h2>Indigo: Bold Creativity</h2>
    <p>Indigo offers a deep, rich blue that makes a statement without being overly flashy. This color choice resonates with creative professionals and those who appreciate distinctive aesthetics.</p>
    
    <h2>Citrus Yellow: Vibrant Energy</h2>
    <p>The Citrus Yellow option brings unprecedented energy to the MacBook lineup. This bright, cheerful yellow is perfect for users who want their device to reflect their vibrant personality.</p>
    
    <h2>Choosing the Right Color</h2>
    <p>Consider your personal style, usage environment, and preferences when selecting your MacBook Neo color. All options feature the same premium finish and durability.</p>
  `,
  'macbook-neo-vs-windows-laptops-2026': `
    <h2>MacBook Neo vs Windows Laptops: The Ultimate Comparison</h2>
    <p>With the introduction of the MacBook Neo at $599, budget laptop buyers now have an exciting new option. Let's see how it compares with the best Windows alternatives in the same price range.</p>
    
    <h2>Price Comparison</h2>
    <p>The MacBook Neo starts at $599, undercutting most premium Windows ultrabooks while offering similar or better specifications than laptops in the $500-700 range.</p>
    
    <h2>Performance Analysis</h2>
    <p>Thanks to Apple's efficient A18 Pro chip, the MacBook Neo delivers performance that rivals Windows laptops with Intel Core i5 or AMD Ryzen 5 processors, often with better battery life.</p>
    
    <h2>Display Quality</h2>
    <p>The MacBook Neo's 13-inch Liquid Retina display outperforms most Windows laptops in this price range, offering higher resolution, better color accuracy, and True Tone technology.</p>
    
    <h2>Software Ecosystem</h2>
    <p>Windows laptops offer broader software compatibility, while MacBook Neo provides seamless integration with Apple ecosystem, including iPhone, iPad, and Apple Watch.</p>
    
    <h2>Verdict</h2>
    <p>For users already invested in the Apple ecosystem, the MacBook Neo represents excellent value. Windows laptop buyers should consider their specific software needs when making a decision.</p>
  `,
  'macbook-neo-for-students-guide-2026': `
    <h2>MacBook Neo for Students: The Complete Guide</h2>
    <p>The MacBook Neo has emerged as one of the best laptops for students in 2026. Its affordable price point combined with powerful features makes it ideal for academic use.</p>
    
    <h2>Academic Performance</h2>
    <p>Students will find the MacBook Neo more than capable of handling their academic workload, from research and writing to presentations and video conferencing.</p>
    
    <h2>Portability for Campus Life</h2>
    <p>Weighing just 1.22 kg, the MacBook Neo is perfect for students carrying their laptop between classes, the library, and study groups.</p>
    
    <h2>Battery Life for Full School Days</h2>
    <p>With up to 18 hours of battery life, students can use the MacBook Neo throughout the school day without hunting for outlets.</p>
    
    <h2>Student Discounts and Deals</h2>
    <p>Apple offers educational pricing, making the MacBook Neo even more affordable for students with valid .edu email addresses.</p>
    
    <h2>Best Apps for Students</h2>
    <p>Essential apps include Microsoft Office, Google Workspace, Notability, and various productivity tools available on macOS.</p>
  `,
  'macbook-neo-worth-buying-2026': `
    <h2>Is MacBook Neo Worth Buying? Honest Assessment</h2>
    <p>After analyzing the features, performance, and value proposition of the MacBook Neo, here's our comprehensive assessment to help you decide if it's the right laptop for you.</p>
    
    <h2>Strengths of MacBook Neo</h2>
    <ul>
      <li>Excellent value for money at $599</li>
      <li>Powerful A18 Pro processor</li>
      <li>Beautiful Retina display</li>
      <li>All-day battery life</li>
      <li>Premium build quality</li>
      <li>macOS ecosystem integration</li>
    </ul>
    
    <h2>Potential Considerations</h2>
    <ul>
      <li>Limited to 8GB RAM (not upgradeable)</li>
      <li>256GB storage may be limiting for some</li>
      <li>Only two USB-C ports</li>
    </ul>
    
    <h2>Who Should Buy MacBook Neo?</h2>
    <p>The MacBook Neo is perfect for students, first-time laptop buyers, and those seeking an affordable MacBook experience. It's particularly ideal for users in the Apple ecosystem who want macOS without the premium price.</p>
    
    <h2>Verdict</h2>
    <p>Yes, the MacBook Neo is worth buying in 2026 for anyone seeking an affordable, capable laptop with Apple's quality and ecosystem.</p>
  `,
  'macbook-neo-vs-macbook-air-m2-comparison': `
    <h2>MacBook Neo vs MacBook Air M2: Detailed Comparison</h2>
    <p>Choosing between MacBook Neo and MacBook Air M2? Let's break down the differences to help you make the best choice for your needs and budget.</p>
    
    <h2>Price Difference</h2>
    <p>The MacBook Neo starts at $599, while the MacBook Air M2 starts at $999 - a $400 difference that warrants careful consideration.</p>
    
    <h2>Performance Comparison</h2>
    <p>Both laptops handle everyday tasks smoothly, but the MacBook Air M2 offers slightly better performance for demanding workflows like video editing.</p>
    
    <h2>Display Differences</h2>
    <p>The MacBook Air M2 features a slightly larger 13.6-inch display with higher brightness (500 nits vs 500 nits), but both deliver excellent visual quality.</p>
    
    <h2>Battery Life</h2>
    <p>Both models offer impressive all-day battery life, though the Air M2 edges ahead with up to 18 hours compared to the Neo's 18 hours.</p>
    
    <h2>Which Should You Choose?</h2>
    <p>Choose MacBook Neo if budget is primary concern. Choose MacBook Air M2 if you need maximum performance and can justify the premium.</p>
  `,
};

async function optimizeBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let updated = 0;
    
    // Update SEO metadata
    for (const opt of seoOptimizations) {
      const blog = await Blog.findOne({ slug: opt.slug });
      if (blog) {
        const updates = {};
        if (opt.seoTitle) updates.seoTitle = opt.seoTitle;
        if (opt.seoDescription) updates.seoDescription = opt.seoDescription;
        if (opt.excerpt) updates.excerpt = opt.excerpt;
        
        if (Object.keys(updates).length > 0) {
          await Blog.findByIdAndUpdate(blog._id, updates);
          console.log(`✓ Updated SEO metadata: ${opt.slug}`);
          updated++;
        }
      } else {
        console.log(`✗ Blog not found: ${opt.slug}`);
      }
    }

    // Add content enhancements
    for (const [slug, additionalContent] of Object.entries(contentEnhancements)) {
      const blog = await Blog.findOne({ slug });
      if (blog) {
        const newContent = blog.content + additionalContent;
        await Blog.findByIdAndUpdate(blog._id, { content: newContent });
        console.log(`✓ Added content: ${slug}`);
        updated++;
      } else {
        console.log(`✗ Blog not found for content: ${slug}`);
      }
    }

    console.log(`\nTotal updates: ${updated}`);
    console.log('SEO Optimization complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

optimizeBlogs();
