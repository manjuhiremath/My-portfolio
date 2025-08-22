// components/Links.jsx
'use client';

import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone } from 'react-icons/fa';

const Links = () => {
  const links = [
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/in/manju-hiremath',
      icon: <FaLinkedin size={30} className="text-blue-500" />,
      gradient: 'from-blue-600 to-blue-700',
      hoverColor: 'group-hover:text-blue-400'
    },
    { 
      name: 'GitHub', 
      url: 'https://github.com/manjuhiremath',
      icon: <FaGithub size={30} className="text-gray-300" />,
      gradient: 'from-gray-700 to-gray-900',
      hoverColor: 'group-hover:text-gray-200'
    },
    { 
      name: 'Email', 
      url: 'mailto:manjuhiremath1352@gmail.com',
      icon: <FaEnvelope size={30} className="text-red-400" />,
      gradient: 'from-red-500 to-red-600',
      hoverColor: 'group-hover:text-red-300'
    },
    { 
      name: 'Mobile', 
      url: 'tel:+919686661378',
      icon: <FaPhone size={30} className="text-green-400" />,
      gradient: 'from-green-500 to-green-600',
      hoverColor: 'group-hover:text-green-300'
    },
  ];

  // Custom animation variants
  const spiralIn = {
    initial: { 
      opacity: 0, 
      scale: 0,
      rotate: -180
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const bounceIn = {
    initial: { 
      opacity: 0, 
      scale: 0.3,
      rotate: -10
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const flipIn = {
    initial: { 
      opacity: 0, 
      rotateY: -90,
      scale: 0.8
    },
    animate: { 
      opacity: 1, 
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const elasticPop = {
    initial: { 
      opacity: 0, 
      scale: 0,
      rotate: 45
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Array of different animations for each card
  const animations = [spiralIn, bounceIn, flipIn, elasticPop];

  return (
    <motion.section
      id="links"
    //   initial={{ opacity: 0 }}
    //   whileInView={{ opacity: 1 }}
    //   viewport={{ once: true, amount: 0.3 }}
    //   transition={{ duration: 0.8 }}
      className="h-screen flex justify-center items-center pt-5 bg-gradient-to-br from-black via-purple-900 to-black text-white px-4 sm:px-6 lg:px-8 relative"

    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
        //   initial={{ opacity: 0, scale: 0.8 }}
        //   whileInView={{ opacity: 1, scale: 1 }}
        //   viewport={{ once: true }}
        //   transition={{ 
        //     duration: 0.8,
        //     type: "spring",
        //     stiffness: 100
        //   }}
          className="mb-10 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Let's Create Magic
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Ready to transform ideas into digital reality? Let's connect and build something extraordinary!
          </p>
        </motion.div>
        
        <div className='flex justify-center'>
          <motion.div
            // variants={staggerContainer}
            // initial="initial"
            // whileInView="animate"
            // viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 max-w-2xl gap-6 sm:gap-8"
          >
            {links.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.url}
                target={link.name === 'Mobile' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                variants={animations[idx]}
                whileHover={{ 
                  scale: 1.1, 
                  y: -8,
                  rotate: [0, -2, 2, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: -5
                }}
                className={`group bg-gradient-to-r ${link.gradient} p-[1px] rounded-2xl cursor-pointer`}
              >
                <div className="bg-black/90 rounded-2xl p-2 sm:p-4 h-full backdrop-blur-xl hover:bg-black/70 transition-all duration-300">
                  <div className="flex flex-row items-center justify-center py-2 space-x-4">
                    <motion.div 
                      className={`${link.hoverColor} transition-all duration-300`}
                      whileHover={{ 
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                        transition: { duration: 0.6 }
                      }}
                    >
                      {link.icon}
                    </motion.div>
                    <div className="text-center">
                      <span className="text-lg sm:text-sm font-bold text-white transition-colors duration-300 block">
                        {link.name}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
        
        {/* Additional contact info */}
        <motion.div
          initial={{ opacity: 0, rotateX: -90 }}
          whileInView={{ opacity: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8, 
            delay: 0.8,
            type: "spring",
            stiffness: 200
          }}
          className="mt-5 sm:mt-5 flex justify-center"
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Get In Touch
              </span>
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              Open to freelance opportunities, collaborations, and exciting projects. 
              Let's discuss how we can work together!
            </p>
            <motion.div 
              className="flex flex-wrap justify-center gap-4 text-sm sm:text-base"
              initial="initial"
              whileInView="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {['Full-Stack Development', 'MERN Stack', 'Next.js Expert'].map((skill, idx) => (
                <motion.span
                  key={skill}
                  variants={{
                    initial: { opacity: 0, scale: 0, rotate: 180 },
                    animate: { 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  className={`${
                    idx === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                    idx === 1 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-pink-500/20 text-pink-300 border-pink-500/30'
                  } px-3 py-1 rounded-full border cursor-default`}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.6, 
            delay: 1.2,
            type: "spring",
            stiffness: 300
          }}
          className="mt-12 sm:mt-16 pt-4 sm:pt-4 border-t border-white/10"
        >
          <p className="text-gray-500 text-sm sm:text-base">
            © 2025 Developed with ❤️ and ⚡ by{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">
              Manjunath M
            </span>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Links;
