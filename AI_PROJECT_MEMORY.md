# AI project memory — JV Web

Updated: 2026-08-22
Status: `DUAL-MODE STEERING ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDALS OWNER-PREFERRED / PEDAL INTEGRATION OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / JURE PAUSED`

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

Source `main` exposes `Obrót / DIRECT_ROTATION` and `Przeciąganie / RELATIVE_X`. Both remain retained Owner-facing modes; final tuning remains open.

## Pedal verdict

Exact candidate `e2d67ea1...` maps current pointer Y directly to `[0,1]` inside pedal geometry frozen at pointer-down. It changes only the pedal adapter and `tests/analog-drive.test.mjs`.

Focused evidence: repo-declared Node 24.16.0 / npm 11.13.0, `npm ci`, analog-drive + analog host contract + mobile integration suites: **30/30 PASS**. Status `jv/pedal-absolute-causal = success`.

Owner A53/Chrome judgement passed low/mid/high initial touch, micro-adjustment, full sweep/reversal, throttle+brake multitouch and steering+pedal coexistence. Owner judged the absolute-position model **better**.

Classification: `OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`.

Not yet accepted/frozen: integration into `main`, exact dead-zone/value curve, mechanical presentation or final pedal design.

Owner wants a later lower zero/contact buffer of roughly **5–10%** so a finger can touch at exact zero and then roll smoothly into analog input. Treat the percentage as a tuning hypothesis, not a spec. Visual feedback should eventually distinguish contact/buffer from actual actuation.

## D/R finding

Owner real-device smoke failed when switching D/R while throttle remained held.

The D/R event path is unchanged between accepted `main` and the pedal candidate: `pointerdown` only stops propagation, actual switch relies on `click`, and no explicit D/R pointer ownership/lifecycle exists. The pedal mapping delta does not modify that path.

Classification: `OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL DELTA / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`.

Core command semantics remain tested if the toggle event arrives: held throttle is re-signed at the toggle timestamp.

## Handling observation

Owner observed that very small brake input dominates full throttle and that the vehicle is broadly underpowered. Keep this as separate future longitudinal/handling evidence; do not change motor/brake physics during pedal integration or D/R acquisition work.

## Next sequence

`pedal semantics integration close -> D/R multitouch acquisition hardening -> pedal mechanical feedback + zero/contact-zone tuning`

After that: desktop/mobile hygiene, portrait composition, control industrial-design convergence, later JURE/rig/handling. Performance scaling only from measured need.

## Takeover route

Resolve live `main`, `work/pedal-absolute-position`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

Use `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` for durable control intent and `docs/OWNER_CHECKPOINTS.md` for scoped Owner acceptance.
