import { useEffect, useRef, useState } from 'react';

/**
 * Observes an element and reports when it first enters the viewport.
 * Once revealed it stays revealed so content never flickers back out.
 */
export default function useInView({ rootMargin = '0px 0px -12% 0px', threshold = 0.18 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}
