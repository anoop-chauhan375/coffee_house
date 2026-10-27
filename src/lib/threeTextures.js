import * as THREE from 'three';

/**
 * Procedural canvas textures.
 *
 * Everything the coffee scenes need is drawn at runtime — latte-art masks,
 * crema noise and steam puffs — so the site never depends on an external
 * texture file that could 404.
 */

/* ------------------------------------------------------------- latte art */

function drawHeart(ctx, cx, cy, width, height) {
  const r = width * 0.3;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx - width * 0.26, cy, r, Math.PI, 0);
  ctx.arc(cx + width * 0.26, cy, r, Math.PI, 0);
  ctx.lineTo(cx, cy + height * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLeaf(ctx, cx, cy, length, thickness, angle, side) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(side, 1);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-length * 0.05, -thickness * 0.5);
  ctx.quadraticCurveTo(length * 0.55, -thickness * 1.5, length, -thickness * 0.1);
  ctx.quadraticCurveTo(length * 0.55, thickness * 1.1, -length * 0.05, thickness * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a classic rosetta into a canvas.
 *  - red channel  → the poured milk art (heart + fern leaves)
 *  - green channel → the thin "pull-through" stem drawn last
 */
export function drawLatteArt(ctx, size) {
  const cx = size * 0.5;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  /* soft halo so the milk melts into the crema instead of hard-edging */
  const halo = ctx.createRadialGradient(cx, size * 0.58, size * 0.02, cx, size * 0.58, size * 0.46);
  halo.addColorStop(0, 'rgba(190,0,0,0.85)');
  halo.addColorStop(0.62, 'rgba(120,0,0,0.35)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, size * 0.58, size * 0.46, 0, Math.PI * 2);
  ctx.fill();

  /* the art itself — bright red for a strong mask */
  ctx.fillStyle = '#ff0000';

  const heartY = size * 0.25;
  drawHeart(ctx, cx, heartY, size * 0.34, size * 0.2);

  const pairs = 9;
  const topY = size * 0.4;
  const botY = size * 0.83;
  for (let i = 0; i < pairs; i += 1) {
    const t = i / (pairs - 1);
    const y = topY + (botY - topY) * t;
    const grow = Math.sin(Math.PI * (0.16 + 0.8 * t));
    const length = size * 0.31 * grow;
    const thickness = size * (0.062 - 0.028 * t);
    const angle = 0.3 + 0.26 * t;
    drawLeaf(ctx, cx, y, length, thickness, angle, 1);
    drawLeaf(ctx, cx, y, length, thickness, angle, -1);
  }

  /* narrow tip that closes the fern */
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.03, size * 0.84);
  ctx.quadraticCurveTo(cx, size * 0.9, cx + size * 0.03, size * 0.84);
  ctx.quadraticCurveTo(cx, size * 0.87, cx - size * 0.03, size * 0.84);
  ctx.fill();

  /* pull-through: green channel, drawn after so it thins the centre line */
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.014, heartY + size * 0.16);
  ctx.lineTo(cx + size * 0.014, heartY + size * 0.16);
  ctx.lineTo(cx + size * 0.006, size * 0.9);
  ctx.lineTo(cx - size * 0.006, size * 0.9);
  ctx.closePath();
  ctx.fill();
}

export function createLatteArtTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawLatteArt(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/* ----------------------------------------------------------------- crema */

/** Soft value-noise used to break up the espresso and crema surfaces. */
export function createCremaTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = 90 + Math.random() * 120;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  // Blur a couple of times to turn per-pixel noise into an organic blotch.
  const blurred = document.createElement('canvas');
  blurred.width = size;
  blurred.height = size;
  const bctx = blurred.getContext('2d');
  bctx.filter = 'blur(5px)';
  bctx.drawImage(canvas, 0, 0);
  bctx.filter = 'blur(9px)';
  bctx.drawImage(blurred, 0, 0);

  const texture = new THREE.CanvasTexture(blurred);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/* ----------------------------------------------------------------- steam */

/** A single soft round puff used for steam and coffee dust particles. */
export function createPuffTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.42)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
