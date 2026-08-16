# AI project memory — JV Web

Updated: 2026-08-16
Status: `MAIN PROMOTED / GROUNDED FOR HANDOFF / PRODUCT WORK FROZEN`

This file is a compact router only. Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank it.

## Authority

- private source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- exact promoted evidence boundary: `2b12a2fa99d49ebe4d748ed851c194825129d38f`;
- exact owner-tested P1 runtime source: `c9b5990b226685abe35851fc5e9496323096ecf7`;
- current public Friends artifact: `release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- old private main is preserved by tag `rollback/main-before-p1-foundation-2026-08-16` -> `f8eb0908f5934aed2d504f34ce483a02754039ec`;
- immutable public fallback remains `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Resolve moving refs live before writes. Do not route work back to the former `work/mobile-driving-controls` lane; its product line was accepted and promoted.

## Validation / acceptance boundary

P1 owner-tested runtime `c9b5990b...`:

- 48/48 focused P1/input/lifecycle tests PASS;
- TypeScript PASS;
- normal Vite production build PASS;
- CSS entry authority / no late JS CSS PASS;
- short mobile viewport floor fix present;
- exact public Friends release validated and published;
- owner-tested on desktop + Galaxy A53 / Chrome in portrait, landscape, browser and fullscreen.

Owner verdict: steering works well, pedals work as the current foundation, and the worst old presentation failures are resolved sufficiently to close P1. Pedal semantics/design, HUD composition, steering design, final rig and handling remain open.

Final promotion candidate `2b12a2fa...`:

- complete repository suite **444 PASS / 0 FAIL**;
- docs/third-party checks PASS;
- portable production build + validators PASS;
- exact build identity PASS;
- source clean;
- runtime equivalence to `c9b5990b...` PASS;
- production dependency audit: 0 vulnerabilities.

The one full-audit `nanoid` entry was dev/build-tooling-only and did not justify changing the validated lockfile.

## Current task

Ground and hand off the promoted `main`.

No product feature implementation in this boundary. Do not resume P1.2/P2, camera work, performance work, old release repair or JURE runtime substitution here.

Read for takeover:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. `docs/HANDOFF.md`;
4. source/tests only for the chosen next task.

## Branch policy

Steady state: `main` plus at most one concrete temporary work lane.

JURE cross-repo experiments in this repo use `jure/<specific-purpose>` only and must be named in `docs/PROJECT_STATE.md` while active.

A branch cleanup retired the old ref forest after preserving divergent tips as archive/rollback tags. Three historical refs were accidentally recreated during an interrupted recovery immediately afterward. They are non-authoritative and should be removed before final handoff if still live:

- `archive/pre-cleanup-2026-08-10`;
- `candidate/jv-web-owner-vehicle-visual-r1`;
- `candidate/jv-web-render-host-r1`.

Do not restore the old branch forest.

## JURE coordination

JURE is separate authority for authored rig truth. Resolve JURE live before any cross-project work.

Grounding snapshot:

- JURE accepted baseline: `main@d971b8bef5dd7c65b78884b6b449e1f5ab0e7425`;
- clean foundation candidate / draft PR #3: `4db04eee4da0216f6bd3df6b6b0c82aa20afab5a`;
- active product line / draft PR #4: `work/real-jv-rig-elements@7b385e8e591d13c3ccab06647390d9d28e06a1d4`.

Critical current falsifier: procedural JV-Web M6 wishbone and exact/JURE-authored wishbone are not rigid-congruent. Never create a hybrid by replacing one authored hardpoint/relation inside an incompatible procedural shape.

Do not freeze a concrete JV-Web JURE import schema yet. JURE should first finish Owner-operability of the coherent four-relation wishbone and freeze the multi-relation consumer fragment.

Future first consumer sequence:

`exact versioned JURE fragment -> strict independent parse -> units/basis/provenance/placement validation -> coherent neutral geometry proof -> private jure/* runtime experiment -> later public decision`

No coordinate guessing, implicit identity transform, consumer dynamics in JURE, or public Friends change in the first consumer slice.

See `docs/contracts/JURE_CONSUMER_BOUNDARY.md`.

## Protected boundaries

Preserve:

- Plac E2R, Offroad, owner vehicle, approved JSPREV2;
- accepted A53 render-1x performance foundation;
- Camera Manual Rig V1 and Fullscreen V1;
- timestamped/fixed-step input architecture;
- independent throttle/brake ownership and fail-closed lifecycle;
- D/R-under-throttle semantics;
- generation-safe UI presentation;
- X-only steering `POSITION` as working reference;
- temporary steering/drive bridge as product intermediate only;
- JURE as authored rig authority, JV-Web as consumer/runtime authority.

## After takeover

Owner chooses one next lane:

- continue mobile polish from P1.2;
- or, if JURE has frozen the required consumer fragment, start one isolated `jure/<purpose>` consumer validation.

Do not run both as one slice.