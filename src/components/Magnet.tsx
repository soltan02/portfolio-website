import { useRef, useState, type ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

/** Mouse-following magnetic hover — the wrapped element eases toward the
 *  cursor within `padding` px of its edges, and springs back once the
 *  cursor leaves that zone. Purely decorative; harmless if a touch
 *  device never fires mousemove (element just stays put). */
export default function Magnet({
  children,
  padding = 100,
  strength = 4,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate3d(0px, 0px, 0)');
  const [transition, setTransition] = useState(inactiveTransition);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const activeRadius = Math.max(rect.width, rect.height) / 2 + padding;
    if (dist < activeRadius) {
      setTransition(activeTransition);
      setTransform(`translate3d(${dx / strength}px, ${dy / strength}px, 0)`);
    } else {
      setTransition(inactiveTransition);
      setTransform('translate3d(0px, 0px, 0)');
    }
  };

  const handleMouseLeave = () => {
    setTransition(inactiveTransition);
    setTransform('translate3d(0px, 0px, 0)');
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition, willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
