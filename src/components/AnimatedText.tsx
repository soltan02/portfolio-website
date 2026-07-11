import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

function Char({ char, progress, index, total }: { char: string; progress: MotionValue<number>; index: number; total: number }) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return (
    <span className="relative inline-block">
      <span className="invisible">{char === ' ' ? ' ' : char}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {char === ' ' ? ' ' : char}
      </motion.span>
    </span>
  );
}

/** Reveals text one character at a time as the paragraph scrolls through
 *  the viewport — each character's opacity is driven by its position in
 *  the string relative to overall scroll progress, not by time. */
export default function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] });
  const chars = text.split('');

  return (
    <p ref={ref} className={className}>
      {chars.map((c, i) => (
        <Char key={i} char={c} progress={scrollYProgress} index={i} total={chars.length} />
      ))}
    </p>
  );
}
