import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

/**
 * The branded loading state shown while the hero scene warms up: a bean filling
 * with "milk" while the counter climbs. Never a blank screen.
 */
export default function LoadingScreen({ label = 'Warming the cup', onDone }) {
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setCount(Math.round(value)),
      onComplete: () => {
        setHidden(true);
        onDone?.();
      },
    });
    controlsRef.current = controls;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`loader ${hidden ? 'loader--hidden' : ''}`} aria-hidden={hidden} role="status">
      <div className="loader__inner">
        <svg className="loader__bean" viewBox="0 0 120 140" aria-hidden="true">
          <defs>
            <clipPath id="beanClip">
              <ellipse cx="60" cy="70" rx="52" ry="66" />
            </clipPath>
          </defs>
          <ellipse cx="60" cy="70" rx="52" ry="66" fill="none" stroke="rgba(244,235,221,0.28)" strokeWidth="2" />
          <g clipPath="url(#beanClip)">
            <rect
              className="loader__fill"
              x="0"
              y={140 - (count / 100) * 140}
              width="120"
              height="140"
            />
          </g>
          <path d="M60 8c14 22 14 100 0 124" fill="none" stroke="rgba(244,235,221,0.5)" strokeWidth="3" strokeLinecap="round" />
        </svg>

        <p className="loader__label">{label}</p>
        <p className="loader__count">
          <span>{String(count).padStart(3, '0')}</span>
          <em>%</em>
        </p>
      </div>
    </div>
  );
}
