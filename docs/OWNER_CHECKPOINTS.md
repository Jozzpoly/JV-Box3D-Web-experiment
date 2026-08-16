# JV Web — owner checkpoints

Updated: 2026-08-16

This is a compact ledger of owner-visible facts that future work must not silently overwrite. Detailed historical evidence remains in Git history and cold campaign/baseline documents.

A passing test is not owner acceptance. Acceptance is scoped to what Jozz actually observed.

## P0 — browser vehicle foundation

Classification: `OWNER ACCEPTED`

The browser product can load the owner vehicle, drive/steer/brake/reset, use Map/Offroad and use chase/orbit camera/debug controls. Later checkpoints refine this; they do not erase the basic product integration.

## S1 — FL upper placement/articulation

Classification: `OWNER ACCEPTED — NARROW`

The focused front-left upper suspension placement and live articulation were accepted at the tested precision/range. This did not validate the whole rig or lower suspension.

## S2 — front source/DOF semantics

Classification: `OWNER ACCEPTED — NARROW`

Preserve:

- `Socket_ChassisMount_b` / #6 is suspension-side and must not inherit steering rotation;
- `Socket_WheelCenter` / #8 is a distinct steerable member relative to #6;
- steering occurs around the accepted source-derived WheelCenter position;
- wheel steering/orientation and wheel spin remain distinct DOFs.

Do not expand this into authority for final carrier topology, rack law, tie rod, caster/KPI/trail or handling.

Owner-observed rig debt remains:

- FL lower placement is wrong;
- wishbone<->knuckle visual mating lacks trustworthy authored frames through articulation.

## R1-DRIVE-BRIDGE-01 — temporary coherent driving baseline

Date: 2026-08-13
Classification: `OWNER ACCEPTED — TEMPORARY PRODUCT INTERMEDIATE`

The temporary symmetric front removed the dominant two-mechanism left/right defect well enough to continue. Owner observed straight driving and materially more coherent left/right steering, with residual asymmetry/imperfections.

Not accepted:

- final steering physics/back-drive/self-align;
- provisional rack->angle mapping as future truth;
- final FR axis/hardpoints/topology;
- final caster/KPI/trail/tie-rod/rack geometry;
- final handling/feel;
- deferred rig mating.

## FRIENDS-R1-LIVE — public browser foundation

Date: 2026-08-14
Classification: `OWNER ACCEPTED — END-TO-END FRIENDS FOUNDATION`

Public release evidence:

```text
public branch: release/friends-r1
public commit: 7161215e47f00573b8c1b5c31e5931c89f9d709a
private source used by live hotfix: 0657e5ecbc4081e8ad75ce8b9d1a8be385c586eb
scan preview SHA-256: aee5242a208482944666b56bcc7ddfe66cbd4e72dc9da99199fbe667bd578146
```

Owner directly confirmed:

- Plac E2R works on desktop;
- Offroad works and can be driven over terrain;
- full JSPREV2 scan works on desktop after the Pages/CDN fix;
- Plac E2R / Offroad / full scan also work on phone;
- phone scan is noticeably slow/heavy but remains usable at low speed;
- portrait and landscape both render the scan/vehicle;
- phone camera/framing and some responsive UI are not yet satisfactory and are explicitly deferred.

Protected meaning: GitHub Pages + browser runtime + public scan + current vehicle form a real working product foundation.

This does **not** accept final mobile UX/performance, final vehicle rig, final steering physics or final driving feel.

## PERF-FND-A53-01 — mobile performance foundation v1

Date: 2026-08-15
Classification: `OWNER ACCEPTED — PERFORMANCE SCOPE`

Exact evidence boundaries:

```text
private source checkpoint: checkpoint/perf-foundation-a53-validated-2026-08-15@f42e16321d9edb26e10f44ab7c9eeda3c646291c
public device proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
device/browser: Samsung Galaxy A53 / normal Chrome
render scale: 1x
scan culling: ON
```

Owner directly observed:

