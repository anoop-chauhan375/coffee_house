import * as THREE from 'three';

/* ------------------------------------------------------------------ beans */

/**
 * Builds a single coffee-bean geometry procedurally: an ellipsoid that is
 * squashed along its width and carved with a crease down one face — the way a
 * real bean splits. No external model files, so it always loads.
 */
export function createBeanGeometry({ widthSegments = 40, heightSegments = 28 } = {}) {
  const geometry = new THREE.SphereGeometry(1, widthSegments, heightSegments);
  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vector.fromBufferAttribute(position, i);
    const direction = vector.clone().normalize();

    // Width / length / depth of a coffee bean.
    let x = vector.x * 0.74;
    let y = vector.y * 1.24;
    let z = vector.z * 0.92;

    // Carve the crease: only on the +Z face, strongest along the centre line.
    const acrossCentre = Math.exp(-((x / 0.34) ** 2) * 3.2);
    const facing = Math.max(0, direction.z);
    const crease = acrossCentre * facing;
    z -= crease * 0.3;
    x *= 1 - crease * 0.12;

    position.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/* -------------------------------------------------------------------- cup */

/**
 * Profile of a ceramic cup: outer wall up to the rim, over the lip, down the
 * inner wall and across the inside floor. Points are (radius, height).
 */
export const CUP_PROFILE = [
  [0.0, 0.0],
  [0.5, 0.0],
  [0.6, 0.05],
  [0.68, 0.2],
  [0.76, 0.45],
  [0.83, 0.72],
  [0.87, 0.98],
  [0.885, 1.15],
  [0.9, 1.24],
  [0.86, 1.3],
  [0.83, 1.27],
  [0.8, 1.16],
  [0.77, 0.92],
  [0.72, 0.66],
  [0.64, 0.4],
  [0.5, 0.24],
  [0.0, 0.22],
];

/** Height (in cup units) of the coffee surface inside the cup. */
export const CUP_LIQUID_Y = 1.0;

/** Inner radius at the coffee surface height. */
export const CUP_LIQUID_RADIUS = 0.79;

export function toLathePoints(profile, segments = 64) {
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

/** A matching saucer: flat plate with a soft raised rim. */
export const SAUCER_PROFILE = [
  [0.0, 0.0],
  [0.9, 0.0],
  [1.35, 0.02],
  [1.55, 0.09],
  [1.62, 0.18],
  [1.6, 0.22],
  [1.52, 0.16],
  [1.3, 0.09],
  [0.9, 0.07],
  [0.0, 0.07],
];

/* ---------------------------------------------------------------- pitcher */

/** Profile of a stainless milk pitcher: narrow base flaring to a wide lip. */
export const PITCHER_PROFILE = [
  [0.0, 0.0],
  [0.34, 0.0],
  [0.4, 0.02],
  [0.44, 0.1],
  [0.5, 0.45],
  [0.56, 0.9],
  [0.6, 1.25],
  [0.62, 1.42],
  [0.6, 1.47],
  [0.57, 1.44],
  [0.54, 1.3],
  [0.5, 1.0],
  [0.45, 0.6],
  [0.38, 0.24],
  [0.3, 0.16],
  [0.0, 0.15],
];

/* ----------------------------------------------------------- espresso lab */

/** Profile of a glass vial for the alchemy lab. */
export const VIAL_PROFILE = [
  [0.0, 0.0],
  [0.28, 0.0],
  [0.3, 0.02],
  [0.3, 1.2],
  [0.32, 1.3],
  [0.36, 1.35],
  [0.34, 1.38],
  [0.3, 1.35],
  [0.26, 1.2],
  [0.26, 0.05],
  [0.0, 0.05],
];

/** Profile of a gooseneck kettle body. */
export const KETTLE_PROFILE = [
  [0.0, 0.0],
  [0.6, 0.0],
  [0.72, 0.08],
  [0.78, 0.3],
  [0.75, 0.8],
  [0.62, 1.35],
  [0.55, 1.45],
  [0.58, 1.5],
  [0.54, 1.52],
  [0.5, 1.48],
  [0.54, 1.4],
  [0.66, 0.8],
  [0.7, 0.3],
  [0.58, 0.08],
  [0.0, 0.06],
];

/** Profile of a small demitasse espresso cup for the coffee-lab still life. */
export const DEMITASSE_PROFILE = [
  [0.0, 0.0],
  [0.34, 0.0],
  [0.4, 0.03],
  [0.44, 0.14],
  [0.5, 0.4],
  [0.53, 0.62],
  [0.54, 0.72],
  [0.51, 0.76],
  [0.49, 0.7],
  [0.46, 0.45],
  [0.4, 0.2],
  [0.3, 0.12],
  [0.0, 0.11],
];

/* ---------------------------------------------------------------- helpers */

/**
 * Places a partial-torus handle against a vessel wall.
 *
 * A torus sweeps counter-clockwise from +X, so its open wedge points away from
 * the arc's midpoint. Rotating by half the arc turns that wedge to face -X,
 * which lets both cut ends meet the wall while the ring bulges outward — a
 * proper vertical C instead of a hoop lying flat around the cup.
 *
 * `wallX` is the vessel's outer radius at the handle's height.
 */
export function handlePlacement({ wallX, y = 0.8, ring = 0.26, arc = Math.PI * 1.25 }) {
  return {
    position: [wallX - Math.cos(arc / 2) * ring, y, 0],
    rotation: [0, 0, -arc / 2],
  };
}

/** Builds a smooth tube along a list of points. */
export function createTubeFromPoints(points, radius, tubularSegments = 48, radialSegments = 12) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
}

/** Deterministic pseudo-random so layouts are stable between renders. */
export function seededRandom(seed = 1) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/* ------------------------------------------------------------ half beans */

/**
 * One half of a coffee bean, used by the story scene so the bean can crack
 * open. `side` is +1 for the front half, -1 for the back half; the crease is
 * carved on the outer face of each half so the two read as one bean when shut.
 */
export function createHalfBeanGeometry(side = 1, { widthSegments = 32, heightSegments = 20 } = {}) {
  const phiStart = side > 0 ? 0 : Math.PI;
  const geometry = new THREE.SphereGeometry(
    1,
    widthSegments,
    heightSegments,
    phiStart,
    Math.PI,
    0,
    Math.PI,
  );
  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vector.fromBufferAttribute(position, i);
    const direction = vector.clone().normalize();

    let x = vector.x * 0.74;
    let y = vector.y * 1.24;
    let z = vector.z * 0.92;

    // For the back half the geometry is mirrored, so flip the carve side.
    const facing = Math.max(0, direction.z * side);
    const acrossCentre = Math.exp(-((x / 0.34) ** 2) * 3.2);
    const crease = side > 0 ? acrossCentre * facing : acrossCentre * 0;
    z -= crease * 0.3;
    x *= 1 - crease * 0.12;

    position.setXYZ(i, x, y, z);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
