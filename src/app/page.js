'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

const Hero = dynamic(() => import('@/components/portfolio/Hero'), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    </div>
  ),
});

const Skills = dynamic(() => import('@/components/portfolio/Skills'), {
  loading: () => <div className="py-20 text-center text-gray-400 font-body text-xs">Synchronizing skills...</div>,
});

const Experience = dynamic(() => import('@/components/portfolio/Experience'), {
  loading: () => <div className="py-20 text-center text-gray-400 font-body text-xs">Tracing professional journey...</div>,
});

const Education = dynamic(() => import('@/components/portfolio/Education'), {
  loading: () => <div className="py-20 text-center text-gray-400 font-body text-xs">Loading academic foundation...</div>,
});

const Projects = dynamic(() => import('@/components/portfolio/Projects'), {
  loading: () => <div className="py-20 text-center text-gray-400 font-body text-xs">Loading projects...</div>,
});

export default function Home() {
    return (
        <main className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-500">
            {/* Streamlined Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
                <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-white p-1">
                            <Image src="/logo.png" alt="Manifesto" width={32} height={32} className="h-full w-full object-contain" />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-gray-900 dark:text-white uppercase font-display leading-none">
                            MANJUNATH <span className="text-primary italic">M</span>
                        </span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
                        <Link href="#skills" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-all">Skills</Link>
                        <Link href="#experience" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-all">Journey</Link>
                        <Link href="#projects" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-all">Work</Link>
                        <Link href="/blog" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-all">Blog</Link>
                        <Link href="/blog" className="rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 shadow-lg active:scale-95 transition-all">
                            Explore
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            
            <Suspense fallback={<div className="py-20 text-center text-gray-400 font-body text-xs">Synchronizing assets...</div>}>
                <div className="max-w-[1200px] mx-auto px-6 pb-20 space-y-20">
                    <Skills />
                    <Experience />
                    <Projects />
                    <Education />
                </div>
            </Suspense>
        </main>
    );
}