- removing mobile live backdrop blur/heavy shadows over the WebGL canvas changed the Offroad control case from roughly 35 present/s to stable 60 present/s;
- Offroad sustained 60 present/s, 16.7 ms average and p95 16.8 ms after continued use;
- the complete textured JSPREV2 scan reached stable 60 present/s, 16.7 ms average and p95 16.8 ms while 19/25 scan groups were visible;
- the tested warm/cache scan loaded materially faster than earlier builds, with geometry appearing in well under the previous long wait and all textures finishing shortly afterward; the owner estimated textures completed about a second after geometry;
- performance improved enough that camera/control/other product issues became more noticeable than raw frame rate.

Instrumented warm/cache sample for interpretation, not universal startup timing:

```text
world 1337 ms
index 24 ms
tile pipeline 1127 ms (includes parse CPU 268 ms)
collision merge 53 ms
Box3D world create 3418 ms
textures 25/25 ready
cumulative synchronous texture-upload call time 776.2 ms
```

Not accepted by this checkpoint:

- stable 60 present/s at render scale 2x;
- a universal cold-cache loading time;
- future larger/multiple scans or other devices;
- canonical Node/npm/TypeScript/Vite packaging and release promotion;
- final mobile camera, joystick/steering or responsive UX;
- final rig/JURE integration or vehicle handling.

Protected meaning: for the present 1x A53 stress case, the lightweight performance foundation achieved its product purpose. Future agents should not reopen endless micro-optimization of this exact JSPREV2 without new evidence.

## CAMERA-MANUAL-RIG-V1 — manual inspection/navigation foundation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MANUAL CAMERA FOUNDATION`

Exact evidence boundary:

```text
Camera 1A private base: work/friends-r1-usability@dc8eab1ef3a24dcaab4b8fdff61da020c2518d5e
Camera 1B private absorption: 997c9a34ea429220dbdb4f5408a0ac37200bd712
public Camera owner-device gate: release/friends-r1@4768abedaa67b7505ca963a0836879e42590b67d
camera runtime patch SHA-256: fcc82118d607bed941b487d1f8222d291882c8f5ea51b600ade5b8ee04f1be78
public gate classification: noncanonical owner-device proof
```

Owner directly judged that the stage had largely achieved the intended result. The supplied validation screenshots demonstrate:

- normal Chrome phone use in landscape with the scan and vehicle rendered;
- very close / inside-or-under-vehicle manual inspection;
- far and aerial scan viewpoints;
- portrait and landscape phone use;
- desktop manual inspection inside/around the vehicle;
- supplemental Messenger in-app WebView operation.

Together with the tested interaction implementation, this accepts the current manual camera as a usable foundation for further JV-Web usability work. It does **not** turn every future camera behavior into accepted product truth.

Source/logic closure evidence:

- reconstructed Camera 1A source matched the relevant private remote blobs exactly before Camera 1B replay;
- reconstructed Camera 1B TypeScript emitted byte-identical owner-tested `m6-chase-camera.js` and `m6-world-renderer.js` runtime modules after the deterministic device-payload import rewrite;
- scoped camera/viewport tests passed 17/17 before private absorption;
- private absorption changed only `src/render/m6-chase-camera.ts`, `src/render/m6-world-renderer.ts` and `tests/m6-chase-camera.test.mjs`.

Not accepted by this checkpoint:

- camera persistence or presets;
- advanced automatic speed/turn/slope/terrain/obstacle assists;
- final HUD/settings/input/mobile steering UX;
- canonical Friends release packaging or promotion to `main`;
- any change to vehicle mechanics or rig authority.

Protected meaning: manual orbit/pan/zoom and broad inspection range are now a stable experience-layer baseline. Future automatic assists must remain additive and must not silently overwrite manual user calibration.

## FULLSCREEN-V1 — immersive browser presentation

Date: 2026-08-15
Classification: `OWNER ACCEPTED — MOBILE + DESKTOP FULLSCREEN`

Exact evidence boundary:

```text
private source: checkpoint/fullscreen-v1-owner-validated-2026-08-15@db55501342feacfb0f82099d7f47afe3a9756143
public device proof: checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba
public gate base: Camera 1B proof 4768abedaa67b7505ca963a0836879e42590b67d
public gate classification: noncanonical owner-device proof
```

Owner directly confirmed:

- fullscreen entry works on mobile and desktop;
- the control switches to the exit-fullscreen state and exits correctly;
- portrait and landscape mobile fullscreen render the scan, vehicle and controls;
- after several minutes of driving following fullscreen transitions, no camera/control regression was observed.

