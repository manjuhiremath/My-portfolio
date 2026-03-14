'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PERSONAL_INFO, EXPERIENCE } from '@/lib/constants';

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-white dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden">
            {/* Background Architectural Patterns */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(var(--gray-200)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-5xl mx-auto text-center relative z-10 space-y-12">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">System Status: Operational</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[calc(-0.05em)] text-slate-900 dark:text-white leading-[0.9] font-display">
                        The <span className="text-primary italic">Digital</span><br />Manifesto.
                    </h1>
                </div>
                
                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                    Analyzing the strategic architecture of the digital era. A weekly journal exploring technical excellence, high-performance code, and modern engineering patterns.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                    <Link
                        href="/blog"
                        className="group inline-flex items-center gap-4 rounded-2xl bg-slate-900 dark:bg-white px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 hover:bg-primary hover:text-white active:scale-95"
                    >
                        Access The Archive
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                    <Link
                        href="/about"
                        className="group inline-flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-800 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
                    >
                        The Origins
                    </Link>
                </div>
                
                <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Published</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">410+</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Readers</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">50K+</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Efficiency</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">99.9%</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Stability</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">STABLE</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-300 hover:text-primary transition-all duration-300 animate-bounce"
                aria-label="Scroll down"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
        </section>
    );
};

export default Hero;
