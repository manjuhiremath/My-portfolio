import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "Origins | The Digital Manifesto",
  description: "Discover the vision and mission behind The Digital Manifesto — a platform dedicated to technical excellence and strategic analysis.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 pb-24 transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <header className="mb-16 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary px-1">Foundation</p>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-display">
            The Origins
          </h1>
        </header>
        
        <div className="prose dark:prose-invert max-w-[65ch]">
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">
            The Digital Manifesto is an editorial protocol dedicated to the strategic analysis of high-performance engineering and modern architectural patterns.
          </p>
          
          <div className="space-y-16">
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">The Vision</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                In an era of rapid digital evolution, we provide the technical documentation needed to navigate complex systems. Our mission is to deliver high-quality, research-backed content that explores the intersection of software excellence, global security, and economic shifts.
              </p>
            </section>
            
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">Strategic Coverage</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our analysis is curated across four primary domains of modern infrastructure:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mt-10">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Domain 01</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Systems & AI</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Architectural patterns, autonomous agents, and high-performance computing.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Domain 02</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Global Strategy</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Geopolitics, international relations, and security protocols.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Domain 03</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">War Economics</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Global economy shifts, market volatility, and energy security.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4 block">Domain 04</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Digital Era</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Creator economy, Web3 evolution, and technical innovation.</p>
                </div>
              </div>
            </section>
            
            <section className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-display">Commitment</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-primary pl-8 py-2 bg-slate-50 dark:bg-slate-800/30 rounded-r-2xl font-medium">
                We maintain absolute editorial integrity. Every manifesto is an entry into our collective knowledge graph, designed to empower the modern builder with actionable technical intelligence.
              </p>
            </section>
          </div>
          
          <div className="mt-32 pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center not-prose">
            <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.5em] transition-all">
              ← Terminal
            </Link>
            <Link href="/contact" className="btn btn-primary px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">
              Transmit Signal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
