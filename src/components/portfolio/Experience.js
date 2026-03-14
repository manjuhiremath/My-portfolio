'use client';

import { EXPERIENCE } from '@/lib/constants';

const Experience = () => {
    return (
        <section id="experience" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Professional Journey</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-display">
                        Work Experience
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium font-body">
                        A definitive roadmap of technical roles and institutional impact.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    {EXPERIENCE.map((exp, index) => (
                        <div key={index} className="relative pl-8 sm:pl-12 group">
                            {/* Vertical line */}
                            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 group-last:bottom-auto group-last:h-12" />
                            
                            {/* Dot */}
                            <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 group-hover:bg-primary transition-colors duration-500" />

                            <div className="bg-gray-50 dark:bg-gray-800/20 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display uppercase tracking-tight">{exp.role}</h3>
                                        <p className="text-sm font-black text-primary uppercase tracking-widest">{exp.company}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{exp.duration}</span>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{exp.location}</p>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {exp.points.map((point, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-body">
                                            <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-primary/40" />
                                            <div dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-gray-200 font-bold">$1</strong>') }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;
