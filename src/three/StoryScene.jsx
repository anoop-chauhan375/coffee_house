import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { createBeanGeometry, createHalfBeanGeometry } from '../lib/geometry';
import { createPuffTexture } from '../lib/threeTextures';
import useSceneFrameloop from '../hooks/useSceneFrameloop';

/**
 * "Coffee in slow motion": a scroll-driven sequence where a giant bean turns,
 * cracks open to reveal its interior, throws off coffee particles, and finally
 * resolves into a swirl of freshly brewed coffee.
 *
 * Everything is driven by a single scroll `progress` (0 → 1) so the story
 * stays perfectly locked to the reader's position.
 */
export default function StoryScene({ progress = 0, quality, reduced = false }) {
  const [containerRef, frameloop] = useSceneFrameloop();

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={frameloop}
        dpr={quality.dpr}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.5, 5], fov: 36 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.42} color="#ffd6a8" />
          <directionalLight position={[3, 4, 3]} intensity={1.7} color="#ffcf9c" />
          <directionalLight position={[-4, 1.5, -3]} intensity={0.9} color="#ff9a5c" />
          <pointLight position={[0, 0, 3]} intensity={0.7} color="#ffdcaa" />

          <Story progress={reduced ? 1 : progress} quality={quality} />

          <Environment resolution={96} frames={1}>
            <Lightformer form="rect" intensity={1.8} position={[3, 4, -3]} scale={[6, 6, 1]} color="#ffd7a8" target={[0, 0, 0]} />
            <Lightformer form="circle" intensity={1.2} position={[-4, 1.5, 2]} scale={5} color="#7a4a2c" target={[0, 0, 0]} />
            <mesh scale={16}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial color="#170d08" side={THREE.BackSide} />
            </mesh>
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (v, a, b) => clamp01((v - a) / (b - a));

