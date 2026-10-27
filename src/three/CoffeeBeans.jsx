import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createBeanGeometry } from '../lib/geometry';
import { createPuffTexture } from '../lib/threeTextures';

/**
 * Floating coffee beans, drawn as a single instanced mesh. Each bean drifts on
 * its own slow orbit at its own depth and leans gently toward the pointer.
 */
export default function FloatingBeans({
  count = 14,
  radius = 2.6,
  spread = 1.5,
  color = '#4a2c19',
  parallax = 0.5,
}) {
  const meshRef = useRef(null);
  // Scratch object reused across frames — allocating inside useFrame would
  // churn the GC sixty times a second.
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(() => createBeanGeometry({ widthSegments: 24, heightSegments: 18 }), []);

  const beans = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        return {
          angle,
          radius: radius * (0.55 + Math.random() * 0.75),
          height: (Math.random() - 0.35) * spread,
          speed: (0.08 + Math.random() * 0.18) * (i % 2 === 0 ? 1 : -1),
          bobSpeed: 0.4 + Math.random() * 0.6,
          bobPhase: Math.random() * Math.PI * 2,
          scale: 0.055 + Math.random() * 0.075,
          spin: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3),
          spinSpeed: 0.1 + Math.random() * 0.3,
          depth: 0.5 + Math.random(),
        };
      }),
    [count, radius, spread],
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x * parallax;
    const py = state.pointer.y * parallax;

    beans.forEach((bean, i) => {
      const a = bean.angle + t * bean.speed;
      const bob = Math.sin(t * bean.bobSpeed + bean.bobPhase) * 0.16;
      dummy.position.set(
        Math.cos(a) * bean.radius + px * bean.depth,
        bean.height + bob + py * bean.depth * 0.5,
        Math.sin(a) * bean.radius,
      );
      dummy.rotation.set(
        bean.spin.x + t * bean.spinSpeed,
        bean.spin.y + t * bean.spinSpeed * 0.7,
        bean.spin.z + t * bean.spinSpeed * 0.4,
      );
      dummy.scale.setScalar(bean.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow={false}>
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.05} />
    </instancedMesh>
  );
}

/**
 * Fine coffee dust — tiny warm specks that react softly to the pointer so the
 * space around the cup feels alive without pulling focus.
 */
export function CoffeeDust({ count = 220, radius = 3.2, position = [0, 1.2, 0] }) {
  const pointsRef = useRef(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 1.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 1.4;
      seeds[i * 3] = Math.random() * Math.PI * 2;
      seeds[i * 3 + 1] = 0.2 + Math.random() * 0.7;
      seeds[i * 3 + 2] = 0.4 + Math.random() * 1.2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    return geo;
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPuff: { value: createPuffTexture() },
      uPointer: { value: new THREE.Vector2() },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPointer.value.set(state.pointer.x, state.pointer.y);
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={position}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={DUST_VERTEX}
        fragmentShader={DUST_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const DUST_VERTEX = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * aSeed.z * 0.6 + aSeed.x) * 0.22;
    p.x += cos(uTime * aSeed.z * 0.4 + aSeed.y) * 0.18;
    p.x += uPointer.x * aSeed.y * 0.22;
    p.y += uPointer.y * aSeed.y * 0.18;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (aSeed.y * 26.0) * (1.0 / max(0.001, -mv.z)) * 8.0;
    vAlpha = 0.25 + 0.4 * aSeed.y;
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform sampler2D uPuff;
  varying float vAlpha;

  void main() {
    vec4 puff = texture2D(uPuff, gl_PointCoord);
    float alpha = puff.a * vAlpha * 0.5;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(vec3(1.0, 0.86, 0.68), alpha);
  }
`;
