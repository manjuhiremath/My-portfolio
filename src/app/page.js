// src/app/page.js
'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Links from './components/Links';

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      staggerChildren: 0.3,
    },
  },
};

const sectionVariants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Home() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring animations
  const springScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms
  const backgroundY = useTransform(springScrollProgress, [0, 1], ["0%", "100%"]);
  const heroY = useTransform(springScrollProgress, [0, 0.3], ["0%", "-50%"]);
  const heroOpacity = useTransform(springScrollProgress, [0, 0.3], [1, 0]);

  // Track active section
  useEffect(() => {
    const updateActiveSection = (latest) => {
      const sections = [0, 0.25, 0.5, 0.75];
      const current = sections.findIndex((section, index) => {
        const next = sections[index + 1];
        return latest >= section && (next ? latest < next : true);
      });
      setActiveSection(current === -1 ? 0 : current);
    };

    return springScrollProgress.onChange(updateActiveSection);
  }, [springScrollProgress]);

  return (
    <motion.div
      ref={containerRef}
      className="overflow-x-hidden bg-black relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Enhanced scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transform-gpu z-50 shadow-lg"
        style={{
          scaleX: springScrollProgress,
          transformOrigin: "0%",
        }}
      />

      {/* Section navigation dots
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-40 space-y-4">
        {['Hero', 'Skills', 'Projects', 'Contact'].map((section, index) => (
          <motion.div
            key={section}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              activeSection === index 
                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              const element = document.getElementById(
                ['hero', 'skills', 'projects', 'links'][index]
              );
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </div> */}

      {/* Hero with parallax */}
      <motion.section
        id="hero"
      // style={{ y: heroY, opacity: heroOpacity }}
      // variants={sectionVariants}
      >
        <Hero />
      </motion.section>

      {/* Skills section */}
      <motion.section
        id="skills"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Skills />
      </motion.section>

      {/* Projects section */}
      <motion.section
        id="projects"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Projects />
      </motion.section>

      {/* Links section */}
      <motion.section
      // id="links"
      // variants={sectionVariants}
      // initial="initial"
      // whileInView="animate"
      // viewport={{ once: true, amount: 0.3 }}
      >
        <Links />
      </motion.section>
    </motion.div>
  );
}
