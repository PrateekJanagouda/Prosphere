import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { docFragment, docVertex } from './shaders';

export const ACCENT = new THREE.Color('#7CE7D6');

/**
 * A procedural document card. Callers drive `material.uniforms.uDissolve`
 * from their own frame loop so one component serves both scenes.
 */
export const DocCard = forwardRef(function DocCard({ seed = 1, width = 0.36, height = 0.46, ...props }, ref) {
  const uniforms = useMemo(
    () => ({
      uDissolve: { value: -0.1 },
      uSeed: { value: seed * 7.13 },
      uAccent: { value: ACCENT.clone() },
    }),
    [seed]
  );

  return (
    <mesh ref={ref} {...props}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={docVertex}
        fragmentShader={docFragment}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

export const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
