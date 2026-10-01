import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { orbFragment, orbVertex } from './shaders';
import { ACCENT, DocCard, smooth } from './DocCard';

// Pointer position in -1..1, tracked on window so the text overlay
// never blocks it. A ref avoids re-rendering React on every move.
function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return p;
}

function Orb({ reduced }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 2 },
      uAmp: { value: 0.09 },
      uDeep: { value: new THREE.Color('#0A1426') },
      uRim: { value: ACCENT.clone() },
    }),
    []
  );
  useFrame(({ clock }) => {
    if (!reduced) uniforms.uTime.value = clock.elapsedTime + 2;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.25, 48]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={orbVertex}
          fragmentShader={orbFragment}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color="#7CE7D6" transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Shell({ count = 1600, radius = 1.8 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    // Fibonacci sphere: even coverage without clumping.
    const arr = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const jitter = radius * (1 + (Math.sin(i * 12.9898) * 0.5) * 0.04);
      arr[i * 3] = Math.cos(th) * r * jitter;
      arr[i * 3 + 1] = y * jitter;
      arr[i * 3 + 2] = Math.sin(th) * r * jitter;
    }
    return arr;
  }, [count, radius]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#9FB4D0" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function OrbitingDoc({ seed, phase, radius, lift, speed, reduced }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = reduced ? 0 : clock.elapsedTime;
    const life = (t * speed + phase) % 1;
    const a = phase * Math.PI * 2 + t * 0.11;
    m.position.set(Math.cos(a) * radius, lift + Math.sin(a * 1.3) * 0.25, Math.sin(a) * radius * 0.6);
    m.rotation.set(Math.sin(a) * 0.35, -a * 0.6, Math.cos(a) * 0.18);
    const appear = smooth(0, 0.08, life);
    m.scale.setScalar(0.7 + 0.3 * appear);
    // Each card lives, then burns away — the product in one gesture.
    m.material.uniforms.uDissolve.value = -0.1 + 1.25 * smooth(0.55, 0.95, life) + (1 - appear) * 1.2;
  });
  return <DocCard ref={ref} seed={seed} />;
}

const DOCS = [
  { seed: 1, phase: 0.05, radius: 2.15, lift: 0.5, speed: 0.045 },
  { seed: 2, phase: 0.27, radius: 2.35, lift: -0.4, speed: 0.038 },
  { seed: 3, phase: 0.48, radius: 2.05, lift: 0.05, speed: 0.05 },
  { seed: 4, phase: 0.66, radius: 2.45, lift: 0.75, speed: 0.033 },
  { seed: 5, phase: 0.83, radius: 2.2, lift: -0.75, speed: 0.042 },
];

function Rig({ reduced, children }) {
  const ref = useRef();
  const pointer = usePointer();
  const { viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  useFrame(() => {
    const g = ref.current;
    if (!g || reduced) return;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * 0.3, 0.04);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.18, 0.04);
  });
  return (
    <group ref={ref} position={wide ? [viewport.width * 0.2, 0.15, 0] : [0, 0.9, 0]} scale={wide ? 1 : 0.72}>
      <group rotation={[0.25, 0, -0.18]}>
        <mesh rotation={[Math.PI / 2.15, 0, 0]}>
          <torusGeometry args={[2.3, 0.0035, 6, 320]} />
          <meshBasicMaterial color="#7CE7D6" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.5, 0]}>
          <torusGeometry args={[2.75, 0.0025, 6, 320]} />
          <meshBasicMaterial color="#9FB4D0" transparent opacity={0.18} />
        </mesh>
      </group>
      {children}
    </group>
  );
}

export default function HeroScene({ reduced }) {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering when the hero is scrolled away: free battery, free GPU.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : visible ? 'always' : 'never'}
      >
        <Rig reduced={reduced}>
          <Orb reduced={reduced} />
          <Shell />
          {DOCS.map((d) => (
            <OrbitingDoc key={d.seed} {...d} reduced={reduced} />
          ))}
        </Rig>
      </Canvas>
    </div>
  );
}
