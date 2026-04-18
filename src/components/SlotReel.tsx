import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
interface SlotReelProps {
  symbols: React.ReactNode[];
  finalIndex: number;
  isSpinning: boolean;
  delay: number;
  tension?: boolean;
}
export function SlotReel({ symbols, finalIndex, isSpinning, delay, tension = false }: SlotReelProps) {
  const symbolHeight = 112; // Adjusted for better centering (h-28)
  const totalHeight = symbols.length * symbolHeight;
  const spinVariants: Variants = {
    start: {
      y: [0, -totalHeight * 2.5],
      transition: {
        y: {
          duration: tension ? 0.3 : 0.8 + delay,
          repeat: Infinity,
          ease: 'linear',
        },
      },
    },
    stop: (custom: { finalIndex: number }) => ({
      y: -custom.finalIndex * symbolHeight,
      transition: {
        y: {
          duration: tension ? 2.5 : 1.2 + delay,
          // Custom cubic-bezier for a heavy mechanical stop with overshoot and bounce
          ease: [0.34, 1.56, 0.64, 1], 
        },
      },
    }),
  };
  return (
    <div
      className={cn(
        "w-24 h-28 md:w-36 md:h-32 overflow-hidden bg-ov-dark/90 border-2 border-ov-primary/20 rounded-2xl flex items-center justify-center relative shadow-inner",
        tension && "animate-glitch border-yellow-500/40"
      )}
    >
      {/* Visual center guide */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-ov-primary/10 pointer-events-none" />
      <motion.div
        className="flex flex-col"
        variants={spinVariants}
        initial="stop"
        animate={isSpinning ? 'start' : 'stop'}
        custom={{ finalIndex }}
      >
        {/* Double the symbols for smooth infinite loop visual */}
        {[...symbols, ...symbols].map((symbol, i) => (
          <div
            key={i}
            className="w-full flex items-center justify-center text-5xl md:text-7xl drop-shadow-lg"
            style={{ height: `${symbolHeight}px` }}
          >
            {symbol}
          </div>
        ))}
      </motion.div>
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}