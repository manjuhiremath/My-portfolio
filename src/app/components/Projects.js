// components/Projects.jsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { fadeInUp, staggerContainer } from '../lib/animations';

const Projects = () => {
  const [imageErrors, setImageErrors] = useState({});

const projects = [
  {
    name: 'Vedims - eLearning Platform',
    description: 'Scalable platform for schools and students with role-based login, progress tracking, and certification.',
    tech: 'Next.js, Tailwind CSS, Node.js, Express.js, MySQL, Firebase Auth, AWS',
    link: 'https://vedims.com/',
    github: 'https://github.com/manjuhiremath/vedims',
    image: '/images/projects/vedims-preview.png',
    gradient: 'from-blue-600 via-purple-600 to-cyan-500',
    icon: '📚',
    type: 'website'
  },
  {
    name: 'Neuronexa Labs',
    description: 'Company website with modern features and responsive design.',
    tech: 'Next.js, React, Tailwind CSS',
    link: 'https://neuronexalabs.com/',
    github: 'https://github.com/manjuhiremath/neuronexa-labs',
    image: '/images/projects/neuronexa-preview.png',
    gradient: 'from-purple-600 via-pink-600 to-red-500',
    icon: '🧠',
    type: 'website'
  },
  {
    name: 'GYS Technologies',
    description: 'Full-stack application for scalable web solutions and business automation.',
    tech: 'Next.js, MERN Stack, AWS',
    link: 'https://www.gystechnologies.in/',
    github: 'https://github.com/manjuhiremath/gys-technologies',
    image: '/images/projects/gys-preview.png',
    gradient: 'from-green-600 via-teal-600 to-cyan-500',
    icon: '🚀',
    type: 'website'
  },
  {
    name: 'HR Policy Assistant',
    description: 'AI-powered HR policy automation with FastAPI, FAISS vector database, and Gemini API for intelligent document search.',
    tech: 'FastAPI, Python, FAISS, Gemini API, Pinecone',
    link: 'https://hragent.manjuhiremath.in/',
    github: 'https://github.com/manjuhiremath/HR-Policy-Chatbot',
    image: '/images/projects/hr-agent-preview.png',
    gradient: 'from-blue-600 via-indigo-600 to-purple-500',
    icon: '🤖',
    type: 'website'
  }, 
   {
    name: 'NotebookLM Clone Assistant',
    description: 'AI-powered NotebookLM clone assistant with FastAPI, FAISS vector database, and Gemini API for intelligent document search.',
    tech: 'FastAPI, Python, FAISS, Gemini API, Pinecone',
    link: 'https://hragent.manjuhiremath.in/',
    github: 'https://github.com/manjuhiremath/HR-Policy-Chatbot',
    image: '/images/projects/hr-agent-preview.png',
    gradient: 'from-blue-600 via-indigo-600 to-purple-500',
    icon: '🤖',
    type: 'website'
  },
  {
    name: 'Samsara Studio',
    description: 'Creative studio website with responsive UI and modern design patterns.',
    tech: 'Next.js, Framer Motion, Tailwind CSS',
    link: 'https://www.samsarastudio.co/',
    github: 'https://github.com/manjuhiremath/samsara-studio',
    image: '/images/projects/samsara-preview.png',
    gradient: 'from-orange-600 via-red-600 to-pink-500',
    icon: '🎨',
    type: 'website'
  },
  {
    name: 'Samsara Adventures',
    description: 'Adventure tourism platform with booking system and trip management features.',
    tech: 'Next.js, React, Node.js, MongoDB',
    link: 'https://www.samsaraadventures.com/',
    github: 'https://github.com/manjuhiremath/samsara-adventures',
    image: '/images/projects/samsara-adventures-preview.png',
    gradient: 'from-teal-600 via-green-600 to-emerald-500',
    icon: '🏔️',
    type: 'website'
  },
  {
    name: 'River Tiger Resort',
    description: 'Resort booking and management system with real-time availability.',
    tech: 'Next.js, Node.js, MongoDB',
    link: 'https://www.rivertigerresort.com/',
    github: 'https://github.com/manjuhiremath/river-tiger-resort',
    image: '/images/projects/river-tiger-preview.png',
    gradient: 'from-indigo-600 via-blue-600 to-cyan-500',
    icon: '🏨',
    type: 'website'
  },
  {
    name: 'Tunify Pro',
    description: 'Music streaming platform with playlist management and user recommendations.',
    tech: 'Next.js, React, Node.js, Express.js, MongoDB',
    link: 'https://www.tunifypro.com/',
    github: 'https://github.com/manjuhiremath/tunify-pro',
    image: '/images/projects/tunify-preview.png',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-500',
    icon: '🎧',
    type: 'website'
  },

  {
    name: 'Node.js TypeScript Template',
    description: 'Production-ready Node.js boilerplate with TypeScript, Express.js, and MongoDB integration.',
    tech: 'Node.js, TypeScript, Express.js, MongoDB',
    link: 'https://github.com/manjuhiremath/node-ts-express-template',
    github: 'https://github.com/manjuhiremath/node-ts-express-template',
    image: '/images/projects/node-template-preview.png',
    gradient: 'from-green-600 via-emerald-600 to-teal-500',
    icon: '⚙️',
    type: 'github'
  },
  {
    name: 'Group Chat Application',
    description: 'Real-time group chat with admin features and message encryption.',
    tech: 'React.js, Node.js, Express.js, MongoDB',
    link: 'https://github.com/manjuhiremath/group-chat',
    github: 'https://github.com/manjuhiremath/group-chat',
    image: '/images/projects/group-chat-preview.png',
    gradient: 'from-yellow-600 via-orange-600 to-red-500',
    icon: '💬',
    type: 'github'
  },
  {
    name: 'Music AI',
    description: 'Chatbot-based music recommender using advanced NLP and emotion detection.',
    tech: 'Rasa, JavaScript, React.js, Spotify API',
    link: 'https://github.com/manjuhiremath/Songbot',
    github: 'https://github.com/manjuhiremath/Songbot',
    image: '/images/projects/music-ai-preview.png',
    gradient: 'from-pink-600 via-purple-600 to-indigo-500',
    icon: '🎵',
    type: 'github'
  }
];


  const handleImageError = (projectIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [projectIndex]: true
    }));
  };

  const ProjectImage = ({ project, index }) => {
    if (imageErrors[index]) {
      // Fallback gradient background with icon
      return (
        <div className={`w-full h-48 bg-gradient-to-br ${project.gradient} rounded-t-2xl flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <span className="text-6xl relative z-10 opacity-80">{project.icon}</span>
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
              <span className="text-xs text-white/80 font-medium">Preview</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-48 bg-gray-800 rounded-t-2xl overflow-hidden">
        <img
          src={project.image}
          alt={`${project.name} preview`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => handleImageError(index)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="text-2xl">{project.icon}</span>
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          {project.type === 'website' && (
            <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-xs text-green-300 font-medium">Live</span>
            </div>
          )}
          {project.github && (
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-full px-2 py-1">
              <FaGithub className="w-3 h-3 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.section
      id="projects"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="py-16 sm:py-20 bg-gradient-to-b from-black via-gray-900 to-black px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            A collection of my most impactful digital creations
          </p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
        >
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="group bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all duration-700 relative"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${proj.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700`}
              />
              
              {/* Project Image/Preview */}
              {/* <ProjectImage project={proj} index={idx} /> */}
              
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 leading-tight">
                    {proj.name}
                  </h3>
                  <div className="flex gap-2 ml-4">
                    {proj.type === 'website' && proj.link && (
                      <motion.a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <FaExternalLinkAlt className="w-3 h-3 text-white" />
                      </motion.a>
                    )}
                    {proj.github && (
                      <motion.a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        <FaGithub className="w-4 h-4 text-white" />
                      </motion.a>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-400 mb-4 sm:mb-6 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 text-sm sm:text-base">
                  {proj.description}
                </p>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {proj.tech.split(', ').slice(0, 3).map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-cyan-400 border border-cyan-500/30"
                      >
                        {tech}
                      </span>
                    ))}
                    {proj.tech.split(', ').length > 3 && (
                      <span className="px-2 sm:px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-400 border border-gray-500/30">
                        +{proj.tech.split(', ').length - 3}
                      </span>
                    )}
                  </div>
                </div>
                
                <motion.a
                  href={proj.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center text-cyan-400 hover:text-white font-bold group-hover:underline transition-colors duration-300 text-sm sm:text-base"
                >
                  {proj.type === 'website' ? 'Visit Website' : 'View Code'}
                  <motion.svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ x: 5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Projects;
