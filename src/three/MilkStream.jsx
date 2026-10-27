import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * The milk stream: a tapered, swaying column of milk that leaves the pitcher
 * spout and meets the coffee surface, plus the ripples where it lands.
 *
 * The spout position is derived from the pitcher's pivot and current tilt, so
 * the stream stays connected to the pitcher and vertical under gravity.
 */
export default function MilkStream({
  pourState,
  pivot = [0.9, 1.9, 0.2],
  spout = [-0.5, 1.32, 0],
  baseTilt = 0.06,
  landingY = 1.0,
}) {
  const meshRef = useRef(null);
  const splashRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uWobble: { value: 0 },
    }),
    [],
  );

  const splashUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uColor: { value: new THREE.Color('#fff6e8') },
    }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const tilt = pourState ? pourState.tilt : 0;
    const lift = pourState ? pourState.lift : 0;
    const stream = pourState ? pourState.stream : 0;
    const ripple = pourState ? pourState.ripple : 0;

    const a = baseTilt + tilt;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const spoutX = pivot[0] + spout[0] * cos - spout[1] * sin - lift * 0.5;
    const spoutY = pivot[1] + spout[0] * sin + spout[1] * cos + lift * 2.4;
    const spoutZ = pivot[2] + spout[2];

    const length = Math.max(0.5, spoutY - (landingY - 0.22));

    if (meshRef.current) {
      meshRef.current.position.set(spoutX, spoutY - length / 2, spoutZ);
      meshRef.current.scale.y = length / 2.1;
    }
    uniforms.uTime.value = t;
    uniforms.uOpacity.value = stream;
    uniforms.uWobble.value = 0.5 + ripple;

    if (splashRef.current) {
      splashRef.current.position.set(spoutX, landingY + 0.014, spoutZ);
      splashRef.current.visible = stream > 0.06;
      splashRef.current.rotation.z = t * 0.5;
      splashRef.current.scale.setScalar(0.9 + ripple * 0.45);
    }
    splashUniforms.uTime.value = t;
    splashUniforms.uStrength.value = stream * (0.35 + ripple);
  });

  return (
    <>
      <mesh ref={meshRef} renderOrder={1}>
        <cylinderGeometry args={[0.05, 0.075, 2.1, 20, 12, true]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={STREAM_VERTEX}
          fragmentShader={STREAM_FRAGMENT}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={splashRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={3}>
        <ringGeometry args={[0.1, 0.6, 64]} />
        <shaderMaterial
          uniforms={splashUniforms}
          vertexShader={SPLASH_VERTEX}
          fragmentShader={SPLASH_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

const STREAM_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uWobble;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float taper = mix(0.55, 1.0, uv.y);
    p.x *= taper;
    p.z *= taper;
    float sway = sin(uv.y * 6.0 + uTime * 6.0) * 0.02 * uWobble;
    p.x += sway * (1.0 - uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const STREAM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float streak = sin(vUv.x * 26.0 + uTime * 8.0) * 0.5 + 0.5;
    streak = mix(0.82, 1.0, streak);
    float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x);
    float ends = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.92, vUv.y);

    vec3 color = mix(vec3(0.93, 0.9, 0.85), vec3(1.0, 0.99, 0.96), streak);
    float alpha = uOpacity * edge * ends * mix(0.7, 1.0, streak);
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

const SPLASH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SPLASH_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float ring = sin(vUv.x * 40.0 - uTime * 5.0) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
    float alpha = edge * (0.25 + ring * 0.4) * uStrength;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
