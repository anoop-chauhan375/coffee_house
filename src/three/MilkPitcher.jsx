import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PITCHER_PROFILE, handlePlacement, toLathePoints } from '../lib/geometry';

const HANDLE_ARC = Math.PI * 1.25;
const HANDLE_RING = 0.22;
// Outer wall of the pitcher where the handle hangs; opposite the spout at -X.
const HANDLE = handlePlacement({ wallX: 0.57, y: 1.0, ring: HANDLE_RING, arc: HANDLE_ARC });

/**
 * Stainless-steel milk pitcher. The tilt and lift are driven every frame from
 * the shared `pourState`, so the timeline and the milk stream stay in sync.
 */
export default function MilkPitcher({
  pourState,
  position = [0, 0, 0],
  baseTilt = 0.06,
  castShadow = true,
}) {
  const groupRef = useRef(null);
  const geometry = useMemo(() => toLathePoints(PITCHER_PROFILE, 64), []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const tilt = pourState ? pourState.tilt : 0;
    const lift = pourState ? pourState.lift : 0;
    group.rotation.z = baseTilt + tilt;
    group.position.y = position[1] + lift * 2.4;
    group.position.x = position[0] - lift * 0.5;
    group.rotation.x = lift * 0.35;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Pitcher is modelled with its spout on the -X side, facing the cup. */}
      <mesh geometry={geometry} castShadow={castShadow}>
        <meshStandardMaterial color="#cfd1d4" metalness={1} roughness={0.24} envMapIntensity={1.1} />
      </mesh>

      {/* pouring spout */}
      <mesh position={[-0.5, 1.32, 0]} rotation={[0, 0, -0.75]} castShadow={castShadow}>
        <coneGeometry args={[0.15, 0.46, 24, 1, true]} />
        <meshStandardMaterial color="#cfd1d4" metalness={1} roughness={0.24} side={THREE.DoubleSide} />
      </mesh>

      {/* handle */}
      <mesh position={HANDLE.position} rotation={HANDLE.rotation} castShadow={castShadow}>
        <torusGeometry args={[HANDLE_RING, 0.05, 16, 40, HANDLE_ARC]} />
        <meshStandardMaterial color="#cfd1d4" metalness={1} roughness={0.28} />
      </mesh>

      {/* milk sitting inside the pitcher */}
      <mesh position={[0, 1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.56, 48]} />
        <meshStandardMaterial color="#fdf6ea" roughness={0.25} metalness={0} />
      </mesh>
    </group>
  );
}
