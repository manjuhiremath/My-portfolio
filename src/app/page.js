'use client';

import Hero from '@/components/portfolio/Hero';
import Skills from '@/components/portfolio/Skills';
import Projects from '@/components/portfolio/Projects';
import Links from '@/components/portfolio/Links';

export default function Home() {
    return (
        <main className="bg-white min-h-screen">
            <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="#" className="text-lg font-bold text-gray-900">
                        Manjunath M
                    </a>
                    <div className="flex gap-6">
                        <a href="#skills" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                            Skills
                        </a>
                        <a href="#projects" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                            Projects
                        </a>
                        <a href="#links" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                            Contact
                        </a>
                    </div>
                </div>
            </nav>

            <Hero />
            <Skills />
            <Projects />
            <Links />
        </main>
    );
}
