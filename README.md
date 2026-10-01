# Prosphere

**Get the insight. Not the exposure.** Prosphere is a planned product that reads personal documents, starting with credit card statements, on your own device. It removes identifiers before any AI analysis.

> **Preview build.** Nothing is analysed or uploaded. The try-it flow reads only a file's name and size, and the redaction table shows example rows, not the user's statement.

## Stack

- React 18 + Vite 5
- Three.js through `@react-three/fiber` and `drei`: a single fixed scene behind the page (a glass sphere and paper cards that dissolve through a patched `MeshStandardMaterial`)
- Self-hosted fonts via Fontsource (no third-party font requests), and no analytics or trackers

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).
Live at https://prateekjanagouda.github.io/Prosphere/

## Structure

```
src/
  three/        Experience (the one scene), store (share state → scene), shaders (noise)
  components/   Page sections, InsightDemo (compose → preview → cleared)
  hooks/        useReducedMotion, useNow
  lib/format.js Byte/date formatting, CSPRNG link ids
```

## Production notes

- **How the 3D follows the layout:** sections place invisible `data-orb="<stage>"` boxes. Each frame the scene reads where those boxes are on screen, moves the sphere to the one nearest the centre, and blends the card formations by stage. The 3D placement comes from CSS, so it works at every breakpoint.
- Three.js is lazy-loaded and split into its own chunk, so text renders before WebGL.
- `prefers-reduced-motion` switches the canvas to on-demand rendering (it redraws on scroll and state changes only) and turns off CSS animation.
- If WebGL fails, an error boundary drops the scene and leaves the page fully usable.

## Before this becomes a real product

The page uses placeholders (`[DELETION WINDOW]`, `[STORAGE PROVIDER / REGION]`, `[BACKUP RETENTION]`) on purpose. Don't replace them with guesses. Real sharing needs a backend that:

1. Enforces size, type and expiry limits on the server, not only in the client.
2. Refuses expired links on the server, with `Cache-Control: no-store` so caches can't serve expired files.
3. Deletes every stored copy (originals, previews, temporary uploads, replicas) on a disclosed schedule, including across restarts.
4. Keeps file contents and link secrets out of logs, analytics and browser storage.

Only switch the hero to the full product copy once these are implemented and verified.
