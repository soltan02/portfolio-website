import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { COLORS } from '../lib/theme';

interface LiveProjectButtonProps {
  href: string;
  className?: string;
  accentColor?: string;
}

export default function LiveProjectButton({ href, className = '', accentColor = COLORS.mist }: LiveProjectButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border-2 px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest ${className}`}
      style={{ borderColor: accentColor, color: accentColor }}
      whileHover={{ backgroundColor: `${accentColor}1A` }}
      transition={{ duration: 0.2 }}
    >
      Live Project
      <ArrowUpRight size={18} />
    </motion.a>
  );
}
