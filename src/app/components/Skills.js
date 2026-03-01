// components/Skills.jsx
'use client';

import { motion } from 'framer-motion';
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
  SiMaterialdesign,
  SiN8N
} from 'react-icons/si';
import { fadeInUp, staggerContainer } from '../lib/animations';

const Skills = () => {
  const skills = [
    { name: 'JavaScript', icon: <SiJavascript size={32} color="#F7DF1E" />, level: 95, color: 'from-yellow-400 to-orange-500' },
    { name: 'TypeScript', icon: <SiTypescript size={32} color="#3178C6" />, level: 90, color: 'from-blue-400 to-blue-600' },
    { name: 'React.js', icon: <SiReact size={32} color="#61DAFB" />, level: 95, color: 'from-cyan-400 to-blue-500' },
    { name: 'Next.js', icon: <SiNextdotjs size={32} color="#000000" />, level: 92, color: 'from-gray-400 to-gray-600' },
    { name: 'Node.js', icon: <SiNodedotjs size={32} color="#68A063" />, level: 88, color: 'from-green-400 to-green-600' },
    { name: 'Express.js', icon: <SiExpress size={32} color="#000000" />, level: 85, color: 'from-gray-300 to-gray-500' },
    { name: 'MongoDB', icon: <SiMongodb size={32} color="#47A248" />, level: 87, color: 'from-green-400 to-green-700' },
    { name: 'MySQL', icon: <SiMysql size={32} color="#4479A1" />, level: 82, color: 'from-blue-400 to-blue-700' },
    { name: 'Firebase', icon: <SiFirebase size={32} color="#FFCA28" />, level: 80, color: 'from-orange-400 to-red-500' },
    { name: 'AWS', icon: <SiAmazonwebservices size={32} color="#FF9900" />, level: 78, color: 'from-orange-300 to-orange-600' },
    { name: 'Tailwind CSS', icon: <SiTailwindcss size={32} color="#06B6D4" />, level: 93, color: 'from-teal-400 to-cyan-500' },
    { name: 'n8n', icon: <SiN8N size={32} color="#EA4B71" />, level: 75, color: 'from-pink-400 to-red-500' }
  ];

  return (
    <motion.section
      id="skills"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
      className="py-10 min-h-screen sm:py-10 bg-gradient-to-b from-black via-gray-900 to-black px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Skills & Expertise
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Crafting digital experiences with cutting-edge technologies
          </p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
        >
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 hover:border-cyan-500/50 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center">
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 ">
                  <div className="group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {skill.icon}
                  </div>
                  <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base leading-tight">
                    {skill.name}
                  </h3>
                </div>
                
                {/* Progress Bar */}
                {/* <div className="w-full">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-cyan-400 font-bold text-xs sm:text-sm">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 sm:h-2">
                    <motion.div
                      className={`h-1.5 sm:h-2 rounded-full bg-gradient-to-r ${skill.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: idx * 0.1 }}
                    />
                  </div>
                </div> */}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Skills;
