import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, RotateCcw } from 'lucide-react';
import LatteArtScene from './LatteArtScene';
import Img from './Img';
import { hero, brand, image } from '../data/cafeConfig';
import { scrollToSection } from '../lib/browser';

const LABELS = [
  { id: 'crema', text: '01 — CREMA', className: 'hero__label--a' },
  { id: 'microfoam', text: '02 — MICROFOAM', className: 'hero__label--b' },
  { id: 'art', text: 'LATTE ART / IN PROGRESS', className: 'hero__label--c' },
];

/**
 * The hero: an asymmetric editorial composition with the latte-art pour
 * occupying the centre and right of the frame.
 */
export default function CoffeeHero({ reduced, quality, onReady }) {
  const replayRef = useRef(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [ground, setGround] = useState(0);

  useEffect(() => {
    if (reduced) {
      setGround(1284);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 2200);
      setGround(Math.round(1284 * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const handleReady = () => {
    setSceneReady(true);
    onReady?.();
  };

  const reveal = (delay) =>
    reduced
      ? {}
      : {
          initial: { y: 26, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section className="hero" id="home">
      <div className="hero__bg" aria-hidden="true" />

      <div className={`hero__stage ${sceneReady ? 'is-ready' : ''}`}>
        {quality.webgl ? (
          <LatteArtScene
            palette={{ espresso: '#241309', crema: '#7b4a2b', milk: '#fff8ec' }}
            quality={quality}
            replayRef={replayRef}
            onReady={handleReady}
          />
        ) : (
          <div className="hero__fallback">
            <Img
              src={image('Close-up of a cappuccino with rosetta latte art, dark warm background', 'portrait_4_3')}
              alt="Rosetta latte art in a ceramic cup"
            />
          </div>
        )}
      </div>

      <div className="hero__copy">
        <motion.p className="hero__eyebrow" {...reveal(0.15)}>
          {hero.eyebrow}
        </motion.p>

        <motion.h1 className="hero__headline" {...reveal(0.25)}>
          <span className="hero__headline-lead">{hero.headlineLead}</span>
          <span className="hero__headline-tail">{hero.headlineTail}</span>
        </motion.h1>

        <motion.p className="hero__supporting" {...reveal(0.38)}>
          {hero.supporting}
        </motion.p>

        <motion.div className="hero__actions" {...reveal(0.5)}>
          <button
            className="btn btn--solid"
            type="button"
            onClick={() => scrollToSection('menu', { reduced })}
          >
            {hero.primaryCta.label}
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => scrollToSection('craft', { reduced })}
          >
            {hero.secondaryCta.label}
          </button>
        </motion.div>

        <motion.button
          className="hero__pour"
          type="button"
          onClick={() => replayRef.current?.()}
          disabled={!quality.webgl || reduced}
          {...reveal(0.6)}
        >
          <RotateCcw size={15} strokeWidth={1.9} aria-hidden="true" />
          {hero.pourCta}
        </motion.button>
      </div>

      {LABELS.map((label, index) => (
        <motion.span
          key={label.id}
          className={`hero__label ${label.className}`}
          {...reveal(0.7 + index * 0.1)}
        >
          {label.text}
        </motion.span>
      ))}

      <aside className="hero__vertical" aria-hidden="true">
        {hero.verticalNote}
      </aside>

      <div className="hero__ground">
        <div className="hero__ground-bar" aria-hidden="true">
          <motion.i
            initial={{ scaleX: 0 }}
            animate={{ scaleX: sceneReady ? 1 : 0.2 }}
            transition={{ duration: reduced ? 0 : 2.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p>
          <span className="hero__ground-count">{ground.toLocaleString('en-IN')}</span>
          <span className="hero__ground-label">{hero.beansLabel}</span>
        </p>
      </div>

      <button
        className="hero__scroll"
        type="button"
        onClick={() => scrollToSection('craft', { reduced })}
      >
        <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
        <span>{hero.scrollHint}</span>
      </button>

      <span className="hero__brand-mark" aria-hidden="true">
        {brand.wordmark}
      </span>
    </section>
  );
}
