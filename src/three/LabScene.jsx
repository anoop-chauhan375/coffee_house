import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import {
  DEMITASSE_PROFILE,
  VIAL_PROFILE,
  KETTLE_PROFILE,
  createBeanGeometry,
  toLathePoints,
} from '../lib/geometry';
import { createPuffTexture } from '../lib/threeTextures';
import useSceneFrameloop from '../hooks/useSceneFrameloop';

/**
 * The Coffee Lab: a floating still-life of espresso equipment. Scrolling
 * reveals each piece in turn; hovering a piece rotates it and surfaces the
 * matching note in the surrounding editorial column.
 */
export default function LabScene({ progress = 1, activeId, onHover, quality }) {
  const [containerRef, frameloop] = useSceneFrameloop();

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={frameloop}
        dpr={quality.dpr}
        shadows={quality.shadows}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, -0.2, 6.4], fov: 32 }}
        onPointerMissed={() => onHover?.(null)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} color="#ffdcb4" />
          <directionalLight position={[3.5, 5, 4]} intensity={2.2} color="#ffd2a2" castShadow={quality.shadows} />
          <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#ff9a5c" />
          <pointLight position={[0, 1, 4]} intensity={0.8} color="#ffe4c2" />

          <group position={[0, -0.4, 0]} scale={1.15}>
          <LabItem id="grind" revealAt={0.02} position={[-2.2, -0.6, 0.4]} progress={progress} activeId={activeId} onHover={onHover}>
            <BeanVial />
          </LabItem>

          <LabItem id="grind" revealAt={0.14} position={[0.8, 1.6, 0.6]} progress={progress} activeId={activeId} onHover={onHover}>
            <PrecisionScale />
          </LabItem>

          <LabItem id="extraction" revealAt={0.3} position={[0.2, 0.4, -1.2]} progress={progress} activeId={activeId} onHover={onHover}>
            <ScientificGroupHead />
          </LabItem>

          <LabItem id="extraction" revealAt={0.44} position={[2.4, -0.2, 0.8]} progress={progress} activeId={activeId} onHover={onHover}>
            <BottomlessPortafilter />
          </LabItem>

          <LabItem id="pour" revealAt={0.6} position={[-2.0, 0.9, -0.5]} progress={progress} activeId={activeId} onHover={onHover}>
            <GooseneckKettle />
          </LabItem>

          <LabItem id="finish" revealAt={0.76} position={[-0.2, -1.2, 1.2]} progress={progress} activeId={activeId} onHover={onHover}>
            <DemitassePour />
          </LabItem>
        </group>

        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3} position={[3.5, 4.5, -3]} scale={[6, 6, 1]} color="#ffd7a8" target={[0, 0, 0]} />
          <Lightformer form="circle" intensity={2} position={[-4, 2, 2]} scale={5} color="#a06a45" target={[0, 0, 0]} />
          {/* Right kicker for metals */}
          <Lightformer form="rect" intensity={2.5} position={[5.4, 2.4, 2.6]} scale={[4.5, 4.5, 1]} color="#ffe3bd" target={[0.6, 1.4, 0]} />
          <mesh scale={16}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color="#1b100a" side={THREE.BackSide} />
          </mesh>
        </Environment>
      </Suspense>
    </Canvas>
  </div>
  );
}

function LabItem({ id, revealAt, position, children, progress = 1, activeId, onHover }) {
  const groupRef = useRef(null);
  const scaleRef = useRef(0.001);
  const hovered = activeId === id;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;

    const reveal = THREE.MathUtils.clamp((progress - revealAt) / 0.16, 0, 1);
    scaleRef.current += (reveal - scaleRef.current) * Math.min(1, delta * 9);
    
    // Pulse effect when hovered
    const pulse = hovered ? 1 + Math.sin(t * 4) * 0.02 : 1;
    group.scale.setScalar(Math.max(0.001, scaleRef.current * pulse));

    // Magnetic float
    const targetY = position[1] + Math.sin(t * 0.9 + position[0]) * 0.07;
    group.position.y += (targetY - group.position.y) * 0.1;
    
    // Mouse follow when hovered
    if (hovered) {
      group.position.x += (position[0] + state.pointer.x * 0.2 - group.position.x) * 0.1;
      group.position.z += (position[2] - state.pointer.y * 0.2 - group.position.z) * 0.1;
    } else {
      group.position.x += (position[0] - group.position.x) * 0.05;
      group.position.z += (position[2] - group.position.z) * 0.05;
    }

    group.rotation.y += delta * (hovered ? 1.2 : 0.16);
    group.rotation.x += ((hovered ? 0.25 : 0) - group.rotation.x) * 0.08;
    group.rotation.z += ((hovered ? state.pointer.x * 0.2 : 0) - group.rotation.z) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover?.(id);
      }}
      onPointerOut={() => onHover?.(null)}
    >
      {children}
    </group>
  );
}

/* ------------------------------------------------------------- equipment */

/* ------------------------------------------------------------- equipment */

