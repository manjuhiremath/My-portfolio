// components/FloatingParticles.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const particleArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      animationDuration: Math.random() * 20 + 15,
      xMovement: Math.random() * 20,
      yMovement: Math.random() * 20,
      size: Math.random() * 2 + 1,
    }));
    setParticles(particleArray);
  }, []);

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/20"
          animate={{
            x: [0, particle.xMovement, 0],
            y: [0, particle.yMovement, 0],
          }}
          transition={{
            duration: particle.animationDuration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
