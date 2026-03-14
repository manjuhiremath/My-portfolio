'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { PERSONAL_INFO, EXPERIENCE } from '@/lib/constants';

const Hero = () => {
    return (
        <section className="min-h-[90vh] flex items-center justify-center px-6 pt-24 pb-12 bg-white dark:bg-gray-900 transition-colors duration-500 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">System Operational</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.95] font-display">
                        MANJUNATH <span className="text-primary italic">M</span>
                    </h1>
                </div>
                
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed font-body">
                    Full Stack MERN Developer specializing in high-performance web applications, architectural excellence, and modern engineering patterns.
                </p>
                
            </div>

            <button
                onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-8 left-1/2 -trangray-x-1/2 text-gray-300 dark:text-gray-700 hover:text-primary transition-all duration-300 animate-bounce"
                aria-label="Scroll down"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
        </section>
    );
};

export default Hero;
