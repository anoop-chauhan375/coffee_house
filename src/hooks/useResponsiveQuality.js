import { useEffect, useState } from 'react';
import { hasWebGL, isCoarsePointer, prefersReducedMotion } from '../lib/browser';

/**
 * Derives a rendering quality tier (high / medium / low) from device signals.
 * Used to scale particle counts, shadows and DPR on the 3D scenes so the
 * latte-art hero stays smooth on phones without looking thin on desktops.
 */
export default function useResponsiveQuality() {
  const [quality, setQuality] = useState(() => estimate());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setQuality(estimate()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return quality;
}

function estimate() {
  const base = {
    webgl: true,
    reduced: false,
    tier: 'high',
    dpr: [1, 1.6],
    beans: 14,
    particles: 260,
    steam: 9,
    shadows: true,
  };

  if (typeof window === 'undefined') return base;

  const webgl = hasWebGL();
  const reduced = prefersReducedMotion();
  const coarse = isCoarsePointer();
  const width = window.innerWidth || 1200;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;

  let tier = 'high';
  if (coarse || width < 820 || cores <= 4) tier = 'medium';
  if (width < 520 || cores <= 2 || memory <= 2) tier = 'low';

  const table = {
    high: { dpr: [1, 1.6], beans: 16, particles: 300, steam: 10, shadows: true },
    medium: { dpr: [1, 1.4], beans: 10, particles: 170, steam: 7, shadows: false },
    low: { dpr: [1, 1.25], beans: 7, particles: 90, steam: 5, shadows: false },
  };

  return { webgl, reduced, coarse, tier, ...table[tier] };
}
