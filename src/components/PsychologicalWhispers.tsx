import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const WHISPERS = [
  "You almost had it...",
  "One more pull.",
  "The machine is due.",
  "Why no cash out?",
  "Calculated probability: 99% Near Miss.",
  "Your wallet feels heavy. Lighten it.",
  "I saw a 7. Didn't you?",
  "The house misses you.",
  "Just a glitch in your luck.",
  "Double or nothing. Or just nothing."
];
interface PsychologicalWhispersProps {
  trigger: number;
}
export function PsychologicalWhispers({ trigger }: PsychologicalWhispersProps) {
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  useEffect(() => {
    if (trigger > 0 && trigger % 3 === 0) {
      const randomWhisper = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
      setActiveWhisper(randomWhisper);
      const timer = setTimeout(() => setActiveWhisper(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {activeWhisper && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: [0, 0.4, 0.2, 0.5, 0],
              y: -100,
              scale: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 text-ov-primary/40 font-display text-xl md:text-2xl uppercase tracking-[0.3em] whitespace-nowrap text-center italic"
            style={{ textShadow: '0 0 10px rgba(255, 0, 229, 0.3)' }}
          >
            {activeWhisper}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}