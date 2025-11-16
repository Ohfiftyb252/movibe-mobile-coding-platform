import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Bug } from 'lucide-react';
import { useState } from 'react';
interface ZombieProps {
  id: number;
  onShoot: (id: number) => void;
  initialX: number;
  duration: number;
}
export function Zombie({ id, onShoot, initialX, duration }: ZombieProps) {
  const [isShot, setIsShot] = useState(false);
  const handleClick = () => {
    if (!isShot) {
      setIsShot(true);
      onShoot(id);
    }
  };
  const variants: Variants = {
    shamble: {
      y: '110vh',
      transition: { duration, ease: 'linear' },
    },
    shot: {
      scale: 0,
      rotate: 360,
      transition: { duration: 0.3 },
    },
  };
  return (
    <AnimatePresence>
      {!isShot && (
        <motion.div
          key={id}
          initial={{ x: initialX, y: '-10vh' }}
          animate="shamble"
          exit="shot"
          variants={variants}
          onClick={handleClick}
          className="absolute cursor-crosshair"
        >
          <Bug className="w-16 h-16 text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.8)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}