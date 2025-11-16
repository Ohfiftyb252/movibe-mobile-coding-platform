import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface SlotReelProps {
  symbols: React.ReactNode[];
  finalIndex: number;
  isSpinning: boolean;
  delay: number;
}
export function SlotReel({ symbols, finalIndex, isSpinning, delay }: SlotReelProps) {
  const reelHeight = 100; // Corresponds to h-24 in Tailwind (4rem = 64px, but we'll use a number for calculation)
  const symbolHeight = 100;
  const totalHeight = symbols.length * symbolHeight;
  const spinVariants = {
    start: {
      y: [0, -totalHeight * 2],
      transition: {
        y: {
          duration: 1 + delay,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    stop: (custom: { finalIndex: number }) => ({
      y: -custom.finalIndex * symbolHeight,
      transition: {
        y: {
          duration: 1.5 + delay,
          ease: [0.22, 1, 0.36, 1], // easeOutQuint
        },
      },
    }),
  };
  return (
    <div
      className="w-24 h-24 md:w-32 md:h-32 overflow-hidden bg-ov-dark/50 border-2 border-ov-primary/20 rounded-lg flex items-center justify-center"
      style={{ height: `${reelHeight}px` }}
    >
      <motion.div
        className="flex flex-col"
        variants={spinVariants}
        initial="stop"
        animate={isSpinning ? 'start' : 'stop'}
        custom={{ finalIndex }}
      >
        {symbols.map((symbol, i) => (
          <div
            key={i}
            className="w-full flex items-center justify-center text-5xl md:text-6xl"
            style={{ height: `${symbolHeight}px` }}
          >
            {symbol}
          </div>
        ))}
      </motion.div>
    </div>
  );
}