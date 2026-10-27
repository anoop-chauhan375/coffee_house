import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CUP_LIQUID_RADIUS, CUP_LIQUID_Y } from '../lib/geometry';

/**
 * The espresso surface inside the cup.
 *
 * A single disc carries a custom shader that layers: procedural crema,
 * a ripple distortion driven by the pour, and the animated latte-art mask
 * (canvas texture) which is revealed progressively as milk is poured.
 * `pourState` is a mutable object shared with the pour timeline.
 */
export default function CoffeeSurface({
  artTexture,
  cremaTexture,
  pourState,
  colors = { espresso: '#241309', crema: '#7b4a2b', milk: '#fff8ec' },
  radius = CUP_LIQUID_RADIUS,
  y = CUP_LIQUID_Y,
  segments = 96,
}) {
  const materialRef = useRef(null);
  const target = useRef({
    espresso: new THREE.Color(colors.espresso),
    crema: new THREE.Color(colors.crema),
    milk: new THREE.Color(colors.milk),
  });

  const uniforms = useMemo(
    () => ({
      uArt: { value: null },
      uCrema: { value: null },
      uTime: { value: 0 },
      uArtProgress: { value: 0 },
      uSwirl: { value: 0 },
      uRipple: { value: 0 },
      uRadius: { value: radius },
      uEspresso: { value: new THREE.Color(colors.espresso) },
      uCremaColor: { value: new THREE.Color(colors.crema) },
      uMilk: { value: new THREE.Color(colors.milk) },
    }),
    [radius],
  );

  uniforms.uArt.value = artTexture;
  uniforms.uCrema.value = cremaTexture;
  target.current.espresso.set(colors.espresso);
  target.current.crema.set(colors.crema);
  target.current.milk.set(colors.milk);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uArtProgress.value = pourState ? pourState.art : 1;
    material.uniforms.uSwirl.value = pourState ? pourState.swirl : 1;
    material.uniforms.uRipple.value = pourState ? pourState.ripple : 0;

    // Ease the drink colours so switching menu items feels poured, not cut.
    material.uniforms.uEspresso.value.lerp(target.current.espresso, 0.06);
    material.uniforms.uCremaColor.value.lerp(target.current.crema, 0.06);
    material.uniforms.uMilk.value.lerp(target.current.milk, 0.06);
  });

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
      <circleGeometry args={[radius, segments]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={COFFEE_VERTEX}
        fragmentShader={COFFEE_FRAGMENT}
      />
    </mesh>
  );
}

const COFFEE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uRipple;
  uniform float uRadius;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float d = length(p.xy) / uRadius;
    float wave = sin(d * 16.0 - uTime * 4.2) * 0.5 + 0.5;
    // Ripples strongest where the stream lands, fading toward the rim.
    p.z += wave * uRipple * 0.03 * (1.0 - d) * (1.0 - d);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const COFFEE_FRAGMENT = /* glsl */ `
  uniform sampler2D uArt;
  uniform sampler2D uCrema;
  uniform float uTime;
  uniform float uArtProgress;
  uniform float uSwirl;
  uniform float uRipple;
  varying vec2 vUv;

  uniform vec3 uEspresso;
  uniform vec3 uCremaColor;
  uniform vec3 uMilk;

  void main() {
    vec2 uv = vUv;
    float d = distance(uv, vec2(0.5));

    // Surface movement distorts the sampling, so crema and art feel liquid.
    float wob = sin(uv.x * 44.0 + uTime * 3.1) * 0.5
              + sin(uv.y * 36.0 - uTime * 2.6) * 0.5;
    vec2 dir = normalize(uv - vec2(0.5) + vec2(0.0001));
    vec2 duv = uv + dir * wob * 0.004 * (0.35 + uRipple);

    float n1 = texture2D(uCrema, duv * 2.4).r;
    float n2 = texture2D(uCrema, duv * 5.0 + 0.37).r;

    // Espresso in the middle warming into a crema ring at the edge.
    vec3 base = mix(uEspresso, uCremaColor, smoothstep(0.1, 0.5, d) * 0.75);
    base = mix(base, base * 1.18 + 0.02, n1 * 0.55);
    base += (n2 - 0.5) * 0.02;

    // Sit the surface inside the cup with a darker rim.
    float rim = smoothstep(0.42, 0.5, d);
    base = mix(base, uEspresso * 0.55, rim * 0.85);

    // ---- milk / latte art ----
    vec4 art = texture2D(uArt, duv * 0.9 + 0.05);

    float threshold = 1.0 - uArtProgress;
    float reveal = smoothstep(threshold - 0.14, threshold + 0.03, 1.0 - uv.y);
    float milk = art.r * reveal;

    float spread = smoothstep(0.02, 0.35, d);
    milk *= mix(1.0, 0.85, spread * 0.5 * uArtProgress);

    float stemReveal = smoothstep(1.0 - uSwirl - 0.05, 1.0 - uSwirl + 0.05, uv.y);
    milk = clamp(milk + art.g * stemReveal * 0.85, 0.0, 1.0);

    // Soften so the milk reads as liquid rather than a printed decal.
    milk = smoothstep(0.16, 0.6, milk) * 0.95;
    milk *= smoothstep(0.5, 0.42, d);

    vec3 color = mix(base, uMilk, milk);
    color = mix(color, color * (0.9 + n1 * 0.2), milk * 0.4);

    // Warm highlight drifting across the surface.
    float spec = pow(max(0.0, 1.0 - d * 1.7), 3.0);
    float shimmer = 0.5 + 0.5 * sin(uTime * 1.1);
    color += uCremaColor * spec * 0.22 * (0.5 + 0.5 * shimmer);

    // Faint crema bloom around the milk so the two blend.
    float bloom = smoothstep(0.46, 0.16, d) * (1.0 - milk);
    color += uCremaColor * bloom * 0.05;

    gl_FragColor = vec4(color, 1.0);
  }
`;
