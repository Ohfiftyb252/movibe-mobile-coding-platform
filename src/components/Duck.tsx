import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Bird } from 'lucide-react';
import { useState } from 'react';
interface DuckProps {
  id: number;
  onShoot: (id: number) => void;
  initialX: number;
  initialY: number;
  duration: number;
  direction: 'left' | 'right';
}
export function Duck({ id, onShoot, initialX, initialY, duration, direction }: DuckProps) {
  const [isShot, setIsShot] = useState(false);
  const handleClick = () => {
    if (!isShot) {
      setIsShot(true);
      onShoot(id);
    }
  };
  const variants: Variants = {
    fly: {
      x: direction === 'right' ? '110vw' : '-10vw',
      transition: { duration, ease: 'linear' },
    },
    shot: {
      y: '100vh',
      rotate: 180,
      transition: { duration: 0.5, ease: 'easeIn' },
    },
  };
  return (
    <AnimatePresence>
      {!isShot && (
        <motion.div
          key={id}
          initial={{ x: initialX, y: initialY, scaleX: direction === 'right' ? 1 : -1 }}
          animate="fly"
          exit="shot"
          variants={variants}
          onClick={handleClick}
          className="absolute cursor-crosshair"
          style={{ transformOrigin: 'center' }}
        >
          <Bird className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}