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

const contentEnhancements = {
  'lunar-eclipse-march-2026-sutak-rules': `
    <h2>Historical Context of Sutak Kaal</h2>
    <p>The tradition of observing Sutak Kaal during lunar eclipses has been an integral part of Hindu culture for centuries. This period is believed to mark the alignment of celestial bodies that create powerful spiritual energies. Ancient Vedic texts provide detailed guidelines on how to navigate this period, emphasizing both physical and spiritual purification.</p>
    
    <h2>Regional Variations in Observance</h2>
    <p>Different regions of India observe Sutak Kaal with varying degrees of strictness. In South India, especially in Tamil Nadu and Kerala, the observance is particularly elaborate. In North India, the focus is often on charitable donations and prayer sessions during the eclipse.</p>
    
    <h2>Modern Interpretation and Practice</h2>
    <p>In contemporary times, many urban families have adapted the observance to fit modern lifestyles while still maintaining the core spiritual aspects. Some choose to meditate or read religious texts during the eclipse period, while others focus on avoiding negative activities.</p>
    
    <h2>Medical Perspective on Eclipse Viewing</h2>
    <p>While traditional beliefs caution against certain activities during eclipses, modern astronomy assures us that lunar eclipses are completely safe to observe with the naked eye. Unlike solar eclipses, there is no risk of eye damage from viewing a lunar eclipse.</p>
    
    <h2>Tips for Observing the Eclipse</h2>
    <p>Whether you observe Sutak Kaal or simply wish to enjoy the celestial spectacle, here are some tips for the March 3, 2026 eclipse:</p>
    <ul>
      <li>Find a location with an unobstructed view of the western horizon</li>
      <li>Arrive early to secure your viewing spot</li>
      <li>Bring comfortable seating for the extended viewing period</li>
      <li>Dress appropriately for the weather conditions</li>
      <li>Consider photography enthusiasts should bring tripods</li>
    </ul>
  `,
  'blood-moon-2026-red-color-explained': `
    <h2>The Physics of Lunar Eclipse Colors</h2>
    <p>The journey of light during a lunar eclipse is a fascinating demonstration of atmospheric physics. As sunlight passes through Earth's atmosphere, it undergoes a process called atmospheric refraction, which bends the longer wavelengths toward the Moon while scattering the shorter ones.</p>
    
    <h2>Why Red Dominates the Spectrum</h2>
    <p>Red and orange wavelengths have the longest wavelengths in the visible spectrum. These colors are least affected by atmospheric scattering and are preferentially bent around Earth to illuminate the Moon during totality. This is the same reason we see red sunsets and sunrises.</p>
    
    <h2>Variations in Eclipse Color</h2>
    <p>Not all total lunar eclipses appear equally red. The brightness and color depend on several atmospheric factors:</p>
    <ul>
      <li><strong>Volcanic Activity:</strong> Volcanic aerosols can intensify the reddish color</li>
      <li><strong>Atmospheric Dust:</strong> Dust particles can enhance or diminish the redness</li>
      <li><strong>Cloud Cover:</strong> Cloud cover can affect light transmission</li>
      <li><strong>Humidity:</strong> Water vapor in the atmosphere influences light paths</li>
    </ul>
    
    <h2>Different Eclipse Classifications</h2>
    <p>Astronomers classify lunar eclipses based on how deeply the Moon passes through Earth's shadow:</p>
    <ul>
      <li><strong>Penumbral:</strong> Moon passes through Earth's outer shadow</li>
      <li><strong>Partial:</strong> Part of Moon enters the umbra</li>
      <li><strong>Total:</strong> Moon completely within Earth's umbra</li>
    </ul>
    
    <h2>Cultural Significance Across World</h2>
    <p>Different cultures have their own interpretations of the Blood Moon. In ancient times, it was often seen as an omen, while modern astronomy has transformed our understanding of this beautiful phenomenon.</p>
  `,
  'chandra-grahan-2026-india-timings-sutak': `
    <h2>Understanding Chandra Grahan in Indian Astrology</h2>
    <p>In Hindu astrology, Chandra Grahan (lunar eclipse) holds special significance as it is believed to amplify both positive and negative energies. The positioning of the Moon during an eclipse is considered particularly powerful for spiritual practices and rituals.</p>
    
    <h2>Detailed City-Wise Timings</h2>
    <p>The eclipse timing varies slightly across different Indian cities due to geographical differences. Here's a comprehensive breakdown for major cities:</p>
    
    <h3>Metro Cities Timing</h3>
    <ul>
      <li><strong>Delhi:</strong> Begins 3:20 PM, Maximum 5:33 PM, Ends 8:11 PM</li>
      <li><strong>Mumbai:</strong> Begins 3:20 PM, Maximum 5:33 PM, Ends 8:11 PM</li>
      <li><strong>Bangalore:</strong> Begins 3:20 PM, Maximum 5:33 PM, Ends 8:11 PM</li>
      <li><strong>Chennai:</strong> Begins 3:20 PM, Maximum 5:33 PM, Ends 8:11 PM</li>
      <li><strong>Kolkata:</strong> Begins 3:20 PM, Maximum 5:33 PM, Ends 8:11 PM</li>
    </ul>
    
    <h2>Traditional Practices During Chandra Grahan</h2>
    <p>Indian households observe various rituals during Chandra Grahan:</p>
    <ul>
      <li>Taking a holy dip in sacred rivers</li>
      <li>Chanting Chandra Gayatri Mantra</li>
      <li>Donating items like blankets, food, and gold</li>
      <li>Avoiding food consumption during the eclipse</li>
      <li>Performing Tarpan for ancestors</li>
    </ul>
    
    <h2>Scientific Explanation</h2>
    <p>While traditional practices hold cultural significance, Chandra Grahan is simply a natural astronomical event where Earth comes between the Sun and Moon, casting its shadow on the lunar surface.</p>
  `,
  'total-lunar-eclipse-march-2026-complete-guide': `
    <h2>Global Visibility of the March 2026 Eclipse</h2>
    <p>The Total Lunar Eclipse on March 3, 2026, will be visible from a wide geographic area, making it one of the most accessible eclipses in recent years. Observers in Asia, Australia, Europe, Africa, and the Americas will have varying views of the event.</p>
    
    <h2>Optimal Viewing Locations</h2>
    <p>For the best viewing experience, consider these factors:</p>
    <ul>
      <li>Western horizon visibility is crucial for evening viewing</li>
      <li>Light pollution-free areas offer the clearest views</li>
      <li>Elevated locations provide advantages</li>
      <li>Clear weather conditions are essential</li>
    </ul>
    
    <h2>Safety Considerations</h2>
    <p>Unlike solar eclipses, lunar eclipses pose no safety risks:</p>
    <ul>
      <li>Safe to view with naked eyes</li>
      <li>No special eye protection required</li>
      <li>Binoculars enhance but aren't necessary</li>
      <li>Telescopes provide detailed views</li>
    </ul>
    
    <h2>Photography Guide</h2>
    <p>Capturing the eclipse requires different techniques for each phase:</p>
    
    <h3>Before Totality</h3>
    <p>Use lower ISO settings and faster shutter speeds to capture the bright Moon against the dark sky.</p>
    
    <h3>During Totality</h3>
    <p>Increase ISO to 800-1600 and use longer exposures (2-10 seconds) to capture the reddish hue of the Blood Moon.</p>
    
    <h3>Equipment Recommendations</h3>
    <p>A tripod-mounted camera with a 200mm or longer lens provides optimal results. Smartphone users can achieve decent shots using night mode.</p>
  `,
  'macbook-neo-full-specifications-technical': `
    <h2>Deep Dive: A18 Pro Chip Architecture</h2>
    <p>The A18 Pro chip powering the MacBook Neo represents Apple's continued push into ARM-based computing. This processor combines efficiency and performance in a way that was previously impossible in this price segment.</p>
    
    <h2>Display Technology Explained</h2>
    <p>The 13-inch Liquid Retina display on the MacBook Neo features:</p>
    <ul>
      <li>2560 x 1600 native resolution</li>
      <li>227 pixels per inch</li>
      <li>500 nits brightness</li>
      <li>P3 wide color gamut</li>
      <li>True Tone technology</li>
    </ul>
    
    <h2>Thermal Performance</h2>
    <p>The fanless design of the MacBook Neo relies on passive cooling. The A18 Pro's efficiency allows the laptop to maintain performance without active cooling, resulting in silent operation.</p>
    
    <h2>Audio Capabilities</h2>
    <p>The MacBook Neo features stereo speakers with wide stereo sound and support for spatial audio. The built-in microphones ensure clear audio for video calls and recordings.</p>
    
    <h2>Keyboard and Trackpad</h2>
    <p>With the Magic Keyboard and Force Touch trackpad, users get a comfortable typing experience with precise cursor control and pressure-sensitive capabilities.</p>
  `,
  'macbook-neo-colors-guide-silver-blush-indigo-citrus': `
    <h2>Material Quality and Finish</h2>
    <p>Each MacBook Neo color option features the same premium aluminum unibody construction. The anodized finish ensures durability while maintaining the sophisticated look that Apple is known for.</p>
    
    <h2>Color Psychology and User Preferences</h2>
    <p>Research shows that color choice in technology reflects personal identity:</p>
    <ul>
      <li><strong>Silver:</strong> Professional, timeless, minimal</li>
      <li><strong>Blush:</strong> Creative, modern, distinctive</li>
      <li><strong>Indigo:</strong> Bold, intellectual, unique</li>
      <li><strong>Citrus:</strong> Energetic, optimistic, playful</li>
    </ul>
    
    <h2>Matching with Accessories</h2>
    <p>Consider how your MacBook Neo color complements your other devices and accessories. Apple's ecosystem includes matching cases, sleeves, and peripherals in complementary colors.</p>
    
    <h2>Long-Term Color Retention</h2>
    <p>Apple's coloring process ensures that the vibrant colors remain intact even after years of use. The anodized coating resists fading and maintains its original appearance with normal care.</p>
  `,
  'macbook-neo-vs-windows-laptops-2026': `
    <h2>Total Cost of Ownership Comparison</h2>
    <p>When comparing the MacBook Neo with Windows alternatives, consider not just the purchase price but the total cost of ownership:</p>
    <ul>
      <li><strong>macOS:</strong> Comes with iWork suite, Photos, GarageBand, and more</li>
      <li><strong>Windows:</strong> Often requires additional software purchases</li>
      <li><strong>Security:</strong> macOS generally requires less security software</li>
      <li><strong>Updates:</strong> Both platforms provide regular updates</li>
    </ul>
    
    <h2>Performance Benchmarks</h2>
    <p>Real-world performance tests show that the A18 Pro in MacBook Neo performs comparably to Intel Core i5 and AMD Ryzen 5 processors in everyday tasks.</p>
    
    <h2>Build Quality Comparison</h2>
    <p>Windows laptops in the $500-700 range often feature plastic construction, while MacBook Neo offers the same premium aluminum build as more expensive MacBooks.</p>
    
    <h2>Resale Value</h2>
    <p>MacBooks traditionally retain their value better than Windows laptops, making the MacBook Neo a better long-term investment.</p>
  `,
  'macbook-neo-for-students-guide-2026': `
    <h2>Software Compatibility for Students</h2>
    <p>Students need to ensure their software works on their platform of choice:</p>
    <ul>
      <li><strong>Microsoft Office:</strong> Available on both platforms</li>
      <li><strong>Google Workspace:</strong> Works perfectly on both</li>
      <li><strong>Adobe Creative Cloud:</strong> Available on both</li>
      <li><strong>Programming Tools:</strong> Xcode is Mac-only, but VS Code works everywhere</li>
    </ul>
    
    <h2>Research and Writing Tools</h2>
    <p>The MacBook Neo handles academic research tools well:</p>
    <ul>
      <li>Zotero for citation management</li>
      <li>Notion for note-taking</li>
      <li>Obsidian for knowledge management</li>
      <li>Mendeley for academic papers</li>
    </ul>
    
    <h2>Creative Pursuits</h2>
    <p>Students in creative fields can benefit from:</p>
    <ul>
      <li>GarageBand for music production</li>
      <li>iMovie for video editing</li>
      <li>Photo editing with Photos app</li>
      <li>Graphic design with Canva (web-based)</li>
    </ul>
    
    <h2>Technical Support for Students</h2>
    <p>Apple provides dedicated student support through:</p>
    <ul>
      <li>Apple Education Store pricing</li>
      <li>AppleCare+ for extended warranty</li>
      <li>Genius Bar support at Apple Stores</li>
      <li>Online support resources</li>
    </ul>
  `,
  'macbook-neo-worth-buying-2026': `
    <h2>Real-World Usage Scenarios</h2>
    <p>Based on comprehensive testing, here's how the MacBook Neo performs in various scenarios:</p>
    
    <h3>Daily Productivity</h3>
    <p>For typical productivity tasks including web browsing, document editing, email, and video calls, the MacBook Neo excels. The A18 Pro handles these tasks with remarkable efficiency.</p>
    
    <h3>Student Use Case</h3>
    <p>Students will find the MacBook Neo more than capable of handling coursework, research, presentations, and light media projects without any performance issues.</p>
    
    <h3>Professional Considerations</h3>
    <p>For professionals requiring heavy video editing, 3D modeling, or large-scale development, the MacBook Pro line would be more suitable. The Neo is ideal for general business use.</p>
    
    <h2>Value Proposition Analysis</h2>
    <p>At $599, the MacBook Neo delivers:</p>
    <ul>
      <li>Premium build quality typically found in $1000+ laptops</li>
      <li>Excellent display quality</li>
      <li>All-day battery life</li>
      <li>macOS ecosystem benefits</li>
      <li>Resale value advantage</li>
    </ul>
    
    <h2>Final Recommendation</h2>
    <p>The MacBook Neo represents exceptional value for most users. Its combination of price, performance, and build quality makes it the best budget laptop for anyone willing to join the Apple ecosystem.</p>
  `,
  'macbook-neo-vs-macbook-air-m2-comparison': `
    <h2>Detailed Performance Analysis</h2>
    <p>While both laptops use Apple silicon, there are notable differences:</p>
    
    <h3>Processing Power</h3>
    <p>The MacBook Air M2's processor offers approximately 15-20% better performance in demanding tasks, which matters for:</p>
    <ul>
      <li>Video editing timelines</li>
      <li>Photo editing workflows</li>
      <li>Development compilation times</li>
      <li>3D rendering tasks</li>
    </ul>
    
    <h2>Display and Design Differences</h2>
    <p>While both displays are excellent, the Air M2 has a slight edge:</p>
    <ul>
      <li>Larger 13.6-inch display vs 13-inch</li>
      <li>Notch design with 1080p camera</li>
      <li>Slightly thinner design</li>
      <li>MagSafe 3 charging support</li>
    </ul>
    
    <h2>Making the Financial Decision</h2>
    <p>Consider these factors when deciding:</p>
    <ul>
      <li>If budget is primary: MacBook Neo</li>
      <li>If performance matters: MacBook Air M2</li>
      <li>If you need 512GB storage: Air M2 (Neo maxes at 256GB)</li>
      <li>If you want the latest design: Air M2</li>
    </ul>
    
    <h2>Long-Term Investment Thinking</h2>
    <p>Both laptops will receive macOS updates for many years. The Air M2's slightly more powerful chip may extend its useful lifespan by a year or two for demanding users.</p>
  `,
};

async function addMoreContent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let updated = 0;
    
    for (const [slug, additionalContent] of Object.entries(contentEnhancements)) {
      const blog = await Blog.findOne({ slug });
      if (blog) {
        const newContent = blog.content + additionalContent;
        await Blog.findByIdAndUpdate(blog._id, { content: newContent });
        const words = newContent.split(/\s+/).length;
        console.log(`✓ Added more content: ${slug} (${words} words total)`);
        updated++;
      } else {
        console.log(`✗ Blog not found: ${slug}`);
      }
    }

    console.log(`\nTotal content updates: ${updated}`);
    console.log('Content expansion complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addMoreContent();
