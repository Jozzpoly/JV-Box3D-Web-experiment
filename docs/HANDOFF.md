# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / DUAL-MODE STEERING ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDALS OWNER-PREFERRED / PEDAL INTEGRATION OPEN / D-R MULTITOUCH GAP OWNER-OBSERVED / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.
2. Resolve `work/pedal-absolute-position`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
5. Read `AGENTS.md`.
6. Read `docs/PROJECT_STATE.md`.
7. Read this handoff.

`work/direct-rotation-steering` is closed historical navigation. The current ordinary active product lane is `work/pedal-absolute-position`.

## Exact current boundary

```text
accepted executable/source head before pedal experiment:
  bd4f6ad5df097b65536f7cb63d4fcb88691d9042

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active pedal branch:
  work/pedal-absolute-position

Owner-tested pedal candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview pointer source:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview JSPREV2 layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/public artifact main:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` remains accepted source/product authority. Public/Friends `main` remains artifact/release authority. Preview is operational control only.

## Accepted steering foundation

Source `main` contains both retained Owner-facing steering modes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

Classification: `OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`.

Do not restart steering integration or force a single mode without new Owner evidence.

## Pedal semantics verdict

Accepted pre-experiment pedals are relative-from-touch. Exact candidate `e2d67ea1...` tests absolute position inside frozen pedal acquisition geometry and changes only the pedal adapter + direct tests.

Machine evidence on exact candidate: repo-declared Node/npm, `npm ci`, three focused suites, **30/30 PASS**, status `jv/pedal-absolute-causal = success`. The predecessor 29/30 run was a bad test oracle only; product source was unchanged before the successful rerun.

Owner tested the candidate on Samsung Galaxy A53 / Chrome and confirmed:

- low/mid/high initial touch works;
- small up/down correction works;
- full-range sweep/reversal works;
- throttle + brake multitouch works;
- steering + pedal coexistence works;
- overall result is **better** than relative-from-touch.

Classification:

`OWNER ACCEPTED — ABSOLUTE-POSITION PEDAL PRODUCT DIRECTION / INTEGRATION + TUNING OPEN`.

Do not merge future dead-zone or presentation ideas into the integration close merely because they are already discussed.

## Future pedal zero/contact-zone intent

Owner wants a later way to touch the pedal at semantic zero and roll smoothly into input. Current hypothesis is an approximately **5–10% lower acquisition buffer** that remains `0`, with a smooth analog remap after actuation begins.

This is not a frozen percentage/spec. The visible pedal should eventually distinguish “contact in the zero/buffer zone” from “actuation has begun”, so tune this together with mechanical feedback rather than as an invisible magic threshold.

## D/R multitouch finding

Owner's regression smoke failed when trying to switch D/R while throttle remained held on A53.

The direction event path is unchanged between accepted `main` and the pedal candidate: D/R `pointerdown` only stops propagation and actual toggle depends on `click`. D/R has no explicit pointer ownership/lifecycle comparable to steering/pedals. The pedal candidate does not change that path.

Classification:

`OWNER OBSERVED — REAL-DEVICE D/R MULTITOUCH ACQUISITION GAP / NOT ATTRIBUTED TO PEDAL-MAPPING DELTA / ACCEPTED-MAIN DEVICE REPRO NOT YET RUN`.

Core command semantics are still valid when a toggle event actually arrives: held throttle is re-signed at the toggle timestamp. The likely next functional slice is therefore input acquisition/lifecycle hardening, not drivetrain redesign.

## Longitudinal/handling observation

Owner observed that even very small brake input can dominate full throttle and reiterated that the vehicle is generally underpowered. Keep this as separate future longitudinal/handling evidence. Do not change motor/brake physics while closing pedal input semantics or D/R multitouch.

## Recommended next sequence

1. **Pedal semantics integration close** — integrate exact `e2d67ea1...` semantics into accepted `main` with appropriate integration validation, while leaving dead-zone/feedback tuning open.
2. **D/R multitouch acquisition grounding + hardening** — reproduce the real-device failure and improve pointer ownership/lifecycle without changing D/R drivetrain semantics.
3. **Pedal mechanical feedback + zero/contact-zone tuning** — make physical actuation and the future buffer threshold visually coherent.

Then return to desktop/mobile hygiene, portrait, control industrial-design convergence and later JURE/rig/handling as evidence directs.

## Preview / Friends discipline

Owner Preview remains the default iterative test surface and preserves accepted JSPREV2 as a separately pinned static layer. Friends/Public remains separately accepted and does not auto-advance with source `main` or Preview candidates.

ZIP/local-Windows preview remains forensic/emergency fallback only.

## Ref discipline

There is exactly one ordinary active product lane: `work/pedal-absolute-position`.

`preview/owner-control` is the permanent special operational lane and does not count as a competing source lane.

## Closed work not to restart

Without contradictory evidence, do not reopen recovery/publication campaigns, Camera/Fullscreen reconstruction, P1 close machinery, steering integration, Preview JSPREV2 restoration or accepted-A53 optimization.

## Next checkpoint

**Prepare and validate a clean pedal-semantics integration close from the exact Owner-tested candidate. Do not implement D/R hardening, dead-zone tuning or pedal mechanical polish in the same close.**
