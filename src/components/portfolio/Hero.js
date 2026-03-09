'use client';

import Image from 'next/image';
import { PERSONAL_INFO, EXPERIENCE } from '@/lib/constants';

const Hero = () => {
    const currentRole = EXPERIENCE[0];
    
    return (
        <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-white">
            <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-100 shadow-sm relative">
                        <Image 
                            src="/Profilemanju.jpeg" 
                            alt={PERSONAL_INFO.name}
                            width={128}
                            height={128}
                            className="object-cover"
                            priority
                            sizes="128px"
                        />
                    </div>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                    {PERSONAL_INFO.name}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
                    {PERSONAL_INFO.title}
                </p>
                
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    {currentRole.role} at {currentRole.company} · {currentRole.location}
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {['React.js', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'].map((tech) => (
                        <span 
                            key={tech}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full transition-colors duration-200 hover:bg-gray-200"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#projects"
                        className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium transition-colors duration-200 hover:bg-gray-800"
                    >
                        View Projects
                    </a>
                    <a
                        href={PERSONAL_INFO.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-medium transition-colors duration-200 hover:bg-gray-900 hover:text-white"
                    >
                        Resume
                    </a>
                </div>
                
                <button
                    onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default Hero;
