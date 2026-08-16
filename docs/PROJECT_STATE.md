# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING V3.1 SOURCE CANDIDATE / DEVICE GATE REBUILD`

## Authority and active lane

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
current V3.1 source candidate: c0b3ed2223a451cdacfd79f179efd2b88be7434f
Camera Manual Rig V1 absorption: 997c9a34ea429220dbdb4f5408a0ac37200bd712
fullscreen source checkpoint: checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143
Analog Steering V1 source: d80d4636a1327c3aaf9e6689a95a7cb1d91f98b2
Steering Control V2 UX/debug source: b9dd4f98ecee192af3302150c95542c772033949
temporary 35-degree drive bridge: d6c646b65a0d57306e138175209c0f652bdbfbda
public Steering V2 owner-device proof: release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3
superseded failed public V3 gate: release/friends-r1@e94ab696d05b4a976a2673a69e40d5ddffea94d7
public A53 performance proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public known-good Friends rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
public R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current Git, reproducible execution evidence and direct owner observation outrank this file. `main` remains accepted source authority until the canonical promotion gate is completed. `work/friends-r1-usability` is the only ordinary active product lane ahead of `main`.

The current V3.1 code is present on the **experimental active lane**. This is not owner acceptance and not promotion to `main`.

## Protected working foundation

Friends currently includes Plac E2R, Offroad, the owner vehicle and full JSPREV2 scan on desktop/phone.

The following owner-visible foundations are closed unless new evidence demonstrates regression:

- **Performance foundation v1:** Galaxy A53 / normal Chrome / current full textured JSPREV2 / render scale 1x / culling ON reached stable 60 scene presents/s at about 16.7 ms. This does not generalize to every device, 2x or future larger worlds.
- **Camera Manual Rig V1:** responsive framing/reset, broad manual distance/clipping range, orbit, vehicle-local pan, touch pinch+pan and desktop pan form the accepted manual camera baseline. Future automatic assists must remain additive to user calibration.
- **Fullscreen V1:** owner-validated on mobile and desktop; preserve explicit enter/exit behavior.
- **Steering Control V2:** owner-accepted as the mobile control foundation, with visual design intentionally still open. Preserve X-only analog `POSITION` semantics, neutral/release behavior, usable mobile placement and recoverable Debug.
- **Temporary steering range:** native full rack travel is mapped to approximately +/-35 degrees for JV-Web driving while the pinned receipt/native rack and JURE/final-rig authority remain unchanged.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open. JURE owns rig authoring.

## Why the first Mobile Driving V3 gate failed

The public gate at `e94ab696...` failed before the new pedal runtime could execute:

```text
Driving V3 pedal reset: expected source fragment not found
```

The failure came from brittle text surgery against compiled runtime source. It is classified as **PUBLIC HARNESS FAILURE**, not product evidence against analog pedals, D/R or the steering concept.

Do not continue that implementation by adding more `replaceOnce()`/regex patches to compiled product `main.js`. Keep the failed gate only as evidence of the harness boundary.

## Current source candidate — Mobile Driving V3.1

V3.1 was moved into normal typed source on the active work lane in three independent commits:

```text
db61b6610428032e17676583dc36cf84d44e84d1  input: analog pedals + live D/R foundation
e651209f3e67439ed1ffeafedeb1c0f919208020  ui: stable-hitbox Mobile Driving V3 controls
c0b3ed2223a451cdacfd79f179efd2b88be7434f  ui: short-landscape V3 authority
```

The diff from the pre-V3 lane contains only the intended V3.1 input/UI/test surfaces. Renderer, scan loading, Box3D boundary and vehicle drive model are not reworked by this slice.

### Steering Hybrid V3.1

The proven V2 input contract remains:

```text
one thumb
X-only gesture
normalized POSITION [-1, +1]
release -> neutral 0
temporary +/-35-degree product lock
```

V3.1 changes the interaction language, not the steering semantics. A shallow panoramic wheel/ellipse rotates with command while the physical thumb gesture stays linear X-only. Active-state visual enlargement is applied to internal presentation layers rather than changing the outer gesture geometry.

### Analog Pedals + D/R

