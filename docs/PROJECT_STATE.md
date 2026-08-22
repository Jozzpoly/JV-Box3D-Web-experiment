# JV Web — current project state

Updated: 2026-08-22
Owner: Jozz
Status: `DUAL-MODE STEERING FOUNDATION ACCEPTED IN MAIN / TUNING OPEN / JSPREV2 LIVE ON OWNER PREVIEW / NO ORDINARY ACTIVE PRODUCT LANE / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted executable anchor before dual-mode steering:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

accepted dual-mode steering integration executable:
  4961cee419a88dc54a5f0ee743cc1ee65886a734

exact pre-integration steering evidence parent:
  1b25cf242a007b84f236155e6067539c825876ec
  tree: 20bf084af97fe0c3b780e621467c53362b779303

Owner Preview control lane:
  preview/owner-control

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f
  receipt: receipts/jv_friends_scan_receipt.json

Owner Preview URL:
  https://jozzpoly.github.io/JV-Box3D-Web-experiment/

accepted Friends/public artifact authority:
  Jozzpoly/JV-Box3D-Web-Public/main
  279dd4eec8599ad12c95e03b50a52c478e8a50e7

Friends executable source remains:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4
```

`4961cee4...` is the exact dual-mode integration executable that received new machine and Owner evidence. Later docs-only `main` descendants do not inherit that execution evidence; they preserve the same product bytes while updating current truth.

There is currently **no ordinary active product lane ahead of `main`**. The still-visible `work/direct-rotation-steering` ref is historical/redundant navigation after integration and is not active work or authority. It has been fast-forwarded to the current `main` so it does not carry a competing tree. Do not reactivate it merely because the branch name exists.

## 2. Dual-mode steering foundation — accepted in source, tuning open

Owner-facing source `main` now contains:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

`X_POSITION` remains internal regression/reference only.

Evidence chain:

- exact A/B steering parent `1b25cf24...` / tree `20bf084a...` had fresh causal **80/80 PASS**;
- independently reconstructed Direct-only baseline had **63/63 PASS**;
- integration commit `4961cee4...` mechanically combines current pre-close `main` documentation with exact steering/test blobs from `1b25cf24...` and has both parents in ancestry;
- relative to the previous accepted `main`, the integration delta is limited to 15 steering/input/host/UI/test paths;
- exact `4961cee4...` passed `windows-latest` with repository-declared Node/npm, `npm ci`, and full `npm run build`; status context: `jv/integration-close-windows = success`;
- Owner regression smoke on Samsung Galaxy A53 / Chrome passed `Obrót`, `Przeciąganie`, steering+pedal multitouch, JSPREV2, fullscreen and basic UI on the exact integration candidate.

Classification:

`OWNER ACCEPTED — DUAL-MODE STEERING FOUNDATION IN SOURCE / FINAL TUNING OPEN`

This accepts integration and retention of both modes as the source foundation. It does **not** freeze:

- final Direct feel/tuning;
- final Relative-X gain curve, including current `1 -> 4` progression;
- full-lock/reversal/edge/micro-correction tuning;
- sensitivity, haptics/self-centering or final industrial design;
- vehicle steering physics or handling.

Do not collapse back to one Owner-facing mode without new Owner evidence. Tune either mode only through focused causal slices and do not mix gesture tuning with vehicle physics.

## 3. Accepted product foundation

Protect unless a focused later slice explicitly changes it:

- Plac E2R, Offroad and approved JSPREV2;
- current owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- P1.2/P1.3/P1.3.1 coordinated mobile composition, minimal persistent HUD, utility drawer, compact top actions, larger wheel presentation and steering plate default OFF/optional ON;
- dual-mode steering foundation described above;
- analog throttle/brake foundation;
- independent multitouch ownership;
- fail-closed lifecycle behavior and current D/R semantics;
- accepted Samsung Galaxy A53 / Chrome render-1x performance boundary.

The earlier X-only `POSITION` interaction remains a historical/reference baseline, not the current Owner-facing source product.

