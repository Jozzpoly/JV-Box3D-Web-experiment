# AI project memory — JV Web

Updated: 2026-08-22
Status: `DUAL-MODE STEERING ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDAL FALSIFIER ACTIVE / OWNER PEDAL FEEL OPEN / JURE PAUSED`

Compact router only. Live Git, executed evidence and direct Owner observation outrank this file.

## Current authority

- accepted source/product authority: live `main` of `Jozzpoly/JV-Box3D-Web-experiment`;
- accepted executable/source head before current pedal experiment: `bd4f6ad5df097b65536f7cb63d4fcb88691d9042`;
- accepted dual-mode steering integration executable: `4961cee419a88dc54a5f0ee743cc1ee65886a734`;
- active ordinary product lane: `work/pedal-absolute-position@e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4`;
- Owner Preview pointer source: `e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4`;
- Owner Preview JSPREV2 layer: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`;
- accepted Friends/public artifact: `Jozzpoly/JV-Box3D-Web-Public/main@279dd4eec8599ad12c95e03b50a52c478e8a50e7`.

## Accepted steering foundation

Source `main` exposes `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`. Both are retained Owner-facing foundation modes; final tuning remains open. `X_POSITION` is historical/regression reference only.

Integration executable `4961cee4...` passed full Windows `npm ci + npm run build` on the repo-declared toolchain and Owner A53/Chrome smoke for both steering modes, steering+pedal multitouch, JSPREV2, fullscreen and basic UI.

## Active pedal experiment

Accepted `main` pedals are relative-from-touch: pointer-down starts at zero and command grows from displacement relative to `originY`.

Exact candidate `e2d67ea1...` tests absolute position in frozen acquisition geometry:

- freeze `top + height` on pointer-down;
- map current Y directly to `[0,1]`;
- pointer-down immediately applies the represented value;
- clamp outside range;
- preserve release/lifecycle zeroing, independent throttle/brake ownership, D/R semantics and steering coexistence.

Only the pedal adapter and `tests/analog-drive.test.mjs` differ from accepted `main`. No CSS, mechanical presentation, D/R redesign, steering, physics or drivetrain changes.

Focused causal evidence: repository-declared Node 24.16.0 / npm 11.13.0, `npm ci`, `analog-drive`, analog host contract and mobile integration suites: **30/30 PASS**. Status `jv/pedal-absolute-causal = success` on exact `e2d67ea1...`.

The first predecessor run was 29/30 due only to a bad test oracle comparing a final event value with a time-integrated interval command. The product adapter did not change before the successful rerun. Temporary causal CI was retired afterward.

Owner Preview V2 pointer selects the exact candidate + accepted JSPREV2. Final live Pages identity after the pointer update was not independently read back in this session; Owner device confirmation therefore remains part of the checkpoint. Owner feel judgement is still open. Do not merge the candidate from machine evidence alone.

## D/R next candidate

Core D/R semantics already re-sign held throttle at toggle time and throttle/brake ownership is independent. The weaker touch boundary is D/R acquisition: it relies on `click` after pointerdown rather than explicit pointer ownership/lifecycle, and lacks strong real-device second-finger evidence while other controls remain held.

Classification: `GROUNDED NEXT CANDIDATE / NOT YET IMPLEMENTED / NOT A PROVEN REGRESSION`.

Current recommendation if pedal semantics are retained:

`pedal semantics -> D/R multitouch acquisition hardening -> pedal mechanical feedback`

## Roadmap

No fixed P-stage scheduler. After the active pedal/D-R control work: pedal mechanical feedback, desktop/mobile capability hygiene, portrait composition, steering/pedal industrial-design convergence, later JURE/rig/handling. Performance scaling only from measured need.

## Takeover route

Resolve live `main`, `work/pedal-absolute-position`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Use `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for durable control intent and `docs/OWNER_CHECKPOINTS.md` only for already-established Owner acceptance.
