import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navLinks, brand } from '../data/cafeConfig';
import { scrollToSection } from '../lib/browser';

/**
 * A compact floating control panel rather than a conventional transparent bar:
 * the wordmark on the left, a small machine-style trigger on the right that
 * opens the full-screen menu.
 */
export default function Navigation({ reduced }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    // Let the overlay finish closing before scrolling.
    window.setTimeout(() => scrollToSection(id, { reduced }), reduced ? 0 : 220);
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--settled' : ''}`}>
        <div className="nav__panel">
          <button className="nav__brand" type="button" onClick={() => go('home')} aria-label="Buland Coffee House — back to top">
            <span className="nav__brand-mark" aria-hidden="true" />
            <span className="nav__brand-text">{brand.wordmark}</span>
          </button>

          <div className="nav__meta" aria-hidden="true">
            <span className="nav__pulse" />
            <span>BREWING</span>
            <span className="nav__meta-dot" />
            <span>{brand.city.toUpperCase()}</span>
          </div>

          <button
            className={`nav__trigger ${open ? 'is-open' : ''}`}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="fullscreen-menu"
          >
            <span className="nav__trigger-label">{open ? 'CLOSE' : 'MENU'}</span>
            <span className="nav__trigger-bars" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && <FullscreenMenu onSelect={go} onClose={() => setOpen(false)} reduced={reduced} />}
      </AnimatePresence>
    </>
  );
}

function FullscreenMenu({ onSelect, onClose, reduced }) {
  const transition = reduced ? { duration: 0 } : { duration: 0.7, ease: [0.76, 0, 0.24, 1] };

  return (
    <motion.div
      id="fullscreen-menu"
      className="menu-overlay"
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={transition}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
    >
      <div className="menu-overlay__glow" aria-hidden="true" />

      {/* the animated bean drifting behind the type */}
      <div className="menu-overlay__bean" aria-hidden="true">
        <svg viewBox="0 0 200 240">
          <defs>
            <radialGradient id="beanGrad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#C78E65" />
              <stop offset="60%" stopColor="#5b3520" />
              <stop offset="100%" stopColor="#21140F" />
            </radialGradient>
          </defs>
          <ellipse cx="100" cy="120" rx="82" ry="106" fill="url(#beanGrad)" />
          <path d="M100 18c22 34 22 170 0 204" fill="none" stroke="#F4EBDD" strokeOpacity="0.4" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      <button className="menu-overlay__close" type="button" onClick={onClose} aria-label="Close menu">
        Close
      </button>

      <nav className="menu-overlay__nav">
        <ul>
          {navLinks.map((link, index) => (
            <motion.li
              key={link.id}
              initial={reduced ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.18 + index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" onClick={() => onSelect(link.id)}>
                <span className="menu-overlay__index">{link.index}</span>
                <span className="menu-overlay__label">{link.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>

      <footer className="menu-overlay__foot">
        <span>{brand.name}</span>
        <span>{brand.city}, {brand.region}</span>
      </footer>
    </motion.div>
  );
}
