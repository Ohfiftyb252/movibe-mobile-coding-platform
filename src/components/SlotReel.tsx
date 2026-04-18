import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
interface SlotReelProps {
  symbols: React.ReactNode[];
  finalIndex: number;
  isSpinning: boolean;
  delay: number;
  tension?: boolean;
  isGlitching?: boolean;
}
export function SlotReel({ symbols, finalIndex, isSpinning, delay, tension = false, isGlitching = false }: SlotReelProps) {
  const symbolHeight = 112; 
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
    stop: (custom: { finalIndex: number; glitch: boolean }) => ({
      y: -custom.finalIndex * symbolHeight + (custom.glitch ? 10 : 0),
      transition: {
        y: {
          duration: tension ? 2.5 : 1.2 + delay,
          ease: [0.34, 1.56, 0.64, 1],
        },
      },
    }),
  };
  return (
    <div
      className={cn(
        "w-24 h-28 md:w-36 md:h-32 overflow-hidden transition-colors duration-300 bg-ov-dark/90 border-2 rounded-2xl flex items-center justify-center relative shadow-inner",
        isGlitching ? "animate-glitch border-ov-primary bg-ov-primary/10" : "border-ov-primary/20",
        tension && !isGlitching && "animate-pulse border-yellow-500/40"
      )}
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-ov-primary/10 pointer-events-none" />
      <motion.div
        className="flex flex-col"
        variants={spinVariants}
        initial="stop"
        animate={isSpinning ? 'start' : 'stop'}
        custom={{ finalIndex, glitch: isGlitching }}
      >
        {[...symbols, ...symbols].map((symbol, i) => (
          <div
            key={i}
            className={cn(
              "w-full flex items-center justify-center text-5xl md:text-7xl transition-all duration-300",
              isGlitching ? "blur-[1px] brightness-150" : "drop-shadow-lg"
            )}
            style={{ height: `${symbolHeight}px` }}
          >
            {symbol}
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
    </div>
  );
}