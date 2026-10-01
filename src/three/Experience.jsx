import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { noise } from './shaders';
import { onSceneChange, sceneState } from './store';

/*
  One fixed canvas behind the whole page. Sections don't own 3D objects;
  they place invisible anchors (`data-orb="<stage>"`). Every frame the scene
  reads where those anchors are on screen and moves the sphere there, so the
  3D layout follows the CSS layout at every breakpoint for free.

  Stages: 0 hero · 1 how it works · 2 privacy · 3 share · 4 end (everything gone)
*/

export const BG = '#E9EDF2';
const STAGES = 5;
const CARD_COUNT = 5;
const damp = THREE.MathUtils.damp;
const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// ---------- anchors → world space ----------
function readAnchors(viewport) {
  const els = document.querySelectorAll('[data-orb]');
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const weights = new Array(STAGES).fill(0);
  let total = 0;
  let x = 0;
  let y = 0;
  let r = 0;
  els.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const cy = rect.top + rect.height / 2;
    const cx = rect.left + rect.width / 2;
    const d = (cy - vh / 2) / vh;
    const w = Math.exp(-d * d * 7); // the anchor nearest the screen centre wins
    x += (cx / vw - 0.5) * viewport.width * w;
    y += -(cy / vh - 0.5) * viewport.height * w;
    r += (Math.min(rect.width, rect.height) / vw) * viewport.width * 0.34 * w; // leave room for the ring
    weights[Number(el.dataset.orb) || 0] += w;
    total += w;
  });
  if (total < 1e-4) return null;
  return { x: x / total, y: y / total, r: r / total, weights: weights.map((w) => w / total) };
}

// ---------- paper card: lit material + noise dissolve ----------
function makePaperTexture() {
  const c = document.createElement('canvas');
  c.width = 390;
  c.height = 500;
  const g = c.getContext('2d');
  const rr = (x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  g.clearRect(0, 0, 390, 500);
  g.fillStyle = '#FBFCFD';
  rr(0, 0, 390, 500, 28);
  g.fill();
  g.fillStyle = '#0E7C7B';
  rr(44, 54, 132, 16, 8);
  g.fill();
  g.fillStyle = '#CDD5DF';
  const lens = [290, 250, 300, 180, 270, 240, 120];
  lens.forEach((len, i) => {
    rr(44, 118 + i * 36, len, 10, 5);
    g.fill();
  });
  g.fillStyle = '#0F1E3A';
  g.globalAlpha = 0.85;
  rr(44, 410, 80, 34, 17);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCardMaterial(map, seed) {
  const uniforms = {
    uDissolve: { value: -0.1 },
    uSeed: { value: seed * 7.13 },
    uEdge: { value: new THREE.Color('#19C2B0') },
  };
  const m = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.6,
    metalness: 0,
    side: THREE.DoubleSide,
    alphaTest: 0.5, // rounded corners come from the texture's alpha
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vObjPos;
uniform float uDissolve;
uniform float uSeed;
uniform vec3 uEdge;
${noise}`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
float dn = snoise(vec3(vObjPos.xy * 3.0, uSeed)) * 0.5 + 0.5;
dn = mix(dn, 0.5 - vObjPos.y, 0.35);
if (dn < uDissolve) discard;
float dEdge = (1.0 - smoothstep(0.0, 0.06, dn - uDissolve)) * step(-0.05, uDissolve);`
      )
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdge * dEdge * 2.5;');
  };
  m.customProgramCacheKey = () => 'prosphere-dissolve';
  m.userData.uniforms = uniforms;
  return m;
}

