# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING OWNER-DEVICE ALPHA LIVE / POLISH CAMPAIGN GROUNDED`

This file is a router only. Git/current source, reproducible runtime evidence and direct owner observation outrank it.

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

Canonical Windows build/publication exists for exact clean source `d96e393c...` using Node 24.16.0, npm 11.17.0, TS 7.0.2, Vite 8.1.5 and real box3d.js. Public build manifest pins that source and GitHub Pages is built from `release/friends-r1`.

Owner directly confirmed the live public build works on desktop and Samsung Galaxy A53 / Chrome. Analog pedals work and are materially better than the old binary buttons. The projected steering-wheel concept is strongly promising.

Do not restart takeover, V3 recovery, camera work, release-harness work or the input architecture.

## Current owner-intent authority

Read first for mobile-control work:

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`

The older `MOBILE_DRIVING_CONTROLS_TARGET.md` remains background but is superseded where the new grounding explicitly records post-device feedback.

## Critical owner feedback now locked

### Responsive HUD

Current alpha is cluttered. Short/rotated landscape can clip useful controls/interface and the right Camera/Reset/Debug rail competes with the pedal cluster. Treat this as coordinated driving-HUD composition, not another pile of local offsets.

### Pedal input

Relative-from-pointer-down mapping is superseded for the next experiment.

Target:

- bottom of frozen pedal geometry = low;
- top = high;
- pointer-down immediately emits value from touch Y;
- drag up increases, drag down decreases;
- release/lifecycle loss = zero;
- preserve independent ownership, simultaneous T+B, D/R state and fail-closed lifecycle.

### Pedal feedback

Current fill/progress visualization is rejected. The pedal itself should physically depress/tilt/move with analog value while the invisible acquisition geometry stays fixed. Pedal styling should later share a coherent automotive/mechanical design language with the steering wheel.

### Steering

Keep the steeply projected real-wheel idea. Remove the large blue shell/background and improve rim/hub/spokes; spokes should meet the rim correctly.

Current X-only steering works but the visual wheel makes the owner instinctively try to rotate it. Direct rotational manipulation is now a dedicated experiment. Preserve X-only until the rotational gesture is owner-proven. Do not mix this with rig/steering physics.

## Preferred work packets

1. `P1 responsive driving-HUD composition` — fix clipping/overlap without changing command semantics.
2. `P2 absolute-position pedal input` — direct Y mapping in frozen geometry.
3. `P3 mechanical pedal motion` — physical depression, no progress-bar feedback.
4. `P4 steering visual cleanup` — remove shell, improve wheel geometry, keep X-only for isolation.
5. `P5 rotational steering gesture experiment` — compare direct wheel rotation with working X-only on A53.
6. `P6 joint wheel/pedal design + feel tuning`.
7. `P7 portrait-specific composition`.

These are slices, not required branches/version names.

## Protected boundaries

Preserve:

- Plac E2R, Offroad, owner vehicle and approved JSPREV2;
- accepted A53 performance foundation for the tested render-1x case;
- Camera Manual Rig V1 and Fullscreen capability;
- deterministic input timeline;
- multitouch ownership/non-stealing/lifecycle fail-closed behavior;
- D/R-under-throttle semantics;
- generation-safe presentation boundary;
- temporary approximately +/-35-degree product steering bridge;
- JURE boundary for final rig/steering geometry and final handling.

A local polish failure is never justification to discard the analog control stack.

## Next action

This grounding stage makes no product implementation. Next justified implementation is `P1 responsive driving-HUD composition` unless the owner reprioritizes.

Use smallest relevant checks, then return to real browser/A53 judgement quickly. Tests support the product; they are not the product acceptance criterion.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md`
4. source/tests for the current slice
5. `docs/contracts/MOBILE_DRIVING_CONTROLS_TARGET.md` only for earlier foundation/background
6. `docs/ARCHITECTURE.md` only when stable boundaries are needed
