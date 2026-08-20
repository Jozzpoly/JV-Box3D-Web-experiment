# JV Web — current project state

Updated: 2026-08-20
Owner: Jozz
Status: `P1.2/P1.3/P1.3.1 OWNER-ACCEPTED / ACTIVE STEERING A/B + JSPREV2 LIVE ON OWNER PREVIEW / RELATIVE-X OWNER FEEL OPEN / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is the compact current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Accepted source/product authority is live `main` of public repository `Jozzpoly/JV-Box3D-Web-experiment`.

```text
accepted source main before current docs-only descendants:
  8988dc716fd86b444e3f966edc238f16423a03c5

canonical accepted executable source for P1.2/P1.3/P1.3.1:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

owner-approved product source before the final test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

active steering A/B branch:
  work/direct-rotation-steering

active steering A/B source:
  1b25cf242a007b84f236155e6067539c825876ec

active steering A/B tree:
  20bf084af97fe0c3b780e621467c53362b779303

previous Direct-only steering anchor:
  ede95d3da814da97b54522b836f4c2ec0cddf1a7

Owner Preview control lane:
  preview/owner-control

Owner Preview control implementation:
  5a57c316a297763c7b6310712b5fd0a9469dcf96

Owner Preview executable pointer:
  1b25cf242a007b84f236155e6067539c825876ec

Owner Preview accepted JSPREV2 static layer:
  Jozzpoly/JV-Box3D-Web-Public
  a325c279cfe63a0607dba33c3c635a1716e09f8f
  receipts/jv_friends_scan_receipt.json

Owner Preview URL:
  https://jozzpoly.github.io/JV-Box3D-Web-experiment/

accepted Friends/public artifact authority:
  Jozzpoly/JV-Box3D-Web-Public main
  1b64b45b0d3c1d5cb7ccc469e98e300568580f60

accepted Friends executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2
```

`cd7f5f89...` remains the canonical executable-source anchor for the accepted P1.2/P1.3/P1.3.1 close. Later docs-only source commits do not inherit or replace that execution evidence.

The active steering branch is intentionally ahead of accepted `main`; it is an experiment, not accepted source authority. `preview/owner-control` is operational deployment control only and must not be treated as another product source tree.

## 2. Accepted product/release boundary — CLOSED

Canonical Windows close on exact `cd7f5f89...` used Node 24.16.0 / npm 11.17.0, `npm ci`, the normal repository `npm run build`, typecheck/docs/third-party/build checks and the full repository suite **462/462 PASS**.

The final test-only close commit added coverage for the already-existing steering-plate setting and did not change the Owner-approved product runtime source.

Owner final steady-state smoke on Samsung Galaxy A53 / Chrome confirmed on the accepted Friends surface:

- world and vehicle boot;
- steering;
- throttle + brake;
- utility drawer open/close;
- steering background/plate default OFF and OFF -> ON -> OFF;
- landscape/browser and fullscreen with no obvious regression;
- JSPREV2 loading.

This closes the P1.2/P1.3/P1.3.1 source/build/Friends-release boundary. Do not restart old recovery/publication-helper work without new contradictory evidence.

## 3. Accepted product foundation

Protect unless a later focused slice explicitly changes it:

- Plac E2R, Offroad and approved JSPREV2 on the accepted Friends surface;
- current owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- P1.2 short-landscape/lower-driving composition foundation;
- P1.3 minimal persistent driving HUD + transient utility drawer;
- P1.3.1 compact top actions, larger physical-wheel presentation and steering plate default OFF/optional ON;
- accepted X-only analog steering `POSITION` reference;
- analog throttle/brake foundation;
- independent multitouch ownership;
- fail-closed lifecycle behavior and current D/R semantics;
- accepted Samsung Galaxy A53 / Chrome render-1x performance boundary.

This is not final authority for pedal mapping/mechanics/industrial design, steering gesture/industrial design, portrait-specific composition, final rig geometry or handling.

Scoped durable Owner acceptance is in `docs/OWNER_CHECKPOINTS.md`.

## 4. Active product slice — steering A/B

One active ordinary product lane exists:

```text
work/direct-rotation-steering@1b25cf242a007b84f236155e6067539c825876ec
```

Current candidate contains two selectable steering interactions:

- `DIRECT_ROTATION` / UI label `Obrót` — realistic rigid-wheel manipulation and current stronger experimental baseline;
- `RELATIVE_X` / UI label `Przeciąganie` — intention-oriented horizontal relative drag with progressive gain from 1 near center toward 4 at lock.

`X_POSITION` remains an internal regression/reference mode, not an Owner-facing A/B choice.

Technical evidence for the committed A/B tree:

- exact reconstruction on the live Direct parent produced tree `20bf084af97fe0c3b780e621467c53362b779303`;
- fresh causal auxiliary validation: **80/80 PASS** on the exact candidate bytes/tree;
- Direct-only source was independently reconstructed to live tree and freshly validated **63/63 PASS**;
- A/B delta was verified as the intended steering/host/UI/test scope with no physics, drivetrain, pedal, map or accepted-release spillover.

Owner evidence:

- Direct Rotation was previously tested on Samsung Galaxy A53 and judged materially better than X-only for small corrections, with correct no-jump grab behavior and working steering+pedal multitouch;
- current Owner Preview visibly exposes and switches `Obrót / Przeciąganie`, proving the A/B candidate is live on the real Owner surface;
- after Preview parity restoration, Owner provided rendered evidence showing the same A/B surface with JSPREV2 loaded and the vehicle present.

Still **NOT VALIDATED / NOT ACCEPTED**:

- Relative-X driving feel on the A53;
- whether progressive gain 1 -> 4 is ergonomically correct;
- whether both modes should remain in the product;
- final steering milestone acceptance;
- integration of this steering experiment into accepted `main`.

Do not merge or tune Relative-X merely because it is deployed. The next product decision must follow real Owner driving judgement.

## 5. Owner Preview workflow — ACCEPTED OPERATIONAL DEFAULT / JSPREV2 PARITY RESTORED

Owner Preview Pages is the normal iterative testing surface for JV-Web:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

The permanent `preview/owner-control` lane contains the deployment workflow and `preview/owner.json` composition pointer.

Current V2 Preview composition keeps two authorities separate:

- executable layer: exact committed product candidate `1b25cf242a007b84f236155e6067539c825876ec`;
- preserved static layer: exact accepted JSPREV2 from `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

