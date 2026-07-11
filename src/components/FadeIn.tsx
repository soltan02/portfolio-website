import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  as?: ElementType;
  className?: string;
}

/** Reveals children with a fade + slide once they scroll into view.
 *  `once: true` means it never re-hides on scroll back up — a portfolio
 *  should feel calm, not replay animations every time you scroll past. */
export default function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, as = 'div', className }: FadeInProps) {
  const MotionTag = motion.create(as as ElementType);
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionTag>
  );
}
