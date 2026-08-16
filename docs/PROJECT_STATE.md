# JV Web — current project state

Updated: 2026-08-16
Owner: Jozz
Status: `MOBILE DRIVING V3.1 DEVICE GATE PUBLISHED / OWNER VALIDATION PENDING`

## Authority

```text
accepted private source: main@f8eb0908f5934aed2d504f34ce483a02754039ec
single active work lane: work/friends-r1-usability
exact V3.1 code candidate: c0b3ed2223a451cdacfd79f179efd2b88be7434f
current public V3.1 device candidate: release/friends-r1@0baba295e3f8a9df8f8445731f043839cb55396f
superseded failed V3 harness: e94ab696d05b4a976a2673a69e40d5ddffea94d7
public Steering V2 owner proof: 2acd652f68d57497c8ce8886b2875789a70f4be3
public A53 performance proof: checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0
public Friends rollback: checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a
R0 fallback: release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Git/reproducible evidence/direct owner observation outrank this file. V3.1 lives on the experimental active work lane; it is not owner-accepted and has not been promoted to `main`.

## Protected foundations

Do not reopen without new evidence:

- performance foundation v1: owner-validated Galaxy A53 / normal Chrome / current full textured JSPREV2 / render 1x / culling ON;
- Camera Manual Rig V1: accepted manual orbit/pan/pinch/zoom/framing foundation; future assists remain additive to manual calibration;
- Fullscreen V1: owner-validated mobile + desktop;
- Steering Control V2: owner-accepted mobile steering foundation with design still open; preserve one-thumb X-only `POSITION [-1,+1]`, release-to-neutral, recoverable Debug and the temporary +/-35-degree JV-Web product range.

Final rig geometry, Ackermann/tie-rod authority, feedback/back-drive and final handling remain open and belong to the future JURE-authored rig path. The 35-degree bridge is not final rig truth.

## Mobile Driving V3.1 source candidate

Normal typed source exists as three small commits:

```text
db61b6610428032e17676583dc36cf84d44e84d1  analog pedal + live D/R input foundation
e651209f3e67439ed1ffeafedeb1c0f919208020  stable-hitbox V3 controls + visual feedback
c0b3ed2223a451cdacfd79f179efd2b88be7434f  short-landscape V3 authority
```

### Steering

The physical touch contract stays the accepted V2 one: horizontal one-thumb `POSITION`, fast full-lock access, release -> neutral, temporary 35-degree product lock. V3.1 changes only the interaction language: a shallow panoramic/elliptical wheel rotates to visualize steering command. Visual active-state growth is internal and must not resize the gesture hitbox.

### Analog throttle / brake

Analog throttle and brake are first-class events in the existing deterministic longitudinal timeline rather than a parallel physics path.

```text
THROTTLE: relative upward travel from pointer-down -> 0..1
BRAKE:    relative upward travel from pointer-down -> 0..1
```

The adapter freezes the usable gesture geometry at pointer-down. Release/cancel/blur/visibility/pagehide zeroes owned pedal input. Steering and pedal pointers are independent; throttle and brake may coexist. Existing digital/keyboard demand remains valid.

### D/R direction

D/R is a state selector. When changed with analog throttle already active, the current throttle is re-signed at the input timestamp.

**Owner decision:** allow D↔R under throttle and regardless of speed for now. Do not add neutral, pedal-release or speed-lock interlocks unless real driving later demonstrates a need. The permissive behavior may enable useful/fun mechanics.

## Why V3 became V3.1

The old public V3 gate `e94ab696...` failed before new pedal runtime with:

```text
Driving V3 pedal reset: expected source fragment not found
```

Root class: brittle text surgery against compiled `main.js`. This is public-harness failure evidence, not product evidence. Do not repair that gate through more `replaceOnce()` patches.

## Current public device gate

`release/friends-r1@0baba295e3f8a9df8f8445731f043839cb55396f` supersedes the failed gate.

Its public diff from `e94...` is one commit containing **11 added files only under `driving-v31-test/*`**. Normal Friends root, V2, Camera and fullscreen remain untouched.

Gate design:

- exact static runtime derived offline from the frozen owner-tested Steering V1 device harness;
- static runtime compressed into three small base64 parts;
- bootstrap verifies gzip SHA-256, decompresses, then verifies the uncompressed runtime SHA-256 before execution;
- full V3.1 longitudinal/pointer/UI modules and CSS are independently SHA-verified before use;
- V3.1 does not runtime-patch another loader and does not text-patch compiled `main.js` for pedal/reset/UI behavior;
- the accepted Steering V1 harness remains inherited support; the accepted 35-degree product bridge is preserved;
- gate fails closed on missing/mismatched contracts.

Evidence currently available:

```text
focused analog/pointer tests: 22/22 PASS
TypeScript 5.8 scoped compile: PASS
exact source/local/Git blob identity: PASS
all published JS syntax checks: PASS
public diff isolation: PASS
GitHub Pages build: BUILT for exact 0baba295...
post-publication Git blob identity: PASS for critical loader/manifest/source module
agent-side rendered Chromium: ENVIRONMENT BLOCKED (two timeouts before DOM)
agent-side direct Pages HTTP fetch: ENVIRONMENT BLOCKED (container DNS)
owner device runtime/feel: PENDING
canonical Node24/npm11/TS7/Vite/real-box3d gate: NOT RUN
```

Environment-blocked browser/DNS evidence is not a product failure. Do not spend repeated iterations fixing the container merely to obtain a synthetic green check; the next high-value evidence is real-device driving.

## Owner gate

Test Offroad first in normal mobile Chrome. Judge the following independently rather than accepting/rejecting V3.1 as one block:

1. steering precision, full-lock access, recapture and whether the rotating panoramic visual improves feedback without hurting control;
2. throttle modulation at low/medium/high values;
3. brake modulation versus the old binary brake;
4. sustained steering + throttle/brake multitouch;
5. D/R switching while throttle is held — fun/useful versus unacceptable behavior;
6. pedal growth / neighbor shrink and steering animation as feedback;
7. portrait and short-landscape reachability and occlusion.

If boot fails, preserve the exact visible error and debug only that boundary. If one subsystem feels wrong, iterate it independently while keeping accepted parts.

## Promotion boundary

Before promotion to `main` / ordinary Friends release, still require the exact repository toolchain: Node 24.16.0, npm 11.13.x, TypeScript 7.0.2, Vite 8.1.5, real `box3d.js@0.0.2`, `npm run check`, Friends/portable build checks, rendered smoke and exact source/artifact/rollback identity.

Do not record V3.1 in `OWNER_CHECKPOINTS.md` until owner driving actually validates it.
