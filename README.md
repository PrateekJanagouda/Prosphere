# Prosphere

**Share what matters. Not forever.** This is a demo of Prosphere, a service for sharing personal files through time-limited links.

> **Demo build.** Nothing is uploaded. The share flow reads only a file's name and size, in your browser. The links it creates don't carry a file, and they open the page recipients see after a link expires.

## Stack

- React 18 + Vite 5
- Three.js through `@react-three/fiber`, with custom GLSL (simplex-noise sphere and dissolving document cards)
- Self-hosted fonts via Fontsource (no third-party font requests), and no analytics or trackers

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Structure

```
src/
  three/        HeroScene (orb + orbiting docs), CapsuleScene (share panel), shaders
  components/   Page sections, ShareDemo (state machine: compose → ready → expired), ExpiredPage
  hooks/        useReducedMotion, useNow
  lib/format.js Byte/date formatting, CSPRNG link ids
```

## Production notes

- Three.js is lazy-loaded and split into its own chunk, so text renders before WebGL.
- The hero stops rendering when scrolled out of view (IntersectionObserver → `frameloop="never"`).
- `prefers-reduced-motion` freezes the scenes (`frameloop="demand"`) and disables CSS animation.
- If WebGL fails, an error boundary drops the scene and leaves the page fully usable.
- Link ids come from `crypto.getRandomValues` with a 64-symbol alphabet, so there's no modulo bias.

## Before this becomes a real product

The page uses placeholders (`[DELETION WINDOW]`, `[STORAGE PROVIDER / REGION]`, `[BACKUP RETENTION]`) on purpose. Don't replace them with guesses. Real sharing needs a backend that:

1. Enforces size, type and expiry limits on the server, not only in the client.
2. Refuses expired links on the server, with `Cache-Control: no-store` so caches can't serve expired files.
3. Deletes every stored copy (originals, previews, temporary uploads, replicas) on a disclosed schedule, including across restarts.
4. Keeps file contents and link secrets out of logs, analytics and browser storage.

Only switch the hero to the full product copy once these are implemented and verified.
