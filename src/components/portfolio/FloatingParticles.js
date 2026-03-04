// components/FloatingParticles.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const particleArray = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      animationDuration: Math.random() * 10 + 10,
      xMovement: Math.random() * 100,
      yMovement: Math.random() * 100,
    }));
    setParticles(particleArray);
  }, []);

  if (!isClient) return null;

  return (
    <div className="absolute min-h-screen inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
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
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
