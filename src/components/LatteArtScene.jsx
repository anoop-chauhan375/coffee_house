import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import CoffeeCup from '../three/CoffeeCup';
import MilkPitcher from '../three/MilkPitcher';
import MilkStream from '../three/MilkStream';
import SteamEffect from '../three/SteamEffect';
import FloatingBeans, { CoffeeDust } from '../three/CoffeeBeans';
import { createLatteArtTexture, createCremaTexture } from '../lib/threeTextures';
import useResponsiveQuality from '../hooks/useResponsiveQuality';
import useSceneFrameloop from '../hooks/useSceneFrameloop';

const PITCHER_POSITION = [0.9, 1.9, 0.2];

const CAMERA_FOV = 32;
const TAN_HALF_FOV = Math.tan((CAMERA_FOV * Math.PI) / 180 / 2);

/**
 * Framing for the full-bleed hero canvas.
 *
 * The scene fills the whole hero, so the camera can no longer assume a fixed
 * stage shape: a tall phone would either crop the pour or shrink the cup to
 * nothing. We fit a nominal box — whichever axis is tighter wins — then nudge
 * the composition right of centre on wide frames (leaving the left column for
 * the headline) or lift it clear of the copy on stacked frames.
 */
function framingFor(width, height) {
  const aspect = width / height;
  const stacked = width < 1024;

  const targetWidth = 4.7;
  const targetHeight = stacked ? 4.6 : 3.1;

  const distForWidth = targetWidth / (2 * TAN_HALF_FOV * aspect);
  const distForHeight = targetHeight / (2 * TAN_HALF_FOV);
  const baseZ = THREE.MathUtils.clamp(Math.min(distForWidth, distForHeight), 4.4, 9.5);

  const visibleWidth = 2 * TAN_HALF_FOV * baseZ * aspect;
  const anchor = aspect >= 1.25 ? 0.64 : 0.5;

  return {
    baseZ,
    offsetX: (anchor - 0.5) * visibleWidth,
    offsetY: stacked ? 0.85 : 0,
    beanRadius: stacked ? 1.6 : 2.7,
    dustRadius: stacked ? 1.9 : 3.1,
  };
}

/**
 * The signature hero scene: a barista pouring latte art into a ceramic cup.
 *
 * A single mutable `pourState` object drives the pitcher tilt, milk stream,
 * latte-art reveal and reveal-stage camera flourish. GSAP tweens that object,
 * and every 3D component reads it inside `useFrame`, so the pour, the stream
 * and the pattern always stay perfectly in sync.
 */