The supplied screenshots show the active fullscreen state in both portrait and landscape mobile layouts.

Not accepted by this checkpoint:

- canonical Node24/npm11/TypeScript7/Vite Friends packaging or promotion to `main`;
- universal behavior in every browser/WebView;
- final HUD layout or mobile steering ergonomics;
- final vehicle mechanics, steering physics or handling.

Protected meaning: explicit fullscreen is now a usable, owner-validated presentation capability. Future usability work should preserve it rather than reopening the capability without new evidence.

## STEERING-CONTROL-V2 — mobile steering foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — MOBILE CONTROL FOUNDATION, DESIGN OPEN`

Exact evidence boundary:

```text
private UX/debug candidate: b9dd4f98ecee192af3302150c95542c772033949
private temporary 35-degree bridge: d6c646b65a0d57306e138175209c0f652bdbfbda
public owner-device gate: release/friends-r1@2acd652f68d57497c8ce8886b2875789a70f4be3
public gate classification: noncanonical owner-device proof
```

Owner directly confirmed on phone, with supplied portrait and landscape screenshots:

- the V2 steering control works and is materially better than the previous circular V1 control;
- the new steering design is liked as a useful direction, although it is not considered final;
- the steering problem targeted by this slice is fixed well enough to continue product refinement;
- mobile Debug open/close behavior is fixed;
- the resulting mobile driving experience is promising enough that the owner explicitly wants to keep refining touch driving and noted it may become more pleasant than keyboard driving.

The screenshots also show the Steering V2 rack control in both portrait and landscape and the debug overlay with the Debug action still available as an exit path.

Not accepted by this checkpoint:

- the rack visual language as final steering UI;
- a final steering wheel/yoke interaction model;
- final steering sensitivity curves, haptics, speed adaptation or self-centering feel;
- analog throttle/brake/reverse design;
- final vehicle steering geometry, Ackermann/tie-rod authority or handling;
- the temporary 35-degree product bridge as final rig truth.

Protected meaning: X-only analog `POSITION` touch steering, the V2 mobile control placement, usable steering range and recoverable mobile Debug are now a stable product foundation. Future work should iterate the driving feel and control language without regressing these capabilities. The next steering experiments may replace the V2 visual/control metaphor if they demonstrably improve driving.

## P1-FOUNDATION-01 — mobile driving presentation foundation

Date: 2026-08-16
Classification: `OWNER ACCEPTED — PRODUCT/PRESENTATION FOUNDATION, DESIGN OPEN`

Exact evidence boundary:

```text
private owner-tested source: c9b5990b226685abe35851fc5e9496323096ecf7
public Friends release: release/friends-r1@a325c279cfe63a0607dba33c3c635a1716e09f8f
public rollback immediately before P1: checkpoint/pages-before-p1-foundation-2026-08-16@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf
canonical P1 focused gate: 48/48 PASS + typecheck + production Vite build
Friends release validator: PASS
live release probe: exact source/scan identity; old public runtime overlay absent
```

Owner directly tested the resulting public build on desktop and Samsung Galaxy A53 / Chrome. Supplied evidence covers desktop, portrait phone, portrait fullscreen, landscape browser and landscape fullscreen states.

Owner verdict for this boundary:

- the current state is satisfactory enough to close this stage;
- steering works well;
- pedals work well as the current functional foundation;
- the worst previous UI/presentation problems are resolved sufficiently to proceed;
- pedal design and pedal interaction are still intentionally open and expected to change substantially during later polish.

Not accepted by this checkpoint:

- final pedal mapping, pedal mechanics or visual design;
- final coordinated HUD composition and spacing;
- final steering visual language;
- rotational steering as a replacement for the working X-only reference;
- final rig geometry, Ackermann/tie-rod authority or vehicle handling;
- promotion to `main` before the separate Main Promotion Gate is completed.

Protected meaning: CSS ownership, release-runtime purity and short-viewport presentation are now good enough to serve as the owner-accepted P1 baseline. Further UI/control refinement should build on this state instead of reopening the solved V1/V2 contamination/release-overlay problems without new evidence.

## Durable method

When a later slice changes owner-visible behavior, record only the new durable verdict. Do not append test logs or rebuild the entire project chronology here.
