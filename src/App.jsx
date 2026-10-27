import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import CoffeeHero from './components/CoffeeHero';
import CoffeeLab from './components/CoffeeLab';
import InteractiveMenu from './components/InteractiveMenu';
import CoffeeStory from './components/CoffeeStory';
import LifestyleGallery from './components/LifestyleGallery';
import BulandExperience from './components/BulandExperience';
import VisitSection from './components/VisitSection';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import useReducedMotion from './hooks/useReducedMotion';
import useResponsiveQuality from './hooks/useResponsiveQuality';

export default function App() {
  const reduced = useReducedMotion();
  const quality = useResponsiveQuality();

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const handleHeroReady = useCallback(() => setHeroLoaded(true), []);
  const ready = reduced ? minElapsed : heroLoaded && minElapsed;

  return (
    <div className="app">
      <a className="skip-link" href="#craft">
        Skip to content
      </a>

      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            className="loader-wrap"
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5 }}
          >
            <LoadingScreen onDone={handleHeroReady} />
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation reduced={reduced} />

      <main>
        <CoffeeHero reduced={reduced} quality={quality} onReady={handleHeroReady} />
        <CoffeeLab reduced={reduced} quality={quality} />
        <InteractiveMenu reduced={reduced} quality={quality} />
        <CoffeeStory reduced={reduced} quality={quality} />
        <LifestyleGallery reduced={reduced} />
        <BulandExperience reduced={reduced} quality={quality} />
        <VisitSection reduced={reduced} quality={quality} />
      </main>

      <Footer reduced={reduced} />
    </div>
  );
}
