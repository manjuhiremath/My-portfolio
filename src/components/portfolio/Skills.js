'use client';

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
        <section id="skills" className="py-20 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                    Skills & Expertise
                </h2>
                <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
                    Technologies I work with to build modern web applications
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {skills.map((skill) => (
                        <div
                            key={skill.name}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors duration-200"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span style={{ color: skill.color }}>
                                    {skill.icon}
                                </span>
                                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gray-900 rounded-full transition-all duration-300"
                                    style={{ width: `${skill.level}%` }}
                                />
                            </div>
                            <span className="text-gray-500 text-xs mt-1 block">{skill.level}%</span>
                        </div>
                    ))}
                </div>

                <div className="mt-16">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                        Technical Stack
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(TECHNICAL_SKILLS).map(([category, techs]) => 
                            techs.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-200 hover:border-gray-400"
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
