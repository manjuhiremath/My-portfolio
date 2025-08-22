// components/Hero.jsx
'use client';

import { motion } from 'framer-motion';
import FloatingParticles from './FloatingParticles';

const Hero = () => {
    

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white text-center px-3 sm:px-4 lg:px-6 relative "
        >
            <FloatingParticles />


            <div className="max-w-5xl mx-auto relative z-10 w-full">
                {/* Name and Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mb-4 sm:mb-6"
                >
                    <motion.h1
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-3 relative flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                        style={{
                            background: "linear-gradient(-45deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)",
                            backgroundSize: "200% 200%",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        Manjunath M

                        {/* Glitch lines */}
                        <motion.div
                            animate={{ x: [-2, 2, -2] }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
                            className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent opacity-20"
                        >
                            Manjunath M
                        </motion.div>
                    </motion.h1>





                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mb-3 sm:mb-4"
                    >
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Full Stack MERN Developer
                            </span>
                        </h2>
                        <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm text-cyan-300">
                            <span className="flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                GYS Technologies
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="hidden sm:inline">Bengaluru</span>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span>June 2025 - Present</span>
                        </div>
                    </motion.div>
                </motion.div>



                {/* Tech Stack Tags - Compact */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mb-4 sm:mb-6"
                >
                    <p className="text-gray-400 mb-2 text-xs sm:text-sm">Specialized in</p>
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {[
                            { name: 'MongoDB', color: 'from-green-500 to-green-600' ,text: 'text-green-400' },
                            { name: 'Express.js', color: 'from-gray-500 to-gray-600',text: 'text-gray-400' },
                            { name: 'React.js', color: 'from-blue-500 to-cyan-500',text:'text-blue-400' },
                            { name: 'Node.js', color: 'from-green-600 to-green-700',text:'text-green-400' },
                            { name: 'Next.js', color: 'from-gray-700 to-black',text:'text-gray-400' },
                            { name: 'JavaScript', color: 'from-yellow-500 to-orange-500',text:'text-yellow-400' },
                            { name: 'TypeScript', color: 'from-blue-600 to-blue-700',text:'text-blue-400' }
                        ].map((tech, i) => (
                            <motion.span
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.9 + i * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                className={`px-2 sm:px-3 py-1 bg-gradient-to-r ${tech.color}/10 text-white rounded-full text-xs font-semibold shadow-lg `}

                            >
                                {tech.name}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Buttons - Compact */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="flex flex-row justify-center items-center"
                >
                    <motion.a
                        href="#projects"
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="border-2 border-blue-400 bg-blue-400/10 text-blue-400 px-4 sm:px-6 py-2 sm:py-3 rounded-l-lg font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 w-full sm:w-auto min-w-[140px]"
                    >
                        <span className="relative z-10">View Projects</span>
                      
                    </motion.a>

                    <motion.a
                        href="#links"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(255, 255, 255, 0.1)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="border-2 border-cyan-400 bg-cyan-400/10 text-cyan-400 px-4 sm:px-6 py-2 sm:py-3  font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 w-full sm:w-auto min-w-[140px]"

                    >
                        Let's Connect
                    </motion.a>

                    <motion.a
                        href="https://drive.google.com/file/d/1__mxy-0TJ7_4MD0qGwHcZ_rRB2LssJr7/view?usp=sharing"
                        target="_blank"
                        whileHover={{
                            scale: 1.02,
                            backgroundColor: "rgba(255, 255, 255, 0.05)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="border-2 border-purple-400 bg-purple-400/10 text-purple-400 px-4 sm:px-6 py-2 sm:py-3 rounded-r-lg font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 w-full sm:w-auto min-w-[140px]"
                    >
                        Resume
                    </motion.a>
                </motion.div>
            </div>

           
        </motion.section>
    );
};

export default Hero;
