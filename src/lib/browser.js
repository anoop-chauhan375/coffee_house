/** Shared browser helpers used across the site. */

let cachedWebGL = null;

/**
 * Feature-detects WebGL once and caches the result so we never create more
 * probe contexts than necessary (each one costs a GPU context slot).
 */
export function hasWebGL() {
  if (cachedWebGL !== null) return cachedWebGL;
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cachedWebGL = Boolean(gl);
    if (gl) {
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  } catch (error) {
    cachedWebGL = false;
  }

  return cachedWebGL;
}

/** Smoothly scrolls to a section id, honouring reduced-motion preferences. */
export function scrollToSection(id, { reduced = false } = {}) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 8;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

/** Cheap, dependency-free coarse pointer check (phones / touch laptops). */
export function isCoarsePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** True when the visitor prefers less motion. Safe on the server. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
