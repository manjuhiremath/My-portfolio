// components/FloatingNav.jsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { FaHome, FaCode, FaBriefcase, FaEnvelope } from 'react-icons/fa';

const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);

  const navItems = useMemo(() => [
    { id: 'hero', label: 'Home', icon: FaHome },
    { id: 'skills', label: 'Skills', icon: FaCode },
    { id: 'projects', label: 'Projects', icon: FaBriefcase },
    { id: 'links', label: 'Contact', icon: FaEnvelope },
  ], []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 100);

      const sections = navItems.map(item => item.id);
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  const handleClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden sm:block"
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 shadow-lg shadow-black/20">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <motion.button
                  onClick={() => handleClick(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">{item.label}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.nav>
  );
};

export default FloatingNav;
