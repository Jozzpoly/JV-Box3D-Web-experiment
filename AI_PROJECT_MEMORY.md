# AI project memory — JV Web

Updated: 2026-08-22
Status: `DUAL-MODE STEERING + ABSOLUTE-POSITION PEDALS ACCEPTED IN MAIN / PEDAL TUNING OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / D-R GROUNDING NEXT / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- accepted source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted absolute-position pedal integration executable: `315e41aa3e68baaa74ab107d3ef0b82c14a2eb84`;
- Owner-tested pedal runtime candidate: `e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4`;
- accepted dual-mode steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- Owner Preview control: `preview/owner-control`;
- Owner Preview JSPREV2 layer: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/public artifact: `Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted steering foundation

Source `main` exposes `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`. Both are retained Owner-facing modes; final tuning remains open.

## Accepted pedal foundation

Source `main` now uses absolute pointer position inside pedal geometry frozen at acquisition:

- freeze `top + height` at pointer-down;
- current Y maps directly to `[0,1]`;
- pointer-down immediately applies represented value;
- clamp outside range;
- release/lifecycle loss -> zero;
- preserve independent throttle/brake ownership and steering coexistence.

Owner-tested runtime `e2d67ea1...` passed focused 30/30 and Owner A53/Chrome judgement for low/mid/high touch, micro-adjustment, full sweep/reversal, throttle+brake multitouch and steering+pedal coexistence. Owner judged it **better** than relative-from-touch.

Integration close:

- mechanical merge `e8e879a3...` preserved exact pedal runtime/direct-test blobs plus current docs;
- first full Windows gate exposed only a stale viewport test fixture missing the newly required pedal `top` geometry field;
- runtime was unchanged; fixture was corrected only by adding `top: 0`;
- exact `315e41aa...` then passed repo-declared Node/npm, `npm ci`, full `npm run build`, status `jv/pedal-integration-close = success`.

Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL FOUNDATION IN SOURCE / TUNING OPEN`.

Still open: exact lower neutral/contact buffer, value curve, mechanical feedback and final pedal design. Owner suggested roughly 5–10% lower zero/contact space, but that percentage is a future tuning hypothesis, not a frozen spec.

## D/R finding

Owner real-device smoke failed when attempting D/R while throttle remained held.

The event path is unchanged by pedal mapping: D/R `pointerdown` only stops propagation, actual switch relies on `click`, and no explicit pointer ownership/lifecycle exists. Core command semantics remain tested if a toggle arrives: held throttle is re-signed at the toggle timestamp.

Classification: `OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL MAPPING / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`.

Next functional work: ground/reproduce this on accepted source, then harden only pointer acquisition/lifecycle without changing D/R drivetrain semantics.

## Handling observation

Owner observed very small brake input dominating full throttle and reiterated broad low vehicle power. Keep this for later longitudinal/handling work; do not mix it into D/R or pedal-input slices.

## Roadmap

No fixed P-stage scheduler. Current sequence:

`D/R multitouch grounding + hardening -> pedal mechanical feedback + zero/contact tuning -> desktop/mobile hygiene -> portrait composition -> control industrial-design convergence -> later JURE/rig/handling`

Performance scaling only from measured need.

## Takeover route

Resolve live source `main`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Use `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for durable control intent and `docs/OWNER_CHECKPOINTS.md` for scoped Owner acceptance.