export default function LatteArtScene({ palette, quality: qualityProp, onReady, replayRef }) {
  const measured = useResponsiveQuality();
  const quality = qualityProp || measured;
  const [containerRef, frameloop] = useSceneFrameloop();

  const artTexture = useMemo(() => createLatteArtTexture(quality.tier === 'low' ? 512 : 1024), [quality.tier]);
  const cremaTexture = useMemo(() => createCremaTexture(256), []);

  const pourState = useMemo(
    () => ({ tilt: 0, stream: 0, art: 0, swirl: 0, ripple: 0, lift: 0, cupTurn: 0, shine: 0 }),
    [],
  );

  // Seed the camera with the framing its viewport needs so the scene opens at
  // its final distance instead of zooming out on the first second.
  const initialCamera = useMemo(() => {
    const width = typeof window === 'undefined' ? 1440 : window.innerWidth;
    const height = typeof window === 'undefined' ? 900 : window.innerHeight;
    const { baseZ } = framingFor(width, height);
    const k = baseZ / 5.2;
    return { position: [0.2 * k, 2.0, baseZ] };
  }, []);

  const timelineRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduced = quality.reduced;

    if (reduced) {
      Object.assign(pourState, { art: 1, swirl: 1, cupTurn: 0.22, shine: 0.35 });
      onReady?.();
      return undefined;
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    tl
      .addLabel('espresso')
      .to(pourState, { duration: 0.5, ripple: 0.18, ease: 'sine.out' }, 'espresso+=0.3')
      .addLabel('pour')
      .to(pourState, { duration: 1.1, tilt: 0.42, stream: 1, ease: 'power3.inOut' }, 'pour')
      .to(pourState, { duration: 0.4, ripple: 0.75, ease: 'power2.out' }, 'pour+=0.3')
      .addLabel('art')
      .to(pourState, { duration: 2.7, art: 1, ease: 'power1.inOut' }, 'art')
      .to(pourState, { duration: 0.5, ripple: 0.9, ease: 'sine.inOut' }, 'art')
      .addLabel('finish')
      .to(pourState, { duration: 0.7, swirl: 1, ease: 'power2.inOut' }, 'finish')
      .to(pourState, { duration: 0.4, ripple: 0.4, ease: 'sine.out' }, 'finish+=0.2')
      .addLabel('hold', '+=0.5')
      .addLabel('reveal')
      .to(pourState, { duration: 1.1, tilt: 0.02, stream: 0, ripple: 0, lift: 1, ease: 'power2.inOut' }, 'reveal')
      .to(pourState, { duration: 1.2, cupTurn: 0.3, shine: 1, ease: 'power2.inOut' }, 'reveal+=0.15');

    timelineRef.current = tl;

    const startTimer = window.setTimeout(() => {
      tl.play(0);
      startedRef.current = true;
      onReady?.();
    }, 650);

    return () => {
      window.clearTimeout(startTimer);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality.reduced]);

  // Expose an imperative replay for the hero button and cup clicks.
  useEffect(() => {
    if (!replayRef) return undefined;
    replayRef.current = () => {
      if (quality.reduced) return;
      const tl = timelineRef.current;
      if (!tl) return;
      gsap.killTweensOf(pourState);
      Object.assign(pourState, { tilt: 0, stream: 0, art: 0, swirl: 0, ripple: 0, lift: 0, cupTurn: 0, shine: 0 });
      tl.play(0);
    };
    return () => {
      replayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality.reduced]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={frameloop}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ ...initialCamera, fov: CAMERA_FOV, near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <SceneContent
            pourState={pourState}
            artTexture={artTexture}
            cremaTexture={cremaTexture}
            palette={palette}
            quality={quality}
            replayRef={replayRef}
            onReady={onReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function SceneContent({ pourState, artTexture, cremaTexture, palette, quality, replayRef, onReady }) {
  const { scene, size } = useThree();
  const groupRef = useRef(null);
  const cupRef = useRef(null);
  const shineRef = useRef(null);

  const framing = useMemo(() => framingFor(size.width, size.height), [size.width, size.height]);

  useEffect(() => {
    scene.background = null;
    onReady?.();
  }, [scene, onReady]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pointer = state.pointer;
    const { baseZ, offsetX, offsetY } = framing;
    // Keep the pointer parallax feeling the same as the camera pulls back on
    // tall viewports.
    const k = baseZ / 5.2;

    // Gentle camera drift with pointer parallax — never enough to lose the cup.
    const cam = state.camera;
    const idle = Math.sin(t * 0.22) * 0.12 * k;
    cam.position.x += (0.2 * k + pointer.x * 0.55 * k + idle - cam.position.x) * 0.045;
    cam.position.y += (2.0 + pointer.y * 0.4 * k - cam.position.y) * 0.045;
    cam.position.z += (baseZ - pointer.y * 0.25 * k - cam.position.z) * 0.045;
    cam.lookAt(0.05, 1.05, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y = pointer.x * 0.08;
      groupRef.current.rotation.x = -pointer.y * 0.04;
      // Eased so a resize glides instead of snapping the composition.
      groupRef.current.position.x += (offsetX - groupRef.current.position.x) * 0.06;
      groupRef.current.position.y += (offsetY - groupRef.current.position.y) * 0.06;
    }

    if (cupRef.current) {
      const targetTurn = pourState.cupTurn;
      cupRef.current.rotation.y += (targetTurn - cupRef.current.rotation.y) * 0.05;
      cupRef.current.rotation.z = Math.sin(t * 0.5) * 0.004;
    }

    if (shineRef.current) {
      const s = pourState.shine;
      shineRef.current.position.x = -3.2 + s * 6.4;
      shineRef.current.position.y = 2.4 + Math.sin(s * Math.PI) * 0.8;
      shineRef.current.intensity = Math.sin(s * Math.PI) * 9;
    }
  });

  return (
    <>
      <ambientLight intensity={0.42} color="#ffd9b0" />
      <directionalLight
        position={[2.8, 4.2, 2.6]}
        intensity={1.45}
        color="#ffd0a0"
        castShadow={quality.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3.2, 2.4, -3]} intensity={0.85} color="#ff9a5c" />
      <pointLight position={[-1.6, 1.2, 2.6]} intensity={0.5} color="#ffdcae" />
      <pointLight ref={shineRef} position={[-3.2, 2.4, 1.4]} intensity={0} color="#ffe1b8" />
      {/* Kicker from the camera's right: catches the metal pitcher, the milk
          stream and the cup rim so the pour reads against the dark hero. */}
      <directionalLight position={[5.2, 2.6, 3.4]} intensity={1.05} color="#ffe6c4" />

      <group ref={groupRef}>
        <group ref={cupRef}>
          <CoffeeCup
            pourState={pourState}
            artTexture={artTexture}
            cremaTexture={cremaTexture}
            colors={palette}
            castShadow={quality.shadows}
            onPointerDown={(event) => {
              event.stopPropagation();
              replayRef?.current?.();
            }}
          />
          <mesh
            position={[0, 0.75, 0]}
            onPointerDown={(event) => {
              event.stopPropagation();
              replayRef?.current?.();
            }}
          >
            <sphereGeometry args={[1.1, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        <MilkPitcher pourState={pourState} position={PITCHER_POSITION} castShadow={quality.shadows} />
        <MilkStream pourState={pourState} pivot={PITCHER_POSITION} />

        <SteamEffect count={quality.steam} position={[0, 1.05, 0]} />
        <FloatingBeans count={quality.beans} radius={framing.beanRadius} />
        <CoffeeDust count={quality.particles} radius={framing.dustRadius} position={[0, 1.3, 0]} />
      </group>

      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[3.5, 4.5, -3]} scale={[6, 6, 1]} color="#ffd7a8" target={[0, 0.8, 0]} />
        <Lightformer form="rect" intensity={1.6} position={[-4.2, 2.2, 2.4]} scale={[5, 5, 1]} color="#a06a45" target={[0, 0.8, 0]} />
        <Lightformer form="circle" intensity={2.4} position={[0, 5.2, 0.5]} scale={4.5} color="#ffc78f" target={[0, 0.8, 0]} />
        {/* Right-side panel: the pitcher is a mirror, so it needs a bright
            source on the side facing the camera or it reflects only darkness. */}
        <Lightformer form="rect" intensity={2.6} position={[5.4, 2.4, 2.6]} scale={[4.5, 4.5, 1]} color="#ffe3bd" target={[0.6, 1.4, 0]} />
        <mesh scale={12}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color={new THREE.Color('#1a0f0a')} side={THREE.BackSide} />
        </mesh>
      </Environment>
    </>
  );
}
