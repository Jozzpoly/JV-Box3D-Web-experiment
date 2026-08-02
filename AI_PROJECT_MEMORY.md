# AI project memory — JV Box3D Web Experiment

Updated: 2026-08-03

## Goal

Proof of concept: run a real, current JV vehicle rig in a browser on the JV board and a 3D-scan terrain. Quality and production completeness are secondary to proving the vertical slice.

## Critical owner correction

Do **not** copy M5 as the vehicle. M5 is an old, simple rig. The authoritative vehicle starts at M6 and includes later M7+ updates. The web runtime must preserve the multi-body/hardpoint architecture, physical rack/tie rods, real-force drive and subsequent wheel-envelope work.

## Current implementation

Branch `agent/bootstrap-web-poc` and draft PR #1 contain a Vite + TypeScript + Three.js + `box3d.js/inline` bootstrap. The vehicle builder is an M6/M7-oriented four-corner double-wishbone rig, not M5. It includes torque drive, rack steering, coilovers, ARB, aero and split sphere/sidewall wheel collision.

The world currently provides a procedural JV-style board and optional scan slots:

- `public/assets/scan/terrain-visual.glb`
- `public/assets/scan/terrain-collision.glb`

## Validation completed

- `npm install` succeeds with 0 reported vulnerabilities.
- strict TypeScript checking succeeds.
- the production Vite build succeeds in GitHub Actions on head `05022b8`.

This validates compilation only. Native/web physics parity and runtime browser behavior remain explicit gates.

## Next validation order

1. Open the built app and validate world creation before tuning.
2. Compare body/joint counts and static pose against native M6 Rig Lab.
3. Export a current M6 config/preset from JV rather than hand-copying old constants.
4. Copy the chosen vehicle visual assets.
5. Copy/convert the JV board.
6. Add the cleaned scan pair and inspect ghost contacts.
7. Port load-dependent rack friction, static toe and other remaining parity items.

## Known binding risk

`box3d.js@0.0.2` exposes mesh creation, but its simple wrapper does not enable Box3D mesh edge identification. Vehicle testing on the scan may require a small binding fork with `identifyEdges=true`.
