import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Card as CardType } from '@/lib/game-logic/blackjack';
interface PlayingCardProps {
  card?: CardType;
  hidden?: boolean;
  isFlipped?: boolean;
  delay?: number;
}
export function PlayingCard({ card, hidden = false, isFlipped = false, delay = 0 }: PlayingCardProps) {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  const cardVariants = {
    hidden: { y: -100, opacity: 0, rotateY: 180 },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: isFlipped ? 180 : 0,
      transition: { duration: 0.5, delay }
    },
  };
  return (
    <motion.div
      className="w-24 h-36 md:w-28 md:h-40 perspective-1000"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={cn("relative w-full h-full preserve-3d transition-transform duration-500", { 'rotate-y-180': hidden })}>
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-300 rounded-lg shadow-lg flex flex-col justify-between p-2">
          <div className={cn("text-left text-2xl font-bold", isRed ? 'text-red-600' : 'text-black')}>
            <div>{card?.rank}</div>
            <div>{card?.suit}</div>
          </div>
          <div className={cn("text-center text-5xl", isRed ? 'text-red-600' : 'text-black')}>
            {card?.suit}
          </div>
          <div className={cn("text-right text-2xl font-bold transform rotate-180", isRed ? 'text-red-600' : 'text-black')}>
            <div>{card?.rank}</div>
            <div>{card?.suit}</div>
          </div>
        </div>
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden bg-blue-600 border-2 border-blue-800 rounded-lg shadow-lg flex items-center justify-center p-2 rotate-y-180">
          <div className="w-full h-full border-4 border-blue-400 rounded-md flex items-center justify-center">
            <div className="text-blue-200 text-4xl font-display glitch-text" data-text="OVW">OVW</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}