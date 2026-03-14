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
  loading: () => <div className="py-20 text-center text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-900">Loading skills...</div>,
});

const Projects = dynamic(() => import('@/components/portfolio/Projects'), {
  loading: () => <div className="py-20 text-center text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-900">Loading projects...</div>,
});

export default function Home() {
    return (
        <main className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-500 overflow-hidden">
            <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50 transition-all duration-500">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white p-1">
                            <Image src="/logo.png" alt="Manifesto" width={40} height={40} className="h-full w-full object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase font-display leading-none">
                            THE <span className="text-primary italic">MANIFESTO.</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-8">
                        <Link href="/blog" className="text-gray-700 dark:text-gray-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.3em]">
                            Library
                        </Link>
                        <Link href="/about" className="text-gray-700 dark:text-gray-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.3em]">
                            Origins
                        </Link>
                        <Link href="/blog" className="btn btn-primary px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20">
                            Enter Archive
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            
            <Suspense fallback={<div className="py-20 text-center text-gray-600 dark:text-gray-400" aria-live="polite">Loading...</div>}>
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-32 space-y-32">
                    <Skills />
                    <Projects />
                </div>
            </Suspense>
            <Footer />
        </main>
    );
}
