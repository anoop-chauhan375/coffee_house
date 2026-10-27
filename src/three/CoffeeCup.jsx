import { useMemo } from 'react';
import * as THREE from 'three';
import {
  CUP_PROFILE,
  SAUCER_PROFILE,
  handlePlacement,
  toLathePoints,
} from '../lib/geometry';
import CoffeeSurface from './CoffeeSurface';

const HANDLE_ARC = Math.PI * 1.25;
const HANDLE_RING = 0.26;
// Outer wall of the cup where the handle hangs (profile y ≈ 0.84).
const HANDLE = handlePlacement({ wallX: 0.845, y: 0.84, ring: HANDLE_RING, arc: HANDLE_ARC });

/**
 * The ceramic cup: saucer, latte profile, a torus handle and the espresso
 * surface. Modeled with real geometry so light and reflections behave.
 */
export default function CoffeeCup({
  pourState,
  artTexture,
  cremaTexture,
  colors,
  showSaucer = true,
  mug = false,
  castShadow = true,
  ...rest
}) {
  const cupGeometry = useMemo(() => toLathePoints(CUP_PROFILE, 72), []);
  const saucerGeometry = useMemo(() => toLathePoints(SAUCER_PROFILE, 80), []);

  const ceramic = mug ? '#f2e7d6' : '#fffaf2';

  return (
    <group {...rest}>
      {showSaucer && (
        <mesh
          geometry={saucerGeometry}
          position={[0, -0.12, 0]}
          castShadow={castShadow}
          receiveShadow
        >
          <meshPhysicalMaterial
            color={ceramic}
            roughness={0.32}
            clearcoat={0.55}
            clearcoatRoughness={0.4}
            metalness={0}
          />
        </mesh>
      )}

      <mesh geometry={cupGeometry} castShadow={castShadow} receiveShadow>
        <meshPhysicalMaterial
          color={ceramic}
          roughness={0.28}
          clearcoat={0.7}
          clearcoatRoughness={0.35}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* handle */}
      <mesh position={HANDLE.position} rotation={HANDLE.rotation} castShadow={castShadow}>
        <torusGeometry args={[HANDLE_RING, 0.065, 20, 44, HANDLE_ARC]} />
        <meshPhysicalMaterial
          color={ceramic}
          roughness={0.3}
          clearcoat={0.7}
          clearcoatRoughness={0.35}
        />
      </mesh>

      <CoffeeSurface
        artTexture={artTexture}
        cremaTexture={cremaTexture}
        pourState={pourState}
        colors={colors}
      />
    </group>
  );
}