This does not freeze final pedal mapping/mechanics/design, final steering tuning/design, portrait composition, rig geometry or handling.

## 4. Owner Preview workflow — accepted operational default

Owner Preview Pages remains the normal iterative testing surface:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

Preview V2 separates executable source from preserved approved static data. It may point at accepted `main` or a scoped experimental source candidate, while JSPREV2 remains an exact separately pinned accepted static layer. The workflow verifies executable identity and clean tree, builds normally, validates all 33 scan runtime files against the accepted receipt by byte length + SHA-256, records composition provenance, then deploys.

The previous JSPREV2 Preview capability gap is closed. Accepted capabilities unrelated to the active experiment should not disappear silently from Preview. ZIP/local-Windows preview remains forensic/emergency fallback only.

The temporary full Windows integration gate used for the steering milestone has been removed after recording its PASS. `preview/owner-control` is back on the ordinary lightweight Preview workflow and currently points at accepted `main` plus the accepted JSPREV2 layer.

## 5. Friends/Public boundary

`Jozzpoly/JV-Box3D-Web-Public/main@279dd4ee...` remains the accepted Friends artifact/release authority. Its executable root is still based on `cd7f5f89...`; the new dual-mode steering source foundation has **not** been promoted to Friends/Public yet.

Do not confuse source acceptance with Friends release acceptance. A future Friends promotion is a separate explicit product/release decision.

## 6. Roadmap / work selection

There is **no active fixed P1.4 -> P2 -> P3 scheduler**. Old numbered roadmap/readiness documents are historical planning/evidence, not a current queue.

The steering structural close is complete. The strongest already-grounded next substantive control area is now:

1. **Pedal semantics grounding and falsifier design.** Current implementation is relative-from-touch displacement: pointer-down starts at semantic zero and motion is measured from `originY`. The durable Owner hypothesis is absolute pointer position inside frozen pedal acquisition geometry, without physics changes in the same slice.
2. **Pedal mechanical feedback.** Judge presentation separately from input semantics where possible.
3. **Desktop/mobile capability hygiene.** Inventory concrete useless desktop controls before hiding anything broadly.
4. **Portrait-specific composition.** Treat portrait as an intentional layout problem.
5. **Control industrial-design convergence.** Steering and pedals should gradually share one lightweight mechanical/automotive language.
6. **JURE / rig / handling.** Separate later foundations; JURE remains authored-rig authority.

Performance/scan scaling remains evidence-driven only.

This ordering is a living priority map, not an immutable stage sequence. The next work should begin with a focused pedal grounding/planning checkpoint, not immediate implementation by inertia.

## 7. Other open observations / debt

Desktop currently exposes some mobile-oriented controls/functions with no useful effect there.

Classification: `OWNER OBSERVED / NOT YET SCOPED`.

Other non-blocking debt includes the historical dependency-audit finding boundary, portable network-policy JS gap, no branch protection, Vite browser-externalization/large-chunk warnings and redundant historical branch names. Do not turn them into cleanup campaigns unless they block a selected product goal.

## 8. Fresh-agent recovery

A fresh agent should resolve live source `main`, Owner Preview V2 pointer/composition and Friends/Public `main`, then read:

`AGENTS.md -> docs/PROJECT_STATE.md -> docs/HANDOFF.md`

It should recover these truths:

- dual-mode steering is integrated and Owner-accepted as a **foundation** in source `main`;
- both `Obrót` and `Przeciąganie` remain retained and tunable;
- there is no ordinary active product lane;
- Owner Preview is the default testing surface and preserves exact JSPREV2 as a separate static layer;
- Friends/Public is a separate, older accepted artifact and does not yet include this source integration;
- the next recommended checkpoint is pedal semantics grounding, not a resumed steering integration campaign.

Do not restart old recovery/publication, Camera/Fullscreen, P1 close, steering integration, Preview JSPREV2 restoration, ZIP-preview or accepted-A53 optimization campaigns without contradictory evidence.
