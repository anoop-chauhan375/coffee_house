import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createPuffTexture } from '../lib/threeTextures';

/**
 * Rising steam. Positions are advanced inside the vertex shader from a single
 * time uniform, so the whole plume is one draw call with no per-frame CPU work.
 */
export default function SteamEffect({
  count = 9,
  radius = 0.5,
  height = 1.6,
  opacity = 0.16,
  color = '#fff3e2',
  position = [0, 1.0, 0],
  active = true,
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: height },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uPuff: { value: createPuffTexture() },
      uActive: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [height, opacity, color],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      speeds[i] = 0.12 + Math.random() * 0.16;
      phases[i] = Math.random();
      scales[i] = 0.5 + Math.random() * 0.9;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [count, radius]);

  const pointsRef = useRef(null);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    const target = active ? 1 : 0;
    uniforms.uActive.value += (target - uniforms.uActive.value) * 0.05;
    if (pointsRef.current) pointsRef.current.visible = uniforms.uActive.value > 0.02;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={position}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={STEAM_VERTEX}
        fragmentShader={STEAM_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const STEAM_VERTEX = /* glsl */ `
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aScale;
  uniform float uTime;
  uniform float uHeight;
  varying float vAlpha;

  void main() {
    float life = fract(uTime * aSpeed + aPhase);
    vec3 p = position;
    p.y += life * uHeight;
    p.x += sin((uTime + aPhase * 12.0) * 1.1) * 0.08 * life;
    p.z += cos((uTime + aPhase * 9.0) * 1.0) * 0.06 * life;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aScale * (280.0 / max(0.001, -mv.z)) * (0.5 + life);
    vAlpha = smoothstep(0.0, 0.28, life) * smoothstep(1.0, 0.5, life);
    gl_Position = projectionMatrix * mv;
  }
`;

const STEAM_FRAGMENT = /* glsl */ `
  uniform sampler2D uPuff;
  uniform float uOpacity;
  uniform float uActive;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec4 puff = texture2D(uPuff, gl_PointCoord);
    float alpha = puff.a * vAlpha * uOpacity * uActive;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
