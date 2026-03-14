'use client';

import { PROJECTS, CLIENT_PROJECTS } from '@/lib/constants';

const stripMarkdown = (text) => {
    return text.replace(/\*\*/g, '');
};

const Projects = () => {
    return (
        <section id="projects" className="py-32 bg-white dark:bg-slate-900 transition-colors duration-500">
            <div className="space-y-20">
                <div className="text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Strategic Implementation</p>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                        Architectural Case Studies
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        A selection of technical implementations and high-performance system architectures.
                    </p>
                </div>

                <div className="space-y-32">
                    {/* Primary Projects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {PROJECTS.map((project) => (
                            <div key={project.name} className="group space-y-8">
                                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-500 group-hover:border-primary/30">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-10 left-10">
                                        <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Project Protocol</span>
                                        </div>
                                    </div>
                                    <div className="h-full flex flex-col justify-center items-center p-12 text-center">
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">{project.name}</h3>
                                        <p className="text-sm font-black text-primary uppercase tracking-[0.4em]">{project.subtitle}</p>
                                    </div>
                                </div>
                                
                                <div className="px-4 space-y-6">
                                    <div className="flex flex-wrap gap-3">
                                        {(project.tech || '').split(', ').map((tech) => (
                                            <span key={tech} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        {stripMarkdown(project.points[0])}
                                    </p>

                                    <div className="pt-4 flex gap-8">
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white border-b-2 border-primary pb-1 transition-all hover:gap-4 flex items-center group/link">
                                                Live Deployment <span className="ml-2 transition-transform group-hover/link:translate-x-1">→</span>
                                            </a>
                                        )}
                                        {project.github && (
                                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-all">
                                                Source Code
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Extended Repository */}
                    <div className="pt-20 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Extended Repository</h3>
                            <div className="h-px flex-1 mx-8 bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {CLIENT_PROJECTS.map((project) => (
                                <a
                                    key={project.name}
                                    href={`https://${project.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block bg-slate-50 dark:bg-slate-800/30 p-8 rounded-xl border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:border-primary/30 hover:shadow-xl"
                                >
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{project.name}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 uppercase tracking-wider">{project.description}</p>
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
