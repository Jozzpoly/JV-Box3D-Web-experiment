# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / DUAL-MODE STEERING ACCEPTED IN MAIN / ABSOLUTE-POSITION PEDAL FALSIFIER ACTIVE / OWNER PEDAL FEEL OPEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.
2. Resolve `work/pedal-absolute-position`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
5. Read `AGENTS.md`.
6. Read `docs/PROJECT_STATE.md`.
7. Read this handoff.

Do not infer active work from old branch names. `work/direct-rotation-steering` is closed historical navigation after steering integration.

## Exact current boundary

```text
accepted source main before pedal experiment:
  bd4f6ad5df097b65536f7cb63d4fcb88691d9042

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

active pedal branch:
  work/pedal-absolute-position

active pedal candidate:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview executable:
  e2d67ea1c675caf7c7467e1bd2df6bff0f948dc4

Owner Preview JSPREV2 layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/public artifact main:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7
```

`main` remains accepted source/product authority. The pedal branch is experimental. Public/Friends `main` remains artifact/release authority. Preview is operational control only.

## Accepted steering foundation

Source `main` contains both retained Owner-facing modes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

Classification: `OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`.

Do not restart steering integration or force a single mode without new Owner evidence.

## Active pedal falsifier

Accepted pedals on `main` are relative-from-touch: pointer-down begins at semantic zero and command follows displacement from `originY`.

Candidate `e2d67ea1...` changes only pedal mapping + direct tests:

- freeze pedal `top + height` at pointer-down;
- derive `[0,1]` directly from current pointer Y;
- pointer-down immediately applies low/mid/high according to touch position;
- clamp outside the frozen rectangle;
- release/lifecycle still zeroes the command.

No pedal CSS/mechanical redesign, D/R redesign, steering, physics or drivetrain changes are part of this slice.

Focused causal evidence on exact `e2d67ea1...`: repository-declared Node/npm, `npm ci`, three relevant suites, **30/30 PASS**, status `jv/pedal-absolute-causal = success`. A predecessor 29/30 failure was a bad test oracle only; product source did not change before the successful rerun. The temporary causal workflow has been removed.

## Owner Preview / next judgement

Owner Preview V2 points at exact `e2d67ea1...` + accepted JSPREV2.

The active question is feel, not machine correctness. Owner should judge:

- low / middle / high initial touch;
- small up/down corrections;
- full-range sweep and reversal;
- throttle + brake multitouch;
- steering + pedal coexistence;
- quick D/R while throttle held as regression smoke.

Result should be classified `better`, `worse` or `ambiguous`. If ambiguous, introduce A/B only then. Do not merge merely because tests pass.

## D/R after pedals

Core D/R command semantics already re-sign held throttle correctly. The remaining weak boundary is touch acquisition: D/R toggles on `click` and lacks explicit pointer ownership/lifecycle comparable to steering and pedals. That is a grounded likely next experiment, but not yet a proven regression.

Recommended order if absolute pedal semantics are retained:

`pedal semantics -> D/R multitouch acquisition hardening -> pedal mechanical feedback`

Keep drivetrain/vehicle physics outside those control slices.

## Preview / Friends discipline

Owner Preview remains the default iterative test surface and must preserve accepted capabilities unrelated to the experiment, including JSPREV2. Friends/Public remains separately accepted and does not auto-advance with source `main` or Preview candidates.

ZIP/local-Windows preview is forensic/emergency fallback only.

## Ref discipline

There is exactly one ordinary active product lane: `work/pedal-absolute-position`.

`preview/owner-control` is the permanent special operational lane and does not count as a competing source lane.

## Closed work not to restart

Without contradictory evidence, do not reopen recovery/publication campaigns, Camera/Fullscreen reconstruction, P1 close machinery, steering integration, Preview JSPREV2 restoration or accepted-A53 optimization.

## Next checkpoint

**Obtain Owner real-device judgement on the exact absolute-position pedal candidate. Do not implement D/R hardening or pedal mechanical polish until that semantics verdict is understood.**
