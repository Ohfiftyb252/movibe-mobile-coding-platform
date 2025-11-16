import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
interface DiceProps {
  value: number;
  isRolling: boolean;
  delay?: number;
}
const faceRotations = {
  1: { rotateX: 0, rotateY: 0 },
  2: { rotateX: -90, rotateY: 0 },
  3: { rotateX: 0, rotateY: -90 },
  4: { rotateX: 0, rotateY: 90 },
  5: { rotateX: 90, rotateY: 0 },
  6: { rotateX: 180, rotateY: 0 },
};
const Dot = () => <span className="block w-3 h-3 md:w-4 md:h-4 bg-ov-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"></span>;
const DiceFace = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("absolute w-full h-full bg-ov-dark border-2 border-ov-primary/30 rounded-lg flex items-center justify-center p-2", className)}>
    {children}
  </div>
);
export function Dice({ value, isRolling, delay = 0 }: DiceProps) {
  const dieSize = "w-20 h-20 md:w-24 md:h-24";
  const translateZ = "md:translate-z-12 translate-z-10";
  return (
    <div className={cn("perspective-1000", dieSize)}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={faceRotations[1]}
        animate={isRolling ? {
          rotateX: [0, 720 + Math.random() * 360],
          rotateY: [0, 720 + Math.random() * 360],
        } : faceRotations[value]}
        transition={{
          duration: isRolling ? 1.5 : 0.5,
          delay: isRolling ? delay : 0,
          ease: isRolling ? "circOut" : "easeOut"
        }}
      >
        {/* Face 1 */}
        <DiceFace className={cn("rotate-y-0", translateZ)}>
          <div className="flex justify-center items-center w-full h-full"><Dot /></div>
        </DiceFace>
        {/* Face 2 */}
        <DiceFace className={cn("rotate-x-90", translateZ)}>
          <div className="flex justify-between w-full h-full items-start"><Dot /><Dot className="self-end"/></div>
        </DiceFace>
        {/* Face 3 */}
        <DiceFace className={cn("rotate-y-90", translateZ)}>
          <div className="flex justify-between w-full h-full items-start"><Dot /><Dot className="self-center" /><Dot className="self-end"/></div>
        </DiceFace>
        {/* Face 4 */}
        <DiceFace className={cn("-rotate-y-90", translateZ)}>
          <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between"><Dot /><Dot /></div><div className="flex flex-col justify-between"><Dot /><Dot /></div></div>
        </DiceFace>
        {/* Face 5 */}
        <DiceFace className={cn("-rotate-x-90", translateZ)}>
          <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between"><Dot /><Dot /></div><Dot className="self-center" /><div className="flex flex-col justify-between"><Dot /><Dot /></div></div>
        </DiceFace>
        {/* Face 6 */}
        <DiceFace className={cn("rotate-x-180", translateZ)}>
          <div className="flex justify-between w-full h-full"><div className="flex flex-col justify-between"><Dot /><Dot /><Dot /></div><div className="flex flex-col justify-between"><Dot /><Dot /><Dot /></div></div>
        </DiceFace>
      </motion.div>
    </div>
  );
}