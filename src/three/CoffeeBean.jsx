import { useMemo } from 'react';
import * as THREE from 'three';
import { createBeanGeometry } from '../lib/geometry';

/**
 * A single 3D coffee bean. Geometry is generated once and shared between all
 * instances so dozens of beans cost almost nothing.
 */
let cachedGeometry = null;
const getGeometry = () => {
  if (!cachedGeometry) cachedGeometry = createBeanGeometry();
  return cachedGeometry;
};

export default function CoffeeBean({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#4a2c19',
  roughness = 0.62,
  ...rest
}) {
  const geometry = useMemo(getGeometry, []);

  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      {...rest}
    >
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.06} />
    </mesh>
  );
}

/** Shared bean geometry for instanced meshes. */
export const beanGeometry = getGeometry;