// Where card i wants to be in a given stage, relative to the sphere (centre c, radius R).
function cardPose(i, stage, t, c, R, capsule, out) {
  const k = i / CARD_COUNT;
  switch (stage) {
    case 0: {
      // Orbit, each card living and expiring on its own cycle.
      const a = k * Math.PI * 2 + t * 0.12;
      const life = (t * (0.035 + i * 0.006) + k) % 1;
      const appear = smooth(0, 0.08, life);
      out.set(c.x + Math.cos(a) * 1.85 * R, c.y + (Math.sin(a * 1.3) * 0.3 + (i % 2 ? 0.35 : -0.35)) * R, Math.sin(a) * 1.1 * R);
      out.rot.set(Math.sin(a) * 0.3, -a * 0.6, Math.cos(a) * 0.15);
      out.s = 0.62 * R;
      out.d = -0.1 + 1.25 * smooth(0.62, 0.95, life) + (1 - appear) * 1.2;
      return out;
    }
    case 1: {
      // A hand of cards fanned in front of the sphere.
      const o = i - 2;
      out.set(c.x + o * 0.52 * R, c.y - 0.15 * R - Math.abs(o) * 0.12 * R, 1.25 * R - Math.abs(o) * 0.12 * R);
      out.rot.set(-0.12, o * -0.22, o * -0.11 + Math.sin(t * 0.6 + i) * 0.02);
      out.s = 0.66 * R;
      out.d = -0.1;
      return out;
    }
    case 2: {
      // Held inside the sphere — stored, but contained.
      const a = k * Math.PI * 2 + t * 0.25;
      out.set(c.x + Math.cos(a) * 0.38 * R, c.y + Math.sin(a) * 0.24 * R, Math.sin(a) * 0.22 * R);
      out.rot.set(t * 0.3 + i, t * 0.4 + i * 2, 0.2);
      out.s = 0.34 * R;
      out.d = -0.1;
      return out;
    }
    case 3: {
      // One card for the file in the share demo; the rest are gone.
      if (i === 0) {
        out.set(c.x, c.y + Math.sin(t * 0.8) * 0.04 * R, 0.1 * R);
        out.rot.set(0.05, Math.sin(t * 0.5) * 0.45, 0);
        out.s = 0.62 * R;
        out.d = capsule === 'holding' ? -0.1 : 1.15;
        return out;
      }
      const a = k * Math.PI * 2;
      out.set(c.x + Math.cos(a) * 0.3 * R, c.y + Math.sin(a) * 0.3 * R, 0);
      out.rot.set(0, a, 0);
      out.s = 0.3 * R;
      out.d = 1.15;
      return out;
    }
    default: {
      const a = k * Math.PI * 2 + t * 0.08;
      out.set(c.x + Math.cos(a) * 2.4 * R, c.y + Math.sin(a) * 0.5 * R, Math.sin(a) * 1.3 * R);
      out.rot.set(0, -a, 0);
      out.s = 0.5 * R;
      out.d = 1.15;
      return out;
    }
  }
}

function makePose() {
  const p = new THREE.Vector3();
  p.rot = new THREE.Vector3();
  p.s = 1;
  p.d = 0;
  return p;
}

