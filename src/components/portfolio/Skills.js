'use client';

import { lazy, Suspense } from 'react';
import { TECHNICAL_SKILLS } from '@/lib/constants';
import { 
    SiJavascript, 
    SiTypescript, 
    SiReact, 
    SiNextdotjs, 
    SiNodedotjs, 
    SiExpress, 
    SiMongodb, 
    SiMysql, 
    SiFirebase, 
    SiAmazonwebservices,
    SiTailwindcss,
    SiPython
} from 'react-icons/si';

const skills = [
    { name: 'JavaScript', level: 95, icon: <SiJavascript size={28} />, color: '#F7DF1E' },
    { name: 'TypeScript', level: 90, icon: <SiTypescript size={28} />, color: '#3178C6' },
    { name: 'React.js', level: 95, icon: <SiReact size={28} />, color: '#61DAFB' },
    { name: 'Next.js', level: 92, icon: <SiNextdotjs size={28} />, color: '#000000' },
    { name: 'Node.js', level: 88, icon: <SiNodedotjs size={28} />, color: '#68A063' },
    { name: 'Express.js', level: 85, icon: <SiExpress size={28} />, color: '#000000' },
    { name: 'MongoDB', level: 87, icon: <SiMongodb size={28} />, color: '#47A248' },
    { name: 'MySQL', level: 82, icon: <SiMysql size={28} />, color: '#4479A1' },
    { name: 'Firebase', level: 80, icon: <SiFirebase size={28} />, color: '#FFCA28' },
    { name: 'AWS', level: 78, icon: <SiAmazonwebservices size={28} />, color: '#FF9900' },
    { name: 'Tailwind CSS', level: 93, icon: <SiTailwindcss size={28} />, color: '#06B6D4' },
    { name: 'Python', level: 75, icon: <SiPython size={28} />, color: '#3776AB' },
];

const Skills = () => {
    return (
        <section id="skills" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-500">
            <div className="space-y-12">
                <div className="text-center space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Technical Infrastructure</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight uppercase font-display">
                        Core Capabilities
                    </h2>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium font-body">
                        The architectural foundation and technical stack powering high-performance digital ecosystems.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="group bg-gray-50 dark:bg-gray-800/30 p-6 sm:p-8 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:trangray-y-[-2px]"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-500" style={{ color: skill.color }}>
                                    {skill.icon}
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight font-display">{skill.name}</h3>
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-[11px] font-black text-primary tabular-nums">{skill.level}%</span>
                                </div>
                                <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:bg-primary/80"
                                        style={{ width: `${skill.level}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8 text-center">
                        Full Stack Index
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {Object.entries(TECHNICAL_SKILLS).map(([category, techs]) => 
                            techs.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 hover:text-primary hover:border-primary/30 shadow-sm"
                                >
                                    {tech}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Skills;
