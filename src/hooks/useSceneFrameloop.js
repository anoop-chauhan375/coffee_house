import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Parks a WebGL scene's render loop while its canvas is off screen.
 *
 * The page keeps six canvases alive at once (hero, lab, story, three showcase
 * cups). Left alone, every one of them renders at full rate forever, so the
 * cost of the page is the sum of all of them rather than the one you can
 * actually see. This keeps only the visible scenes drawing.
 *
 * This uses a callback ref to ensure the IntersectionObserver is attached
 * even if the Canvas component populates the ref after mount.
 */
export default function useSceneFrameloop(margin = '240px 0px') {
  const [frameloop, setFrameloop] = useState('always');
  const observerRef = useRef(null);

  const canvasRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (node) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setFrameloop(entry.isIntersecting ? 'always' : 'never');
          },
          { rootMargin: margin },
        );
        observer.observe(node);
        observerRef.current = observer;
      }
    },
    [margin],
  );

  return [canvasRef, frameloop];
}
