import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import CoffeeCup from './CoffeeCup';
import { createLatteArtTexture, createCremaTexture } from '../lib/threeTextures';
import { createBeanGeometry } from '../lib/geometry';
import useResponsiveQuality from '../hooks/useResponsiveQuality';
import useSceneFrameloop from '../hooks/useSceneFrameloop';

function CameraRig({ target }) {
  useFrame((state) => {
    state.camera.lookAt(...target);
  });
  return null;
}

/**
 * A rotating 3D presentation of a single cup — reused for the menu's featured
 * drink and the visit section's ambient cup. Colours ease between drinks.
 */
export default function ShowcaseCup({
  colors = { espresso: '#241309', crema: '#7b4a2b', milk: '#fff8ec' },
  accent = '#B87945',
  beanCount = 9,
  showSaucer = true,
  mug = false,
  camera = { position: [0.6, 2.1, 4.6], fov: 30 },
  target = [0, -0.45, 0],
  quality: qualityProp,
  spin = 0.16,
  className,
  style,
}) {
  const measured = useResponsiveQuality();
  const quality = qualityProp || measured;
  const [containerRef, frameloop] = useSceneFrameloop();
  const [pulse, setPulse] = useState(0);

  // Trigger a subtle pulse when the drink changes (colours change)
  useEffect(() => {
    setPulse(1);
    const t = setTimeout(() => setPulse(0), 1000);
    return () => clearTimeout(t);
  }, [colors.espresso, colors.crema]);

  const artTexture = useMemo(() => createLatteArtTexture(quality.tier === 'low' ? 512 : 1024), [quality.tier]);
  const cremaTexture = useMemo(() => createCremaTexture(256), []);
  const stillPour = useMemo(
    () => ({ tilt: 0, stream: 0, art: 1, swirl: 1, ripple: 0.12, lift: 0, cupTurn: 0, shine: 0 }),
    [],
  );

  return (
    <div ref={containerRef} className={className} style={style}>
      <Canvas
        frameloop={frameloop}
        dpr={quality.dpr}
        shadows={false}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ ...camera, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <CameraRig target={target} />
          <ambientLight intensity={0.4} color="#ffdcb4" />
          <directionalLight position={[3, 4, 3]} intensity={1.5} color="#ffd2a2" />
          <directionalLight position={[-3, 1.6, -2.5]} intensity={0.7} color="#ff9a5c" />
          <pointLight position={[0, 2.4, 2]} intensity={0.5} color="#ffe0ba" />

          <SpinGroup spin={quality.reduced ? 0 : spin} pulse={pulse}>
            <group position={[0, -0.9, 0]}>
              <CoffeeCup
                pourState={stillPour}
                artTexture={artTexture}
                cremaTexture={cremaTexture}
                colors={colors}
                showSaucer={showSaucer}
                mug={mug}
                castShadow={false}
              />
              {beanCount > 0 && <OrbitBeans count={quality.reduced ? 0 : beanCount} color={accent} />}
            </group>
          </SpinGroup>

          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.55}
            scale={9}
            blur={2.6}
            far={4}
            color="#1a0d07"
            resolution={quality.tier === 'low' ? 128 : 256}
          />

          <Environment resolution={96} frames={1}>
            <Lightformer form="rect" intensity={2} position={[3.5, 4.5, -3]} scale={[6, 6, 1]} color="#ffd7a8" target={[0, 0, 0]} />
            <Lightformer form="circle" intensity={1.6} position={[-3.6, 2.2, 2.4]} scale={5} color="#a06a45" target={[0, 0, 0]} />
            <mesh scale={12}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial color="#160c07" side={THREE.BackSide} />
            </mesh>
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

function SpinGroup({ spin = 0.16, pulse = 0, children }) {
  const ref = useRef(null);
  const scaleRef = useRef(1);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    
    // Base spin
    group.rotation.y += spin * 0.01;
    
    // Mouse reactive tilt - slightly more aggressive
    group.rotation.x += (state.pointer.y * 0.12 - group.rotation.x) * 0.05;
    group.rotation.z += (-state.pointer.x * 0.08 - group.rotation.z) * 0.05;
    
    // Subtle float parallax
    group.position.y = Math.sin(t * 0.6) * 0.05;
    group.position.x += (state.pointer.x * 0.15 - group.position.x) * 0.04;

    // Pulse scale effect
    const targetScale = 1 + pulse * 0.05;
    scaleRef.current += (targetScale - scaleRef.current) * Math.min(1, delta * 8);
    group.scale.setScalar(scaleRef.current);
  });
  return <group ref={ref}>{children}</group>;
}

function OrbitBeans({ count = 9, color = '#B87945' }) {
  const meshRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => createBeanGeometry({ widthSegments: 18, heightSegments: 14 }), []);
  const beans = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        radius: 1.4 + Math.random() * 0.8,
        y: -0.2 + Math.random() * 1.4,
        speed: 0.12 + Math.random() * 0.2,
        scale: 0.08 + Math.random() * 0.08,
      })),
    [count],
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    beans.forEach((bean, i) => {
      const a = bean.angle + t * bean.speed;
      dummy.position.set(Math.cos(a) * bean.radius, bean.y + Math.sin(t * 0.6 + i) * 0.1, Math.sin(a) * bean.radius);
      dummy.rotation.set(t * 0.4 + i, t * 0.3, 0);
      dummy.scale.setScalar(bean.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial color={color} roughness={0.6} />
    </instancedMesh>
  );
}