function BottomlessPortafilter() {
  return (
    <group rotation={[0.3, 0.6, 0.1]} scale={0.9}>
      <mesh castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.28, 48, 1, true]} />
        <meshStandardMaterial color="#d1d4d9" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.22, 48]} />
        <meshStandardMaterial color="#3a3c40" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 40]} />
        <meshStandardMaterial color="#2a1810" roughness={0.9} />
      </mesh>
      <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 1.2, 24]} />
        <meshStandardMaterial color="#2c1a0f" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.3, 24]} />
        <meshStandardMaterial color="#d1d4d9" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ScientificGroupHead() {
  return (
    <group rotation={[0.1, -0.4, 0]} scale={0.85}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.4, 1.0]} />
        <meshStandardMaterial color="#c0c4cc" metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 48]} />
        <meshStandardMaterial color="#989ca3" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 48]} />
        <meshStandardMaterial color="#c0c4cc" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BeanVial() {
  const geometry = useMemo(() => toLathePoints(VIAL_PROFILE, 32), []);
  const bean = useMemo(() => createBeanGeometry({ widthSegments: 16, heightSegments: 12 }), []);
  const beansRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const beans = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      y: 0.2 + i * 0.25,
      angle: i * 1.5,
      speed: 0.4 + i * 0.2
    })), 
  []);

  useFrame((state) => {
    const mesh = beansRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    beans.forEach((b, i) => {
      const a = b.angle + t * b.speed;
      dummy.position.set(Math.cos(a) * 0.1, b.y + Math.sin(t * 0.8 + i) * 0.05, Math.sin(a) * 0.1);
      dummy.rotation.set(t * 0.5, t * 0.4 + i, 0);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group scale={1.2}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial 
          color="#fff" 
          transparent 
          opacity={0.3} 
          roughness={0.05} 
          transmission={0.98} 
          thickness={0.5} 
          envMapIntensity={2.5}
        />
      </mesh>
      <instancedMesh ref={beansRef} args={[bean, undefined, 4]}>
        <meshStandardMaterial color="#4a2c1a" roughness={0.5} envMapIntensity={0.8} />
      </instancedMesh>
    </group>
  );
}

function PrecisionScale() {
  return (
    <group rotation={[0.1, 0.3, 0]} scale={0.9}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.12, 1.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[1.3, 0.02, 1.3]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.2, 0.4]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.02]} />
        <meshStandardMaterial color="#000" emissive="#ffc78f" emissiveIntensity={0.8} roughness={0} />
      </mesh>
    </group>
  );
}

function GooseneckKettle() {
  const body = useMemo(() => toLathePoints(KETTLE_PROFILE, 64), []);
  return (
    <group rotation={[0, 0.4, -0.1]} scale={0.75}>
      <mesh geometry={body} castShadow>
        <meshStandardMaterial color="#d1d4d9" metalness={1} roughness={0.18} />
      </mesh>
      {/* gooseneck spout */}
      <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.8, 0.04, 16, 64, Math.PI * 0.45]} />
        <meshStandardMaterial color="#d1d4d9" metalness={1} roughness={0.18} />
      </mesh>
      {/* handle */}
      <mesh position={[0.7, 0.8, 0]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.4, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#2c1a0f" roughness={0.5} />
      </mesh>
    </group>
  );
}

function DemitassePour() {
  const geometry = useMemo(() => toLathePoints(DEMITASSE_PROFILE, 64), []);
  const bean = useMemo(() => createBeanGeometry({ widthSegments: 20, heightSegments: 16 }), []);
  const beansRef = useRef(null);
  const stirrerRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const beans = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2,
        radius: 0.68 + Math.random() * 0.35,
        y: 0.05 + Math.random() * 0.5,
        speed: 0.25 + Math.random() * 0.35,
        scale: 0.085 + Math.random() * 0.03,
      })),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const mesh = beansRef.current;
    if (mesh) {
      beans.forEach((b, i) => {
        const a = b.angle + t * b.speed;
        dummy.position.set(Math.cos(a) * b.radius, b.y, Math.sin(a) * b.radius);
        dummy.rotation.set(t * 0.7, t * 0.5 + i, t * 0.2);
        dummy.scale.setScalar(b.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (stirrerRef.current) {
      stirrerRef.current.rotation.y = t * 0.4;
      stirrerRef.current.position.y = 1.0 + Math.sin(t * 1.2) * 0.1;
    }
  });

  return (
    <group scale={1.0}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial color="#fffcf7" roughness={0.2} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 48]} />
        <meshStandardMaterial color="#241309" roughness={0.3} />
      </mesh>
      <instancedMesh ref={beansRef} args={[bean, undefined, 6]}>
        <meshStandardMaterial color="#4a2c1a" roughness={0.55} />
      </instancedMesh>
      {/* floating stirrer */}
      <group ref={stirrerRef} position={[0.4, 1.0, 0]} rotation={[0, 0, 0.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 12]} />
          <meshPhysicalMaterial 
            color="#fff" 
            transparent 
            opacity={0.4} 
            roughness={0.02} 
            transmission={0.98} 
            thickness={0.2} 
            envMapIntensity={2}
          />
        </mesh>
      </group>
    </group>
  );
}
