'use client';

import { PROJECTS, CLIENT_PROJECTS } from '@/lib/constants';

const stripMarkdown = (text) => {
    return text.replace(/\*\*/g, '');
};

const Projects = () => {
    return (
        <section id="projects" className="py-20 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                    Featured Projects
                </h2>
                <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
                    Key projects showcasing my technical expertise
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {PROJECTS.map((project) => (
                        <div
                            key={project.name}
                            className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-gray-300 transition-colors duration-200"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {project.name}
                                </h3>
                                <div className="flex gap-3">
                                    {project.link && (
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                            aria-label="Visit website"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                                            aria-label="View code"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 mb-3 text-sm font-medium">
                                {project.subtitle}
                            </p>
                            <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                                {stripMarkdown(project.points[0])}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {project.tech.split(', ').slice(0, 4).map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-12 border-t border-gray-100">
                    <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">
                        Client Projects
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {CLIENT_PROJECTS.map((project) => (
                            <a
                                key={project.name}
                                href={`https://${project.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-300 hover:bg-gray-100 transition-colors duration-200 text-center"
                            >
                                <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                                <p className="text-gray-500 text-xs mt-1">{project.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
