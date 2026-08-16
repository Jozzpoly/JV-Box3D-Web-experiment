# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING OWNER-DEVICE ALPHA LIVE / R0.1 SOURCE HYGIENE IMPLEMENTED / CANONICAL CHECK PENDING`

This file is a compact router only. Git/current source, exact execution logs, built/public artifact evidence and direct owner observation outrank it.

## Authority

- accepted private authority: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active work lane: `work/mobile-driving-controls`;
- exact source used by current live mobile-driving alpha: `d96e393c466aa41c6436c12bcb1b4ab1861828b0`;
- runtime implementation checkpoint: `f56be8c85ea2b26533eee89c050b1b55cf21ec4b`;
- current public Friends alpha: `release/friends-r1@7766f711390a33ea8f24a3ddba6eeed4e2eeb4bf`;
- pre-alpha public rollback: `checkpoint/pages-before-mobile-driving-2026-08-16@fa00f4c3a3c19f1319302bc1728f9cf6490ce462`;
- immutable public fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only `work/mobile-driving-controls` is active ahead of `main`. Historical V3/V3.1/rebuild refs are donor evidence only.

## Proven alpha state

Canonical Windows install/typecheck/build/artifact validation exists for exact clean source `d96e393c...` under Node 24.16.0, npm 11.17.0, TS 7.0.2, Vite 8.1.5 and real box3d.js. Public build manifest pins that source.

Owner directly confirmed the live public build works on desktop and Samsung Galaxy A53 / Chrome. Analog pedals work and are materially better than old binary drive buttons. The projected steering-wheel concept is promising.

Do **not** call the d96 repository suite fully green: the preserved publication run explicitly used `npm run typecheck` with no unit-test suite. R0.1 reconciled known stale mobile/UI tests; one new exact canonical `npm run check` is still required.

Do not restart takeover, V3 recovery, camera work, release-harness archaeology or the input architecture.

## Current owner-intent authority

Read:

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`

For technical preparation/readiness also read:

- `docs/MOBILE_DRIVING_ROADMAP_READINESS_AUDIT_2026-08-16.md`;
- `docs/MOBILE_DRIVING_POLISH_TECHNICAL_AUDIT_2026-08-16.md` when deeper implementation evidence is needed.

The older `MOBILE_DRIVING_CONTROLS_TARGET.md` is background only where not superseded by post-device feedback.

## R0.1 current boundary

Source-side test hygiene is implemented without product/runtime changes:

- behavioural ownership/lifecycle/D-R/frozen-geometry/generation tests remain;
- `mobile-ui-contract` now protects current analog product/accessibility semantics instead of binary/circular UI;
- `mobile-driving-integration-contract` protects analog/generation wiring instead of stylesheet history;
- superseded `mobile-driving-controls-v2.test.mjs` was removed;
- `toolchain-contract` now pins what `npm test`, `npm run check` and default test discovery actually mean.

**Next action is one canonical Windows `npm run check` on the current active source.**

Until it passes, do not start P1.0 and do not claim the full suite is green.

If it fails, classify the exact failure first. Do not modify product code merely to satisfy a stale test.

## Critical preparatory findings

### CSS/runtime authority

Current source mixes direct V2/current mobile stylesheet links with base `style.css` imported by dynamically loaded `main.ts`. Production Vite loading can append base CSS later and let historical equal-specificity rules override current controls.

This explains real alpha contamination including the returning circular/blue steering shell, action-rail competition and generic outer active transforms on new pedal targets.

P1.0 must establish one current style owner rather than stacking more specificity.

### Viewport/layout

`100svh + min-height:420px + overflow:hidden` can clip short browser-chrome landscape. Renderer projection derives from canvas client geometry, so repair CSS viewport authority rather than adding camera workarounds.

HUD overlays have no single composition owner; after root repair establish coordinated product zones instead of more independent offsets.

### Public executable overlay

Current public alpha preserves `jv-live-performance.js`, executable JS outside private source. It is mostly inert on the normal URL but can override DPR and install WebGL/perf instrumentation on diagnostic URLs. Private source already owns those concerns.

Do not preserve that overlay into the next Friends candidate. Future executable root behavior must come from private source; only approved static scan/data and explicit release metadata may be carried forward.

### Validation classes

Keep separate:

1. source/check evidence;
2. build/artifact/static HTTP evidence;
3. browser execution/render evidence;
4. owner-device judgement.

Static Pages HTTP smoke does not execute JS/CSS/WebGL.

## Locked owner feedback

### Responsive HUD

Current alpha is cluttered. Short/rotated landscape can clip useful controls/interface and Camera/Reset/Debug competes with pedals. Treat this as coordinated driving-HUD composition, not local offset patching.

### Pedal input

After P1 foundation, move from relative pointer-down travel to absolute Y inside frozen pedal geometry:

- bottom = low;
- top = high;
- pointer-down immediately emits touch-position demand;
- drag up increases, drag down decreases;
- release/lifecycle loss = zero;
- preserve independent ownership, simultaneous T+B, D/R and fail-closed lifecycle.

### Pedal feedback

Replace fill/progress feedback with physical pedal depression/tilt/translation. Keep acquisition geometry stable. Later align pedal industrial design with steering wheel.

### Steering

Keep steep projected real-wheel concept. Remove distracting blue shell and repair rim/hub/spokes. X-only works but owner instinctively tries rotation; direct rotational manipulation is a later isolated A/B experiment. Preserve X-only until owner-proven replacement. Do not mix with rig/physics.

## Main roadmap after R0.1

1. `P1.0 production CSS authority` — one loading graph, retire historical live component layers, inspect real production artifact/render.
2. `P1.1 root viewport geometry`.
3. `P1.2 coordinated mobile HUD zones`.
4. `P1.3 action/navigation policy`.
5. `P1.4 driving-zone sizing/spacing`.
6. `P1.5 portrait sanity`.
7. `P2 absolute-position pedal input`.
8. `P3 mechanical pedal motion`.
9. `P4 steering visual cleanup`.
10. `P5 rotational steering A/B experiment`.
11. `P6 joint wheel/pedal design + feel`.
12. `P7 portrait-specific composition`.

## Protected boundaries

Preserve:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 performance foundation for tested render-1x case;
- Camera Manual Rig V1 and Fullscreen;
- deterministic input timelines;
- multitouch ownership/non-stealing/lifecycle fail-closed behavior;
- D/R-under-throttle semantics;
- generation-safe presentation boundary;
- temporary approximately +/-35-degree steering bridge;
- JURE boundary for final rig/steering geometry and final handling.

A local presentation/release failure is never justification to discard the analog-control stack.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`
4. readiness/technical audit only as needed
5. source/tests for the current slice
