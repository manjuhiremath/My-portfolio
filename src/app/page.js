'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Image from 'next/image';

const Hero = dynamic(() => import('@/components/portfolio/Hero'), {
  ssr: true,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
  ),
});

const Skills = dynamic(() => import('@/components/portfolio/Skills'), {
  loading: () => <div className="py-20 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">Loading skills...</div>,
});

const Projects = dynamic(() => import('@/components/portfolio/Projects'), {
  loading: () => <div className="py-20 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">Loading projects...</div>,
});

const Links = dynamic(() => import('@/components/portfolio/Links'), {
  loading: () => <div className="py-20 text-center text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900">Loading links...</div>,
});

export default function Home() {
    return (
        <main className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-500">
            <nav className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                        <Image src="/logo.png" alt="Manjunath M Logo" width={40} height={40} className="object-contain rounded-md" />
                        <span>Manjunath M</span>
                    </a>
                    <div className="flex gap-6">
                        <a href="#skills" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm font-medium">
                            Skills
                        </a>
                        <a href="#projects" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm font-medium">
                            Projects
                        </a>
                        <a href="#links" className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-sm font-medium">
                            Contact
                        </a>
                    </div>
                </div>
            </nav>

            <Hero />
            
            <Suspense fallback={<div className="py-20 text-center text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-900" aria-live="polite">Loading...</div>}>
                <Skills />
                <Projects />
                <Links />
            </Suspense>
        </main>
    );
}
