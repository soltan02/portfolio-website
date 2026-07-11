import { ArrowUpRight } from 'lucide-react';

interface LiveProjectButtonProps {
  href: string;
  className?: string;
}

export default function LiveProjectButton({ href, className = '' }: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border-2 border-[#D7E2EA] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base text-[#D7E2EA] font-medium uppercase tracking-widest transition-colors hover:bg-[#D7E2EA]/10 ${className}`}
    >
      Live Project
      <ArrowUpRight size={18} />
    </a>
  );
}
