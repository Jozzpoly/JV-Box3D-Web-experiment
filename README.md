# Jozz Vehicle — JV Web

A browser driving sandbox for **Jozz Vehicle**: a physically simulated off-road buggy (double wishbones, coilovers, steering rack, four driven wheels on Box3D) that you can drive on desktop or phone, straight from a link.

**Play:** https://jozzpoly.github.io/JV-Box3D-Web-Public/

The public link serves the last Owner-accepted Friends release. Newer source on `main` reaches it only after a separate Friends promotion and Owner device check (see `docs/PROJECT_STATE.md`).

## What you can do

- **Plac** — a concrete square with rubble fields and log rows to drive over (default, light: ~3 MB).
- **Offroad** — rolling generated terrain.
- **Skan** — a photogrammetry scan of a real place (~100 MB, loads on demand). On any scan start, **Zapisz start** turns the current spot into a shareable link.

## Controls

| | Desktop | Phone |
|---|---|---|
| Throttle / reverse | `W` / `S` (or arrows) | Gaz pedal, `D/R` switch |
| Steer | `A` / `D` | Wheel (rotate or drag mode) |
| Brake | `Space` | Hamulec pedal |
| Reset vehicle | `R` | ↻ |
| Camera | drag to orbit, wheel to zoom, `C` to re-centre | drag / pinch, camera button |

The wheel stays where you leave it: there is no artificial self-centering (see *Known open questions*).

## Known open questions

- **Natural steering self-return.** The front wheels currently follow the rack kinematically, so tyre forces cannot return the steering. Physical self-alignment was shown to emerge with real tie rods, but needs deliberate steering-rig geometry first — `docs/evidence/STEERING_RETURN_PROBE_2026-10-10.md`.
- Final handling, power/brake feel and rig visuals are Owner-judged on device; see `docs/OWNER_CHECKPOINTS.md`.

---

## For contributors and agents

JV Web is its own product line (link → load → drive), **not NextGen JV Lite**; discoveries from other JV projects do not imply shared architecture.

Authority order: live Git and executed evidence → `AGENTS.md` (operating rules) → `docs/PROJECT_STATE.md` (single live state router) → focused baseline/evidence docs. `docs/HANDOFF.md` is a compact continuation entry; `docs/archive/` is history only.

```text
Jozzpoly/JV-Box3D-Web-experiment
  main                  accepted source + canonical documentation authority
  preview/owner-control Owner Preview composition infrastructure
  work/* / research/*   only genuinely active bounded work

Jozzpoly/JV-Box3D-Web-Public
  accepted Friends/public artifact authority (GitHub Pages)
```

### Toolchain

```text
Node 24.16.0 · npm >=11.13.0 <12 (npm@11.13.0) · TypeScript 7.0.2 · Vite 8.1.5 · box3d.js 0.0.2
```

`box3d.js@0.0.2` is a deliberate reproducibility baseline; 0.1.x changes the binding contract and is a separate investigation.

### Build and test

```bash
npm ci
npm run dev        # local dev server
npm run build      # typecheck + tests + docs/notice checks + portable build gates
npm run test       # all tests (includes headless driving behavior tests)
```

Vehicle feel is protected by `tests/vehicle-driving-behavior.test.mjs`: the exact product rig on Box3D without a renderer, with player-level thresholds (0–50 km/h time, braking deceleration, straight tracking, steering response, brake-vs-throttle, released-steering wind-up). Prefer extending it over source-text assertions.

A green build proves reproducibility for the exact source tested; it is not Owner/product acceptance.

### Work discipline

- verify mutable refs before writing; keep accepted truth separate from experiments;
- prefer the smallest experiment that can change a decision; preserve negative evidence;
- reconcile existing assertions when an accepted contract changes;
- do not create or modify GitHub Actions without explicit Owner approval;
- do not push routine engineering work onto the Owner.

Third-party notices: `THIRD_PARTY_NOTICES.md`.