Analog throttle/brake are integrated into the existing deterministic `LongitudinalInputTimeline`; they are not a second parallel physics/input system.

```text
THROTTLE: relative upward thumb travel -> 0..1
BRAKE:    relative upward thumb travel -> 0..1
```

Properties to preserve:

- pedal touch starts at 0 and grows from the pointer-down origin rather than jumping to an absolute screen value;
- usable travel is captured at pointer-down, so visual growth/shrink cannot change the command underneath the finger;
- release/cancel/blur/visibility/pagehide returns owned analog input to zero;
- steering and pedals can be owned by independent pointers;
- throttle and brake may coexist;
- legacy keyboard/digital demand remains valid and deterministic;
- D/R is a state selector and re-signs active analog throttle at the exact input timestamp.

**Owner direction decision:** for now allow D↔R while throttle is held and regardless of vehicle speed. Do not add neutral, throttle-release or speed-lock interlocks unless real driving demonstrates a need. The intentionally permissive behavior may enable interesting mechanics.

## Current evidence

Recovery after the interrupted session revalidated the exact saved V3.1 input candidate:

```text
focused analog/pointer tests: 22/22 PASS
TypeScript 5.8 scoped compile: PASS
local/Git source blob identity: PASS for timeline, pointer adapter, V3 UI and V3 CSS
active lane lineage: linear, no divergence detected
```

This is noncanonical evidence. The repository requires Node 24.16.0, npm 11.13.x, TypeScript 7.0.2, Vite 8.1.5 and real `box3d.js@0.0.2` for the formal gate.

A rendered headless Chromium probe was attempted twice after recovery and timed out before DOM output because the container browser process does not terminate/initialize reliably. Treat rendered proof here as **environment-blocked**, not product pass/fail. Do not spend repeated iterations repairing that container browser.

## Device-gate rebuild boundary

The next owner-device artifact must supersede `driving-v3-test/` rather than repair it.

Required properties:

1. preserve the accepted Camera/Fullscreen/Analog Steering V1/V2/35-degree basis;
2. use complete V3.1 typed-source modules with explicit identity/SHA checks;
3. do not text-patch compiled `main.js` for pedal/reset/UI behavior;
4. keep presentation bridge code separate from input semantics;
5. fail closed if exact expected modules/contracts are absent;
6. keep normal Friends root and known-good V2 rollback untouched until owner validation.

If current tooling cannot produce a trustworthy exact artifact from the current private source, request a fresh ZIP of `work/friends-r1-usability` rather than reconstructing a large private checkout through fragile API workarounds.

## What owner validation must answer

Judge the parts independently:

1. steering: one-thumb precision, full-lock access, recapture and whether rotating panoramic feedback beats V2 without hurting control;
2. throttle: whether low/medium/high values can be held naturally during driving;
3. brake: whether light versus hard braking is meaningfully controllable;
4. multitouch: sustained steering plus throttle/brake without pointer conflicts;
5. D/R: whether instant direction switching under throttle is fun/useful or creates unacceptable behavior;
6. feedback: whether pedal growth/neighbor shrink and steering animation clarify state without distraction;
7. layout: portrait and short-landscape reachability/occlusion.

One subsystem may pass while another needs another iteration. Do not couple acceptance artificially.

## Remaining formal promotion gate

Before advancing `main` / ordinary Friends release:

1. exact Node 24.16.0 + npm 11.13.x + lockfile dependencies;
2. `npm run check` with real Box3D coverage;
3. `npm run build:friends-r1` and portable checks;
4. rendered browser smoke of the canonical artifact;
5. exact source/artifact/rollback identity verification.

A public experimental gate does not satisfy this boundary.

## Documentation/workflow hygiene

Default context is `AGENTS.md` + this file + current source/tests. Use `docs/OWNER_CHECKPOINTS.md` for durable owner acceptance, `docs/ARCHITECTURE.md` for stable boundaries, and Git history for detailed archaeology.

Do not create per-agent handoffs, campaign journals or duplicate roadmaps. Do not record V3.1 in `OWNER_CHECKPOINTS.md` until the owner actually drives it successfully.