// ---------- the scene ----------
function World({ reduced }) {
  const { viewport, invalidate } = useThree();
  const orb = useRef();
  const ring = useRef();
  const cards = useRef([]);
  const target = useRef({ x: 0, y: 0, r: 1.2, weights: [1, 0, 0, 0, 0] });
  const pointer = useRef({ x: 0, y: 0 });

  const paper = useMemo(makePaperTexture, []);
  const materials = useMemo(() => Array.from({ length: CARD_COUNT }, (_, i) => makeCardMaterial(paper, i + 1)), [paper]);
  const cardGeo = useMemo(() => new THREE.PlaneGeometry(0.78, 1), []);
  const scratch = useMemo(() => ({ pose: makePose(), acc: makePose(), c: new THREE.Vector3() }), []);

  // Free GPU resources we created by hand (R3F only disposes what it declared).
  useEffect(
    () => () => {
      paper.dispose();
      cardGeo.dispose();
      materials.forEach((m) => m.dispose());
    },
    [paper, cardGeo, materials]
  );

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    if (!reduced) return () => window.removeEventListener('pointermove', onMove);
    // Reduced motion renders on demand: redraw only when something changes.
    const redraw = () => invalidate();
    window.addEventListener('scroll', redraw, { passive: true });
    window.addEventListener('resize', redraw);
    const off = onSceneChange(redraw);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', redraw);
      window.removeEventListener('resize', redraw);
      off();
    };
  }, [reduced, invalidate]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = reduced ? 0 : state.clock.elapsedTime;
    const anchors = readAnchors(viewport);
    if (anchors) target.current = anchors;
    const tg = target.current;

    // Sphere follows the active anchor. Reduced motion: jump, don't glide.
    const g = orb.current;
    const lam = reduced ? 1e3 : 4;
    g.position.x = damp(g.position.x, tg.x, lam, dt);
    g.position.y = damp(g.position.y, tg.y, lam, dt);
    const R = damp(g.scale.x, tg.r, lam, dt);
    g.scale.setScalar(R);
    if (!reduced) {
      g.rotation.y = damp(g.rotation.y, pointer.current.x * 0.35, 3, dt);
      g.rotation.x = damp(g.rotation.x, pointer.current.y * 0.2, 3, dt);
      ring.current.rotation.z += dt * 0.15;
    }

    // Cards: blend each stage's pose by how "present" that section is.
    const c = scratch.c.copy(g.position);
    const { pose, acc } = scratch;
    for (let i = 0; i < CARD_COUNT; i++) {
      const m = cards.current[i];
      if (!m) continue;
      acc.set(0, 0, 0);
      acc.rot.set(0, 0, 0);
      acc.s = 0;
      acc.d = 0;
      for (let s = 0; s < STAGES; s++) {
        const w = tg.weights[s];
        if (w < 1e-3) continue;
        cardPose(i, s, t, c, R, sceneState.capsule, pose);
        acc.addScaledVector(pose, w);
        acc.rot.addScaledVector(pose.rot, w);
        acc.s += pose.s * w;
        acc.d += pose.d * w;
      }
      const cl = reduced ? 1e3 : 5;
      m.position.set(damp(m.position.x, acc.x, cl, dt), damp(m.position.y, acc.y, cl, dt), damp(m.position.z, acc.z, cl, dt));
      m.rotation.set(damp(m.rotation.x, acc.rot.x, cl, dt), damp(m.rotation.y, acc.rot.y, cl, dt), damp(m.rotation.z, acc.rot.z, cl, dt));
      m.scale.setScalar(damp(m.scale.x, acc.s, cl, dt));
      const u = m.material.userData.uniforms.uDissolve;
      u.value = damp(u.value, acc.d, reduced ? 1e3 : 2.5, dt);
      m.visible = u.value < 1.05;
    }
  });

  return (
    <>
      <group ref={orb} scale={1.2}>
        <mesh>
          <sphereGeometry args={[1, 128, 128]} />
          <meshPhysicalMaterial
            color="#F7FCFC"
            transmission={1}
            thickness={1.4}
            roughness={0.06}
            ior={1.32}
            iridescence={1}
            iridescenceIOR={1.28}
            iridescenceThicknessRange={[120, 520]}
            clearcoat={1}
            clearcoatRoughness={0.1}
            attenuationColor="#A6E3DC"
            attenuationDistance={2.6}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.16, 48, 48]} />
          <meshStandardMaterial color="#0E7C7B" roughness={0.3} metalness={0.2} />
        </mesh>
        <group ref={ring} rotation={[1.2, 0.25, 0]}>
          <mesh>
            <torusGeometry args={[1.42, 0.008, 12, 256]} />
            <meshStandardMaterial color="#0F1E3A" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[1.42, 0, 0]}>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshStandardMaterial color="#0E7C7B" roughness={0.3} />
          </mesh>
          <mesh position={[-1.0, 1.0, 0]}>
            <sphereGeometry args={[0.03, 24, 24]} />
            <meshStandardMaterial color="#0F1E3A" roughness={0.3} />
          </mesh>
        </group>
        <ContactShadows position={[0, -1.45, 0]} scale={6} blur={2.8} far={3.5} opacity={0.32} resolution={512} color="#0F1E3A" />
      </group>

      {materials.map((mat, i) => (
        <mesh key={i} ref={(el) => (cards.current[i] = el)} geometry={cardGeo} material={mat} />
      ))}

      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" color="#7CE7D6" intensity={2.5} position={[2, 2, 4]} scale={2.5} />
      </Environment>
    </>
  );
}

export default function Experience({ reduced }) {
  return (
    <div className="experience" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 9], fov: 32 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <color attach="background" args={[BG]} />
        <World reduced={reduced} />
      </Canvas>
    </div>
  );
}
