# JV Web — takeover handoff

Updated: 2026-08-22
Status: `HANDOFF READY / DUAL-MODE STEERING FOUNDATION ACCEPTED IN MAIN / TUNING OPEN / JSPREV2 PREVIEW PARITY / NO ORDINARY ACTIVE PRODUCT LANE / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry

1. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.
2. Resolve `preview/owner-control` and read `preview/owner.json`.
3. Resolve `Jozzpoly/JV-Box3D-Web-Public/main`.
4. Read `AGENTS.md`.
5. Read `docs/PROJECT_STATE.md`.
6. Read this handoff.

Do not infer active work from old branch names. `work/direct-rotation-steering` is no longer an active product lane after integration and has been fast-forwarded to current `main` only to avoid carrying a competing tree.

## Exact current boundary

```text
accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

pre-integration steering evidence parent:
  1b25cf242a007b84f236155e6067539c825876ec
  tree: 20bf084af97fe0c3b780e621467c53362b779303

older P1.2/P1.3/P1.3.1 accepted executable anchor:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

Owner Preview JSPREV2 layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f

accepted Friends/public artifact main:
  279dd4eec8599ad12c95e03b50a52c478e8a50e7

Friends executable source remains:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4
```

`main` is accepted source/product authority. Public/Friends `main` is accepted artifact/release authority. `preview/owner-control` is operational control only.

## Steering foundation — integration closed

Source `main` contains two Owner-facing modes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

`X_POSITION` remains internal regression/reference only.

Evidence for integration executable `4961cee4...`:

- exact steering/test blobs are preserved from `1b25cf24...`;
- current pre-close `main` documentation is preserved through the other parent;
- the integration delta relative to previous `main` is limited to steering/input/host/UI/test scope;
- exact candidate passed repository-declared Node/npm on `windows-latest`, `npm ci`, and full `npm run build` with status `jv/integration-close-windows = success`;
- Owner Samsung Galaxy A53 / Chrome regression smoke passed `Obrót`, `Przeciąganie`, steering+pedal multitouch, JSPREV2, fullscreen and basic UI.

Classification:

`OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`

Do not reopen the question of whether one mode must be deleted without new Owner evidence. Final Direct/Relative tuning, gain, full-lock/reversal/edge behavior, sensitivity, haptics/self-centering and industrial design remain open.

## Owner Preview contract

Owner Preview is the default iterative test surface:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

Preview V2 keeps executable and preserved static provenance separate. JSPREV2 remains an exact approved static layer from Public anchor `a325c279...`; it must be validated against the accepted receipt before deploy.

The temporary heavy Windows gate used only for this steering milestone has already been removed after PASS. `preview/owner-control` is back on the ordinary lightweight Preview workflow and points at accepted `main` plus JSPREV2.

ZIP/local-Windows preview remains forensic/emergency fallback only.

## Friends/Public boundary

Friends/Public remains separately accepted and currently **does not contain the new dual-mode source foundation**. Do not auto-promote it merely because source `main` advanced. Any Friends release is a later explicit publication decision with its own artifact and Owner evidence.

## Roadmap status

There is no fixed `P1.4 -> P2 -> P3` scheduler. Current living priority after the steering structural close:

1. pedal semantics grounding/falsifier design;
2. pedal mechanical feedback as a separable presentation problem;
3. desktop/mobile capability hygiene;
4. portrait-specific composition;
5. steering/pedal industrial-design convergence;
6. later JURE/rig/handling;
7. performance/LOD/streaming only from new measured need.

Current pedal implementation is relative-from-touch displacement: pointer-down begins at semantic zero and vertical movement is measured from `originY`. The strongest durable next hypothesis is absolute position inside frozen pedal acquisition geometry, preserving multitouch/D-R/lifecycle behavior and leaving physics unchanged in the first slice.

## Ref discipline

There is currently no ordinary product lane ahead of `main`. The still-visible `work/direct-rotation-steering` branch is historical/redundant navigation and currently resolves to the same tree/ref state as `main`; it is not active work. Do not revive it just because the name remains visible.

`preview/owner-control` remains the permanent special operational lane and must not be merged into source `main` for symmetry.

## Closed work not to restart

Without new contradictory evidence, do not reopen old recovery/publication work, Camera/Fullscreen reconstruction, P1 CSS repair, P1.2/P1.3/P1.3.1 close machinery, accepted A53 optimization, dual-mode steering integration, Preview JSPREV2 parity restoration, ZIP/local preview as normal workflow or speculative JURE runtime substitution.

## Next checkpoint

**Ground and design the first pedal-semantics falsifier before implementing it.**

Do not begin by changing pedal visuals, physics or drivetrain simultaneously; first decide and isolate input semantics.
