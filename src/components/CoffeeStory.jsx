import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StoryScene from '../three/StoryScene';
import { story } from '../data/cafeConfig';

gsap.registerPlugin(ScrollTrigger);

const WINDOWS = [
  [0.04, 0.16, 0.3],
  [0.36, 0.46, 0.6],
  [0.68, 0.78, 0.94],
];

const windowOpacity = (p, [inStart, full, outStart]) => {
  if (p < inStart) return 0;
  if (p < full) return (p - inStart) / (full - inStart);
  if (p < outStart) return 1;
  return Math.max(0, 1 - (p - outStart) / 0.08);
};

/**
 * Section four — Coffee in slow motion. A pinned stage where the scroll drives
 * the opening bean, the particles and the final swirl, with three editorial
 * words surfacing as each beat unfolds.
 */
export default function CoffeeStory({ reduced, quality }) {
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return undefined;
    }
    const trigger = ScrollTrigger.create({
      trigger: outerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => trigger.kill();
  }, [reduced]);

  return (
    <section className="story" id="story" ref={outerRef}>
      <div className="story__sticky">
        <div className="story__canvas">
          {quality.webgl ? (
            <StoryScene progress={progress} quality={quality} reduced={reduced} />
          ) : (
            <div className="story__fallback" aria-hidden="true" />
          )}
        </div>

        <div className="story__overlay">
          <p className="section-label section-label--light">{story.label}</p>

          <div className="story__words">
            {story.words.map((word, index) => (
              <span
                key={word}
                className="story__word"
                style={{
                  opacity: reduced ? 1 : windowOpacity(progress, WINDOWS[index]),
                  transform: reduced
                    ? 'none'
                    : `translateY(${(1 - windowOpacity(progress, WINDOWS[index])) * 40}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          <p className="story__caption" style={{ opacity: reduced ? 1 : 0.4 + windowOpacity(progress, WINDOWS[2]) * 0.6 }}>
            {story.caption}
          </p>

          <div className="story__track" aria-hidden="true">
            <span style={{ transform: `scaleY(${reduced ? 1 : progress})` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
