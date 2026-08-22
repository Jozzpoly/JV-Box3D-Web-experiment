# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / DUAL-MODE STEERING + ABSOLUTE-POSITION PEDALS ACCEPTED IN MAIN / PEDAL TUNING OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / D-R GROUNDING NEXT / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Read `AGENTS.md`.
5. Read `docs/PROJECT_STATE.md`.
6. Read this handoff.

Do not infer active work from old branch names. Closed `work/direct-rotation-steering` and `work/pedal-absolute-position` refs are navigation/history only once they resolve into accepted ancestry.

## Exact accepted boundary

```text
absolute-position pedal integration executable:
  315e41aa3e68baaa74ab107d3ef0b82c14a2eb84

pedal merge parent:
  e8e879a3185ca61cb924acf5490c24781dc84ad8

Owner-tested pedal runtime candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

Owner Preview JSPREV2 layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/public artifact main:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` is accepted source/product authority. Public/Friends `main` is artifact/release authority. `preview/owner-control` is operational control only.

## Steering foundation

Source `main` contains both retained Owner-facing steering modes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

Classification:

`OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`

Do not restart steering integration or force a single mode without new Owner evidence.

## Pedal foundation — integration closed

Accepted source now uses absolute position inside frozen pedal acquisition geometry:

- `top + height` are frozen at pointer-down;
- current pointer Y maps directly to `[0,1]`;
- pointer-down immediately applies the represented value;
- outside range clamps to 0/1;
- release/lifecycle loss returns command to zero;
- independent throttle/brake ownership and steering coexistence remain protected.

Owner-tested runtime `e2d67ea1...` passed focused 30/30 causal tests and Owner Samsung Galaxy A53 / Chrome judgement for low/mid/high acquisition, micro-correction, full sweep/reversal, throttle+brake multitouch and steering+pedal coexistence. Owner judged the model **better** than relative-from-touch.

The mechanical merge preserved exact runtime/test blobs from that candidate plus current documentation. The first full Windows close caught one stale viewport test fake that lacked the new `top` geometry field; only that test fixture was corrected. Exact `315e41aa...` then passed repo-declared Node/npm, `npm ci` and full `npm run build` with status `jv/pedal-integration-close = success`.

Classification:

`OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL FOUNDATION IN SOURCE / TUNING OPEN`

Still open: lower zero/contact buffer, final value curve, visual/mechanical actuation feedback and final pedal industrial design.

## Pedal zero/contact intent

Owner wants the ability to touch the pedal at exact zero and then roll smoothly into analog input. Current future hypothesis is roughly a lower 5–10% zero/contact buffer with smooth remapping after actuation starts.

Do not freeze that percentage. The future visual system should distinguish contact/buffer from actual actuation so input semantics and physical-looking feedback agree.

## D/R next

Owner real-device testing failed when attempting to switch D/R while throttle remained held.

Current source path:

- D/R `pointerdown` only stops propagation;
- actual toggle relies on `click`;
- no explicit D/R pointer ownership/lifecycle exists;
- core command semantics correctly re-sign held throttle if a toggle event arrives.

Classification:

`OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL MAPPING / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`

The next work should first ground/reproduce the acquisition failure on accepted source, then implement the smallest robust pointer contract without changing D/R drivetrain semantics.

## Longitudinal handling observation

Very small brake input was observed to dominate full throttle; Owner also notes broad low vehicle power. Keep this outside D/R/pedal-input work and revisit under a dedicated handling/vehicle stage.

## Preview / Friends discipline

Owner Preview remains the default iterative test surface and must preserve accepted capabilities unrelated to the current experiment, including JSPREV2.

Temporary causal/integration workflows used for pedal validation have been removed. Normal Preview remains lightweight.

Friends/Public remains separately accepted and currently predates the later steering and pedal source foundations. Source acceptance does not auto-publish Friends.

ZIP/local-Windows preview remains forensic/emergency fallback only.

## Living roadmap

No fixed P-stage scheduler. Current sequence:

`D/R multitouch grounding + hardening -> pedal mechanical feedback + zero/contact tuning -> desktop/mobile hygiene -> portrait -> control industrial-design convergence -> later JURE/rig/handling`

Performance/LOD/streaming only from new measured need.

## Next checkpoint

**Ground the Owner-observed D/R multitouch failure on accepted `main`, preserving drivetrain semantics and all accepted steering/pedal behavior. Do not start mechanical pedal redesign or vehicle-power tuning in the same slice.**