The workflow checks out the exact executable SHA, verifies a clean tree, installs canonical Node/npm/dependencies, runs typecheck and `build:portable`, verifies build identity, then fetches the exact pinned JSPREV2 layer. Before deploy it verifies all 33 scan runtime files against the accepted Friends scan receipt by byte length and SHA-256, writes `owner-preview-composition.json` with separate executable/static provenance and re-verifies that executable identity did not change.

Foundation evidence already established:

- valid candidate deployment succeeds;
- syntactically valid nonexistent source SHA fails closed before artifact/deploy;
- previous live Preview remains available after a failed candidate;
- recovery to a known-good source succeeds;
- Owner Preview composition now preserves the accepted JSPREV2 without changing steering/product source;
- Owner rendered evidence on 2026-08-20 shows `Skan JSPREV2` active, the photogrammetry world rendered, the vehicle present and `Obrót / Przeciąganie` still visible on the real Owner Preview surface.

Classification: `OWNER PREVIEW JSPREV2 PARITY RESTORED`.

This closes the previous Preview capability gap. It does **not** create new acceptance for steering feel, universal scan performance or other devices beyond the evidence actually observed.

Owner explicitly accepts Pages as the default working loop. ZIP/local-Windows preview is forensic/emergency fallback only and must not become the normal workflow because of agent tooling limitations.

Durable Preview rule: accepted capabilities unrelated to the active experiment should not disappear silently. If a Preview intentionally omits one, the omission must be explicit and scoped as an open capability gap.

## 6. Other open observations — not active implementation

Owner observed that desktop currently exposes some mobile-oriented controls/functions that have no useful visible effect there.

Classification: `OWNER OBSERVED / NOT YET SCOPED`.

Do not apply broad CSS hiding or redesign before first inventorying the exact controls and deciding intended desktop semantics. Treat this as a future small desktop/mobile capability-hygiene slice, not part of the current steering decision.

Other known non-blocking debt:

- latest canonical install reported one high-severity dependency finding; older attribution to dev-only `nanoid` is historical, not freshly re-proven for `cd7f5f89...`;
- portable network-policy proof does not formally cover arbitrary JavaScript network behavior;
- branch protection is not enabled;
- existing Vite `box3d.js` browser-externalization warning;
- existing >500 kB main-chunk warning;
- redundant historical branch names.

Do not turn these into open-ended cleanup campaigns unless they block a selected product goal.

## 7. JURE boundary

JURE remains future Owner-authored rig authority; JV Web remains browser/runtime physics, controls and rendering authority. Current procedural M6 geometry must not be silently upgraded into authored neutral truth.

Never splice exact/JURE-authored hardpoints into an incompatible procedural mechanism. Use `docs/contracts/JURE_CONSUMER_BOUNDARY.md` when JURE work becomes active.

JURE is paused for this handoff.

## 8. Handoff boundary / next decision

The product is handoff-ready **with an active open steering experiment**.

A fresh agent must recover these distinctions without conversation history:

- accepted `main` and accepted P1.2/P1.3/P1.3.1 boundary;
- active steering A/B branch and exact executable source;
- Owner Preview V2 composition pointer and Pages role;
- JSPREV2 parity is restored on Owner Preview through an exact accepted static layer, not by changing product source;
- accepted Friends/public artifact authority remains separate;
- Relative-X Owner feel and final steering decision remain open;
- desktop/mobile no-op observation is open and unscoped;
- old recovery/publication campaigns are closed.

The next product checkpoint is Owner driving judgement of `Obrót` versus `Przeciąganie` on the current Preview candidate. Do not start pedal redesign, merge steering or change physics before that judgement.
