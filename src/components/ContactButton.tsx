import { COLORS } from '../lib/theme';

interface ContactButtonProps {
  href?: string;
  className?: string;
}

export default function ContactButton({ href = '#contact', className = '' }: ContactButtonProps) {
  const { deep, magenta, violet, ember } = COLORS.accent;
  return (
    <a
      href={href}
      className={`inline-block rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base text-white font-medium uppercase tracking-widest text-center outline outline-2 outline-white outline-offset-[-3px] transition-transform duration-200 hover:scale-[1.03] ${className}`}
      style={{
        background: `linear-gradient(123deg, ${deep} 7%, ${magenta} 37%, ${violet} 72%, ${ember} 100%)`,
        boxShadow: `0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px ${violet} inset`,
      }}
    >
      Contact Me
    </a>
  );
}
