// Tiny bridge between the share UI and the 3D scene.
// The scene reads it every frame; listeners only matter in reduced-motion
// mode, where the canvas renders on demand.
export const sceneState = { capsule: 'empty' }; // empty | holding | expired

const listeners = new Set();

export function setCapsule(value) {
  if (sceneState.capsule === value) return;
  sceneState.capsule = value;
  listeners.forEach((fn) => fn());
}

export function onSceneChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
