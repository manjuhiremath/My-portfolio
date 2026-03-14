import Link from 'next/link';
import { FiMail, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import ContactForm from './ContactForm';

export const metadata = {
  title: "Protocol | The Digital Manifesto",
  description: "Communication channels for The Digital Manifesto platform. Strategic inquiries and technical contributions.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-32 pb-24 transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <header className="mb-16 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary px-1">Interface</p>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-display">
            Communication Protocol
          </h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-5 space-y-12">
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              We maintain open channels for strategic inquiries, technical analysis feedback, and architectural contributions.
            </p>
            
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft group-hover:border-primary/30 transition-all duration-300">
                  <FiMail className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Editorial</h3>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">protocol@manjuhiremath.in</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft group-hover:border-primary/30 transition-all duration-300">
                  <FiLinkedin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Corporate</h3>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                    Institutional Presence
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft group-hover:border-primary/30 transition-all duration-300">
                  <FiGithub className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Open Source</h3>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                    Technical Repository
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7">
            <div className="bg-slate-50 dark:bg-slate-800/30 p-10 lg:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Signal Transmission</h2>
              <ContactForm />
            </div>
          </div>
        </div>
        
        <div className="mt-32 pt-12 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.5em] transition-all">
            ← Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
