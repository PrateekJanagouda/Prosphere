import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DocCard } from './DocCard';

const GONE = 1.15;
const WHOLE = -0.1;

function Capsule({ target, reduced }) {
  const doc = useRef();
  const cage = useRef();
  const invalidate = useThree((s) => s.invalidate);

  // In reduced-motion mode the loop only runs on demand; nudge it on change.
  useEffect(() => {
    invalidate();
  }, [target, invalidate]);

  useFrame((state, dt) => {
    const u = doc.current?.material.uniforms.uDissolve;
    if (!u) return;
    if (reduced) {
      u.value = target;
    } else {
      // Frame-rate independent damping toward the target state.
      u.value += (target - u.value) * (1 - Math.exp(-dt * 2.2));
      doc.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.35;
      doc.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      cage.current.rotation.y += dt * 0.12;
      cage.current.rotation.x += dt * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={cage}>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial color="#7CE7D6" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[1.75, 0.004, 6, 200]} />
        <meshBasicMaterial color="#9FB4D0" transparent opacity={0.3} />
      </mesh>
      <DocCard ref={doc} seed={9} width={0.95} height={1.22} />
    </group>
  );
}

export default function CapsuleScene({ state, reduced }) {
  const target = state === 'empty' || state === 'expired' ? GONE : WHOLE;
  return (
    <div className="capsule__canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 4.4], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Capsule target={target} reduced={reduced} />
      </Canvas>
    </div>
  );
}
