import { useEffect, useState } from 'react';

/**
 * Reports how far a section has travelled through the viewport (0 → 1).
 *
 * Kept dependency-free and rAF-throttled so it is cheap enough to run on
 * several sections at once on a phone.
 */
export default function useScrollProgress(ref, { start = 'top bottom', end = 'bottom top' } = {}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') return undefined;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;

      // Convert the start/end descriptions into pixel positions.
      const startAt = start === 'top top' ? 0 : vh;
      const endAt = end === 'bottom top' ? -rect.height : vh - rect.height;

      const span = startAt - endAt || 1;
      const value = (startAt - rect.top) / span;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, start, end]);

  return progress;
}
