'use client';

import { PROJECTS, CLIENT_PROJECTS } from '@/lib/constants';

const stripMarkdown = (text) => {
    return text.replace(/\*\*/g, '');
};

const Projects = () => {
    return (
        <section id="projects" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Strategic Implementation</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-display">
                        Case Studies
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium font-body">
                        A selection of technical implementations and high-performance system architectures.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Primary Projects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {PROJECTS.map((project) => (
                            <div key={project.name} className="group space-y-6">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 group-hover:border-primary/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
                                        <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">System Protocol</span>
                                        </div>
                                    </div>
                                    <div className="h-full flex flex-col justify-center items-center p-8 sm:p-12 text-center">
                                        <h3 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-3 font-display">{project.name}</h3>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{project.subtitle}</p>
                                    </div>
                                </div>
                                
                                <div className="px-2 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(project.tech || '').split(', ').map((tech) => (
                                            <span key={tech} className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded-md">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <p className="text-[14px] sm:text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium font-body">
                                        {stripMarkdown(project.points[0])}
                                    </p>

                                    <div className="pt-2 flex gap-6">
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white border-b border-primary pb-0.5 transition-all hover:gap-3 flex items-center group/link">
                                                Deployment <span className="ml-1 transition-transform group-hover/link:trangray-x-1">→</span>
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all">
                                                Source
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extended Repository */}
                    <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Extended Repository</h3>
                            <div className="h-px flex-1 mx-6 bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CLIENT_PROJECTS.map((project) => (
                                <a
                                    key={project.name}
                                    href={`https://${project.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:border-primary/20 hover:shadow-xl"
                                >
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1.5 font-display">{project.name}</h4>
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-2 uppercase tracking-widest font-body">{project.description}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
