'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FloatingParticles from './FloatingParticles';

const Hero = () => {
    /* -------- TYPEWRITER -------- */
    const [text, setText] = useState('');
    const [cursor, setCursor] = useState(true);
    const NAME = 'Manjunath M';

    useEffect(() => {
        let i = 0;
        const typing = () => {
            if (i < NAME.length) {
                setText(NAME.slice(0, ++i));
                setTimeout(typing, 120);
            } else {
                setTimeout(() => setCursor(false), 1200);
            }
        };
        typing();
        const blink = setInterval(() => setCursor(c => !c), 500);
        return () => clearInterval(blink);
    }, []);

    /* -------- MOTION VARIANTS -------- */
    const floatY = {
        y: [0, -15, 0],
        transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
    };

    const techStack = [
        { name: 'MongoDB', colors: 'from-green-500 to-green-700', textColor: 'text-green-300', shadow: 'shadow-green-500/50' },
        { name: 'Express.js', colors: 'from-slate-500 to-slate-700', textColor: 'text-slate-300', shadow: 'shadow-slate-500/50' },
        { name: 'React.js', colors: 'from-sky-500 to-cyan-400', textColor: 'text-cyan-300', shadow: 'shadow-cyan-500/50' },
        { name: 'Node.js', colors: 'from-green-700 to-green-800', textColor: 'text-green-300', shadow: 'shadow-green-500/50' },
        { name: 'Next.js', colors: 'from-neutral-600 to-black', textColor: 'text-neutral-300', shadow: 'shadow-neutral-500/50' },
        { name: 'JavaScript', colors: 'from-yellow-400 to-orange-500', textColor: 'text-yellow-300', shadow: 'shadow-yellow-500/50' },
        { name: 'TypeScript', colors: 'from-blue-600 to-indigo-700', textColor: 'text-blue-300', shadow: 'shadow-blue-500/50' },
    ];

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="h-screen flex items-center justify-center px-3 sm:px-6 lg:px-10 bg-gradient-to-br from-[#0a0a0f] via-black to-purple-900 relative text-white overflow-hidden font-body"
        >
            <FloatingParticles />

            {/* FLOATING BACKGROUND ORBS */}
            <motion.div
                className="absolute left-1/4 top-1/4 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.4, 1],
                    rotate: [0, 180, 360],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            <motion.div
                className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-purple-500/15 blur-3xl rounded-full"
                animate={{
                    scale: [1.2, 0.8, 1.2],
                    rotate: [360, 0, 360],
                    x: [0, -40, 0],
                    y: [0, 20, 0]
                }}
                transition={{ duration: 25, repeat: Infinity }}
            />

            {/* MAIN CONTENT */}
            <motion.div
                variants={floatY}
                animate="animate"
                className="z-10 text-center space-y-4 sm:space-y-6 w-full max-w-6xl"
            >
                {/* NAME WITH CREATIVE STYLING */}
                <div className="relative">
                    <motion.h1
                        className="relative inline-block select-none"
                        initial={{ scale: 0.5, rotateY: -45 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
                    >
                        <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400  via-violet-400 to-cyan-400 bg-[length:300%] animate-gradient tracking-wider">
                            {text}
                            <motion.span
                                className="text-cyan-400 font-thin"
                                animate={{ opacity: cursor ? 1 : 0 }}
                                transition={{ duration: 0.1 }}
                            >
                                |
                            </motion.span>
                        </span>
                    </motion.h1>

                </div>

                {/* SUB-TITLE WITH 3D EFFECT */}
                <motion.h2
                    initial={{ opacity: 0, y: 30, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 120 }}
                    className="text-lg sm:text-xl md:text-2xl font-bold font-body bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent"
                >
                    Full Stack MERN Developer
                </motion.h2>

                {/* LOCATION / STATUS WITH ENHANCED ANIMATION */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, type: "spring", stiffness: 150 }}
                    className="text-sm sm:text-base tracking-wide text-gray-300 flex flex-wrap justify-center items-center gap-2"
                >
                    <motion.span
                        className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    >
                        <motion.span
                            className="w-2 h-2 rounded-full bg-emerald-400"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        GYS Technologies
                    </motion.span>
                    <span className="text-gray-500">•</span>
                    <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10  sm:inline">Bengaluru</span>
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10  sm:inline">Jun 2025 – Present</span>
                </motion.div>

                {/* ENHANCED TECH STACK */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        show: { transition: { staggerChildren: 0.08 } },
                    }}
                    className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4 max-w-4xl mx-auto"
                >
                    {techStack.map((tech, index) => (
                        <motion.div
                            key={tech.name}
                            variants={{
                                hidden: { opacity: 0, scale: 0, rotate: -180 },
                                show: {
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20
                                    }
                                },
                            }}
                            whileHover={{
                                y: -8,
                                scale: 1.1,
                                rotate: [0, -5, 5, 0],
                                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-code font-medium bg-gradient-to-r bg-amber-700/10 ${tech.textColor} shadow-lg cursor-default backdrop-blur-sm border border-white/20 overflow-hidden`}
                        >
                            <motion.div
                                className="absolute inset-0 bg-white/20 rounded-xl"
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <span className="relative z-10">{tech.name}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ENHANCED CTA BUTTONS */}
                <div className='flex justify-center'>
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 1.8, type: 'spring', stiffness: 120 }}
                    className="flex flex-row  justify-center items-center   rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border mt-10 sm:mt-5 border-white/10 shadow-2xl"
                >
                    <motion.a
                        href="#projects"
                    
                        className="group relative px-4 sm:px-8 py-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 font-semibold text-sm  sm:text-base transition-all duration-300 rounded-l-2xl border-r border-white/20 w-full"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 opacity-0 group-hover:opacity-20 to-blue-600 rounded-l-2xl"
                            transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10 flex items-center justify-center">
                            Projects
                        </span>
                    </motion.a>

                    <motion.a
                        href="#links"
                        
                        className="group relative px-4 sm:px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 font-semibold text-sm sm:text-base transition-all duration-300 rounded-none border-r-0 sm:border-r border-white/20 w-full"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-0 group-hover:opacity-20"
                            transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10 flex items-center justify-center">
                            Links
                        </span>
                    </motion.a>

                    <motion.a
                        href="https://drive.google.com/file/d/1__mxy-0TJ7_4MD0qGwHcZ_rRB2LssJr7/view?usp=sharing"
                        target="_blank"
                   
                        className="group relative px-4 sm:px-8 py-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 font-semibold text-sm sm:text-base transition-all duration-300 rounded-r-2xl  w-full"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-20 rounded-r-2xl"
                            transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10 flex items-center justify-center">

                            Resume
                        </span>
                    </motion.a>
                </motion.div>
                </div>
            </motion.div>

            {/* ENHANCED SCROLL INDICATOR */}
            <motion.button
                onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors group"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                whileHover={{ scale: 1.1 }}
            >
                <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center relative backdrop-blur-sm bg-white/5">
                    <motion.div
                        className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full mt-2"
                        animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                    />
                </div>
                <span className="group-hover:text-cyan-400 transition-colors font-code">explore</span>
            </motion.button>
        </motion.section>
    );
};

export default Hero;
