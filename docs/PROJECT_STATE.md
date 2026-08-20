# JV Web — current project state

Updated: 2026-08-20
Owner: Jozz
Status: `P1.2/P1.3/P1.3.1 OWNER-ACCEPTED / DUAL-MODE STEERING OWNER-VALUED + JSPREV2 LIVE ON OWNER PREVIEW / STEERING TUNING OPEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Accepted source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

```text
canonical accepted executable source for P1.2/P1.3/P1.3.1:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

active steering branch:
  work/direct-rotation-steering

active steering source:
  1b25cf242a007b84f236155e6067539c825876ec

active steering tree:
  20bf084af97fe0c3b780e621467c53362b779303

Owner Preview control lane:
  preview/owner-control

Owner Preview control implementation:
  5a57c316a297763c7b6310712b5fd0a9469dcf96

Owner Preview executable source:
  1b25cf242a007b84f236155e6067539c825876ec

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f
  receipt: receipts/jv_friends_scan_receipt.json

Owner Preview URL:
  https://jozzpoly.github.io/JV-Box3D-Web-experiment/

accepted Friends/public artifact authority:
  Jozzpoly/JV-Box3D-Web-Public/main
  1b64b45b0d3c1d5cb7ccc469e98e300568580f60

accepted Friends executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2
```

Docs-only descendants do not inherit or replace execution evidence attached to earlier exact executable anchors.

The steering branch is intentionally ahead of accepted `main`. Preserve exact tested SHA evidence; do not rebase merely to make `behind=0` when main-only descendants are documentation-only.

## 2. Accepted product foundation

P1.2/P1.3/P1.3.1 is closed and Owner-accepted within its documented scope. Canonical Windows close on exact `cd7f5f89...` used Node 24.16.0 / npm 11.17.0, normal repository build and full suite **462/462 PASS**.

Protect unless a focused later slice explicitly changes it:

- Plac E2R, Offroad and approved JSPREV2;
- current owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- P1.2 short-landscape/lower-driving composition;
- P1.3 minimal persistent driving HUD + transient utility drawer;
- P1.3.1 compact top actions, larger physical-wheel presentation and steering plate default OFF/optional ON;
- accepted X-only analog `POSITION` reference;
- analog throttle/brake foundation;
- independent multitouch ownership;
- fail-closed lifecycle behavior and current D/R semantics;
- accepted Samsung Galaxy A53 / Chrome render-1x performance boundary.

This does not freeze final pedal mapping/mechanics/design, final steering feel/design, portrait composition, rig geometry or handling.

## 3. Steering — dual-mode direction accepted, final design open

Current Owner-facing candidate exposes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

`X_POSITION` remains internal regression/reference only.

Technical evidence on exact `1b25cf24...`:

- exact A/B tree `20bf084af97fe0c3b780e621467c53362b779303`;
- fresh causal A/B validation **80/80 PASS**;
- independently reconstructed Direct-only baseline **63/63 PASS**;
- delta constrained to steering/input/host/UI/test scope with no physics, drivetrain, pedal, map or accepted-release spillover.

Owner evidence:

- Direct Rotation was previously judged materially better than X-only for small corrections; no-jump acquisition and steering+pedal multitouch worked on Samsung Galaxy A53;
- Owner Preview exposes both modes on the real Pages surface;
- after JSPREV2 parity restoration, Owner provided rendered evidence showing the vehicle, scan and both steering modes together;
- Owner has now driven both `Obrót` and `Przeciąganie` and explicitly judges **both currently worth retaining and developing gradually**.

Classification:

`OWNER ACCEPTED — DUAL-MODE STEERING PRODUCT DIRECTION / FINAL TUNING OPEN`

This closes the earlier question of whether Relative-X has enough value to continue and whether one mode must be eliminated now. It does **not** mean final steering acceptance.

Still open:

- exact Direct Rotation feel/tuning;
- Relative-X gain curve, including whether current `1 -> 4` progression is optimal;
- full-lock/reversal, edge-grab and micro-correction tuning for both modes;
- final steering industrial design, sensitivity, haptics/self-centering decisions;
- integration of the dual-mode foundation into accepted `main`.

Do not collapse the product back to one Owner-facing mode without new Owner evidence. Tune either mode only through focused causal slices; do not mix steering feel work with vehicle physics.

## 4. Owner Preview workflow — accepted operational default

Owner Preview Pages is the normal iterative testing surface:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

Preview V2 separates executable source from preserved approved static data:

- executable: exact committed product candidate `1b25cf242a007b84f236155e6067539c825876ec`;
- static layer: exact accepted JSPREV2 from `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

