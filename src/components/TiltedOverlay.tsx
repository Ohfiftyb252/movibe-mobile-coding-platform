import React from 'react';
import { motion } from 'framer-motion';
interface TiltedOverlayProps {
  intensity: number; // consecutiveLosses
}
export function TiltedOverlay({ intensity }: TiltedOverlayProps) {
  // Map intensity 5-20 to opacity levels and animation speeds
  const level = Math.min(20, intensity);
  const opacity = Math.min(0.4, (level - 4) * 0.05);
  const flickerSpeed = Math.max(0.05, 0.3 - (level - 4) * 0.02);
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {/* Red Vignette */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle,transparent_30%,rgba(220,38,38,0.2)_100%)]"
        animate={{
          opacity: [opacity, opacity * 1.5, opacity]
        }}
        transition={{
          duration: flickerSpeed * 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Rage Flicker */}
      <motion.div 
        className="absolute inset-0 bg-red-600/5 mix-blend-overlay"
        animate={{
          opacity: [0, 0.1, 0, 0.05, 0]
        }}
        transition={{
          duration: flickerSpeed,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "linear"
        }}
      />
      {/* Tilted Status Text */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 -rotate-90 origin-left">
        <motion.p 
          className="text-red-600/30 text-6xl font-display uppercase tracking-[1em]"
          animate={{
            x: [-5, 5, -5]
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity
          }}
        >
          TILTED
        </motion.p>
      </div>
    </div>
  );
}