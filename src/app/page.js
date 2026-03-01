'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Links from './components/Links';
import FloatingNav from './components/FloatingNav';

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
  const { scrollYProgress } = useScroll();
  const springScrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      ref={containerRef}
      className="overflow-x-hidden bg-black relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <FloatingNav />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transform-gpu z-50 shadow-lg"
        style={{
          scaleX: springScrollProgress,
          transformOrigin: "0%",
        }}
      />

      <motion.section
        id="hero"
      >
        <Hero />
      </motion.section>

      <motion.section
        id="skills"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Skills />
      </motion.section>

      <motion.section
        id="projects"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Projects />
      </motion.section>

      <motion.section
      >
        <Links />
      </motion.section>
    </motion.div>
  );
}