function Story({ progress, quality }) {
  const rootRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const coreRef = useRef(null);
  const streamRef = useRef(null);
  const swirlRef = useRef(null);
  const swirlDiscRef = useRef(null);
  const particleRef = useRef(null);

  const beanGeo = useMemo(() => createBeanGeometry({ widthSegments: 28, heightSegments: 20 }), []);
  const frontGeo = useMemo(() => createHalfBeanGeometry(1), []);
  const backGeo = useMemo(() => createHalfBeanGeometry(-1), []);
  const puff = useMemo(() => createPuffTexture(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stream = useMemo(
    () =>
      Array.from({ length: quality.tier === 'low' ? 22 : 44 }, (_, i) => ({
        offset: i / (quality.tier === 'low' ? 22 : 44),
        y: (Math.random() - 0.5) * 1.7,
        z: (Math.random() - 0.5) * 1.2,
        spin: Math.random() * 6.28,
        scale: 0.14 + Math.random() * 0.1,
      })),
    [quality.tier],
  );

  const particleGeo = useMemo(() => {
    const count = quality.particles;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const dirs = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const v = new THREE.Vector3().randomDirection();
      dirs[i * 3] = v.x;
      dirs[i * 3 + 1] = v.y * 1.4;
      dirs[i * 3 + 2] = v.z;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3));
    return geo;
  }, [quality.particles]);

  const particleUniforms = useMemo(
    () => ({ uProgress: { value: 0 }, uPuff: { value: puff } }),
    [puff],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (rootRef.current) {
      rootRef.current.rotation.y = progress * Math.PI * 1.15 + t * 0.05;
      rootRef.current.rotation.z = Math.sin(t * 0.3) * 0.03;
    }

    const open = range(progress, 0.2, 0.52);
    const fadeBean = 1 - range(progress, 0.72, 0.88);

    if (frontRef.current) {
      frontRef.current.position.z = open * 0.95;
      frontRef.current.rotation.x = -open * 0.5;
      frontRef.current.visible = fadeBean > 0.01;
    }
    if (backRef.current) {
      backRef.current.position.z = -open * 0.95;
      backRef.current.rotation.x = open * 0.5;
      backRef.current.visible = fadeBean > 0.01;
    }
    if (coreRef.current) {
      const coreIn = range(progress, 0.18, 0.46);
      coreRef.current.visible = coreIn > 0.02 && fadeBean > 0.01;
      coreRef.current.scale.setScalar(Math.max(0.001, coreIn * (0.86 + Math.sin(t * 1.6) * 0.03)));
      if (coreRef.current.material) {
        coreRef.current.material.emissiveIntensity = coreIn * (0.5 + Math.sin(t * 2.2) * 0.2);
      }
    }

    if (particleRef.current) {
      particleRef.current.visible = progress > 0.28 && progress < 0.95;
    }
    particleUniforms.uProgress.value = range(progress, 0.26, 0.8);

    // bean stream sweeping across the frame
    const streamIn = range(progress, 0.52, 0.74);
    const streamOut = 1 - range(progress, 0.82, 0.94);
    if (streamRef.current) {
      const mesh = streamRef.current;
      mesh.visible = streamIn > 0.01 && streamOut > 0.01;
      stream.forEach((b, i) => {
        const travel = ((b.offset + t * 0.12) % 1) * 2 - 1;
        dummy.position.set(travel * 5.2, b.y, b.z);
        dummy.rotation.set(b.spin + t * 0.5, t * 0.4, 0);
        dummy.scale.setScalar(b.scale * streamIn * streamOut);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    // final swirl of brewed coffee
    const swirlIn = range(progress, 0.76, 0.98);
    if (swirlRef.current) {
      swirlRef.current.visible = swirlIn > 0.02;
      swirlRef.current.rotation.y += delta * 1.1;
      swirlRef.current.rotation.x = 0.5 + progress * 0.4;
      swirlRef.current.scale.setScalar(Math.max(0.001, swirlIn));
    }
    if (swirlDiscRef.current) {
      swirlDiscRef.current.visible = swirlIn > 0.02;
      swirlDiscRef.current.rotation.z += delta * 0.8;
      swirlDiscRef.current.scale.setScalar(Math.max(0.001, swirlIn));
    }

    if (rootRef.current) {
      rootRef.current.scale.setScalar(0.92 + range(progress, 0.7, 1) * 0.2);
    }
    state.camera.position.z += (5 - progress * 1.5 - state.camera.position.z) * 0.06;
    state.camera.position.y += (0.55 - progress * 0.35 - state.camera.position.y) * 0.06;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={rootRef}>
        <mesh ref={frontRef} geometry={frontGeo} castShadow>
          <meshStandardMaterial color="#412617" roughness={0.6} side={THREE.DoubleSide} />
          {/* cut face, so the cracked half reads as solid rather than hollow */}
          <mesh position={[0, 0, -0.03]} scale={[0.76, 1.26, 1]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[1, 32]} />
            <meshStandardMaterial color="#c99a5f" roughness={0.9} />
          </mesh>
        </mesh>
        <mesh ref={backRef} geometry={backGeo} castShadow>
          <meshStandardMaterial color="#412617" roughness={0.6} side={THREE.DoubleSide} />
          <mesh position={[0, 0, 0.03]} scale={[0.76, 1.26, 1]}>
            <circleGeometry args={[1, 32]} />
            <meshStandardMaterial color="#c99a5f" roughness={0.9} />
          </mesh>
        </mesh>

        {/* interior revealed by the crack */}
        <mesh ref={coreRef} visible={false}>
          <sphereGeometry args={[0.7, 28, 20]} />
          <meshStandardMaterial
            color="#c99a5f"
            roughness={0.85}
            emissive="#ff9c4a"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      <points ref={particleRef} geometry={particleGeo} visible={false}>
        <shaderMaterial
          uniforms={particleUniforms}
          vertexShader={PARTICLE_VERTEX}
          fragmentShader={PARTICLE_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <instancedMesh ref={streamRef} args={[beanGeo, undefined, stream.length]} visible={false}>
        <meshStandardMaterial color="#5a3620" roughness={0.58} />
      </instancedMesh>

      <group ref={swirlRef} visible={false}>
        <mesh>
          <torusKnotGeometry args={[0.95, 0.26, 140, 20, 2, 3]} />
          <meshPhysicalMaterial
            color="#4a2a16"
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.2}
            metalness={0.1}
          />
        </mesh>
        <mesh ref={swirlDiscRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
          <ringGeometry args={[0.4, 2.1, 64]} />
          <meshBasicMaterial color="#8a5630" transparent opacity={0.35} />
        </mesh>
      </group>
    </>
  );
}

const PARTICLE_VERTEX = /* glsl */ `
  attribute vec3 aDir;
  uniform float uProgress;
  varying float vAlpha;

  void main() {
    float p = uProgress;
    vec3 pos = aDir * (0.25 + p * 2.6);
    pos.y -= p * 0.5;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (14.0 + aDir.y * 8.0) * (1.0 / max(0.001, -mv.z)) * 9.0;
    vAlpha = smoothstep(0.0, 0.2, p) * (1.0 - smoothstep(0.75, 1.0, p)) * (0.35 + 0.4 * abs(aDir.x));
    gl_Position = projectionMatrix * mv;
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  uniform sampler2D uPuff;
  varying float vAlpha;

  void main() {
    vec4 puff = texture2D(uPuff, gl_PointCoord);
    float alpha = puff.a * vAlpha * 0.6;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vec3(1.0, 0.78, 0.5), alpha);
  }
`;
