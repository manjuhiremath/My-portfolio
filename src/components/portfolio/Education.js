'use client';

import { EDUCATION } from '@/lib/constants';

const Education = () => {
    return (
        <section id="education" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Academic Foundation</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-display">
                        Education
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium font-body">
                        The theoretical and technical grounding behind the engineering expertise.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EDUCATION.map((edu, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800/20 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{edu.duration}</span>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display uppercase tracking-tight leading-tight mb-1">{edu.degree}</h3>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{edu.institution}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">{edu.location}</span>
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black">{edu.grade}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Education;