The workflow verifies executable identity and clean tree, builds normally, fetches the exact scan layer, validates all 33 scan runtime files against the accepted receipt by byte length + SHA-256, records separate composition provenance, then deploys.

Owner evidence on 2026-08-20 confirms JSPREV2 loads on the real Owner Preview while the vehicle and both steering modes remain present.

Classification: `OWNER PREVIEW JSPREV2 PARITY RESTORED`.

Durable rule: accepted capabilities unrelated to the active experiment should not disappear silently from Owner Preview. A deliberate omission must be explicit and scoped.

ZIP/local-Windows preview remains forensic/emergency fallback only.

## 5. Roadmap / work selection

There is **no active fixed P1.4 -> P2 -> P3 scheduler**. The old numbered roadmap and `MOBILE_DRIVING_ROADMAP_READINESS_AUDIT_2026-08-16.md` are historical planning/evidence. Real work crossed those boundaries; P1.2/P1.3/P1.3.1 are already closed.

Current product direction is a living priority map:

1. **Close the current steering lane structurally.** Because both modes are now Owner-valued, the next structural checkpoint should integrate the exact dual-mode foundation into accepted source without pretending tuning is final. Do not open another ordinary product lane first.
2. **Pedal semantics and mechanical feedback.** This is the strongest already-grounded next control area: absolute-position pedal mapping inside stable acquisition geometry, then mechanically legible presentation, without physics changes in the same slice.
3. **Desktop/mobile capability hygiene.** Inventory concrete mobile-oriented controls that are useless on desktop and define intended desktop semantics before hiding anything broadly.
4. **Portrait-specific composition.** Treat portrait as an intentional layout problem, not scaled landscape.
5. **Control industrial-design convergence.** Steering and pedals should gradually converge on one lightweight automotive/mechanical language, with feel and appearance kept separable where possible.
6. **JURE / rig / handling.** JURE remains paused and future authored-rig authority. Rig replacement and handling work remain separate later foundations.

Performance/scan scaling work is evidence-driven only. The accepted A53 render-1x boundary is not a reason to add LOD/streaming architecture without a new measured bottleneck.

This ordering is a current recommendation, not a permanent numbered roadmap. Owner pain or new evidence may legitimately select a different small slice after the steering integration close.

## 6. Other open observations / debt

Desktop currently exposes some mobile-oriented controls/functions with no useful effect there.

Classification: `OWNER OBSERVED / NOT YET SCOPED`.

Other non-blocking debt includes the historical dependency-audit finding boundary, portable network-policy JS gap, no branch protection, Vite browser-externalization/large-chunk warnings and redundant historical branch names. Do not turn them into cleanup campaigns unless they block a selected product goal.

## 7. Handoff boundary / next checkpoint

A fresh agent must recover without conversation history:

- accepted `main` and accepted P1.2/P1.3/P1.3.1 boundary;
- exact dual-mode steering branch/source and its technical evidence;
- Owner has decided both `Obrót` and `Przeciąganie` are worth retaining and gradual development;
- this is directional acceptance, not final steering tuning/merge acceptance;
- Owner Preview V2 preserves exact JSPREV2 as a separate static layer and is the default testing surface;
- accepted Friends/public artifact authority remains separate;
- old numbered roadmap/recovery/publication campaigns are not current schedulers;
- pedals are the strongest already-grounded next substantive control area after steering lane close;
- desktop/mobile hygiene, portrait, control industrial design and later JURE/rig/handling remain separate directions.

**Next structural checkpoint: plan and validate integration of the dual-mode steering foundation into accepted `main`, preserving exact evidence and keeping tuning explicitly open.**
