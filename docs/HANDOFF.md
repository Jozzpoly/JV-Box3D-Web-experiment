# JV Web — takeover handoff

Updated: 2026-08-20
Status: `HANDOFF READY / ACTIVE STEERING A/B + JSPREV2 LIVE ON OWNER PREVIEW / RELATIVE-X OWNER FEEL OPEN / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry — do this first

1. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.
2. Resolve `work/direct-rotation-steering`.
3. Resolve `preview/owner-control` and read `preview/owner.json`.
4. Resolve live `main` of `Jozzpoly/JV-Box3D-Web-Public`.
5. Read `AGENTS.md`.
6. Read `docs/PROJECT_STATE.md`.
7. Read this handoff.
8. Reconstruct accepted, active, deployed and still-open state before any implementation.

Do not restart takeover archaeology, old recovery/publication campaigns or a numbered roadmap merely because they appear in history.

## Exact current boundary

```text
accepted source main before current docs-only descendants:
  8988dc716fd86b444e3f966edc238f16423a03c5

canonical accepted executable source for P1.2/P1.3/P1.3.1:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

owner-approved product source before final test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

active steering branch:
  work/direct-rotation-steering

active steering A/B source:
  1b25cf242a007b84f236155e6067539c825876ec

active steering A/B tree:
  20bf084af97fe0c3b780e621467c53362b779303

previous Direct-only source:
  ede95d3da814da97b54522b836f4c2ec0cddf1a7

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

accepted Friends/public artifact main:
  1b64b45b0d3c1d5cb7ccc469e98e300568580f60

accepted Friends executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2
```

Source repository is public. `main` is accepted source/product authority. `JV-Box3D-Web-Public/main` remains accepted Friends/public artifact authority. `preview/owner-control` is only the operational Preview control lane.

## Accepted baseline — preserve

P1.2/P1.3/P1.3.1 is closed and Owner-accepted within its documented scope. Canonical close on `cd7f5f89...` used Node 24.16.0 / npm 11.17.0, normal repository build and full suite **462/462 PASS**.

Owner final A53/Chrome smoke on the accepted Friends surface confirmed world/vehicle boot, steering, throttle+brake, utility drawer, steering plate default OFF with ON/OFF toggle, landscape/browser/fullscreen sanity and JSPREV2 loading.

Protect Plac E2R, Offroad, approved JSPREV2, owner vehicle, Camera Manual Rig V1, Fullscreen V1, P1.2/P1.3/P1.3.1 presentation foundation, analog pedals, multitouch/lifecycle/D-R semantics and accepted A53 render-1x performance unless a later focused slice explicitly changes them.

## Active experiment — steering A/B

The only active ordinary product work lane is:

`work/direct-rotation-steering@1b25cf242a007b84f236155e6067539c825876ec`

It is not accepted `main`.

Owner-facing modes:

- `Obrót` = `DIRECT_ROTATION`;
- `Przeciąganie` = `RELATIVE_X`.

`X_POSITION` is internal regression/reference only.

Evidence already obtained:

- exact A/B candidate tree reconstructed on live Direct parent: `20bf084af97fe0c3b780e621467c53362b779303`;
- fresh causal A/B validation: **80/80 PASS** on exact candidate bytes/tree;
- Direct-only exact source independently reconstructed and freshly validated **63/63 PASS**;
- A/B delta constrained to steering/host/UI/test scope with no physics, drivetrain, pedal, map or accepted-release spillover;
- Owner previously confirmed Direct on Samsung Galaxy A53: no grab jump, easier small corrections, steering+pedal multitouch working;
- Owner Preview exposes `Obrót / Przeciąganie` on the real Pages surface;
- after JSPREV2 parity restoration, Owner rendered evidence shows the same A/B surface with the scan loaded and the vehicle present.

Still open:

- Relative-X driving feel on A53;
- progressive gain 1 -> 4 ergonomics;
- whether both modes should remain;
- final steering acceptance;
- integration into accepted `main`.

**Do not merge, retune or replace Relative-X merely because it is deployed. The next steering decision follows Owner driving judgement.**

## Owner Preview contract — V2 layered composition

Owner Preview Pages is the default iterative testing surface:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

`preview/owner.json` now separates the exact executable source from explicitly preserved approved static layers.

Current composition:

- executable: `Jozzpoly/JV-Box3D-Web-experiment@1b25cf242a007b84f236155e6067539c825876ec`;
- JSPREV2 static layer: `Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`.

The workflow performs exact executable checkout, clean-tree verification, canonical Node/npm/dependency install, typecheck, portable build and build-identity verification. It then fetches the exact pinned scan layer, checks all 33 runtime files against the accepted Friends scan receipt using byte length + SHA-256, writes separate composition provenance and re-verifies executable identity before deploy.

The previous JSPREV2 Preview capability gap is **CLOSED**. Owner confirmed and provided rendered evidence that the real Owner Preview now loads JSPREV2 while preserving the vehicle and `Obrót / Przeciąganie` A/B controls.

Durable rule: Preview should preserve accepted capabilities unrelated to the active experiment. If an omission is deliberate, make it explicit and scoped rather than silently normalizing a degraded testing surface.

Owner explicitly accepts Pages as the normal workflow. **Do not return to ZIP/local-Windows testing as the default because of agent tooling limitations.** ZIP/local preview is forensic/emergency fallback only.

## Other open observation

### Desktop/mobile capability hygiene

Owner observed that desktop exposes some mobile-oriented functions/controls that produce no useful effect there.

Classification: `OWNER OBSERVED / NOT YET SCOPED`.

Do not apply broad CSS hiding before inventorying exact controls and intended desktop semantics.

## Ref discipline at takeover

Accepted `main` contains docs-only handoff/authority descendants after the active steering branch's merge base. Do **not** rebase or force-update the steering branch merely to make `behind=0`; preserve the exact `1b25cf24...` candidate currently tied to Owner Preview evidence. Resolve the live compare and verify that main-only descendants are documentation-only before treating branch divergence as product drift.

`preview/owner-control` remains a special permanent operational lane. Do not merge its control history into source `main` merely for symmetry.

## Closed work not to restart

Without new contradictory evidence, do not reopen:

- old recovery/publication campaigns;
- neutral-foundation validation machinery;
- Camera/Fullscreen reconstruction;
- old P1 CSS/overlay repair;
- P1.2/P1.3/P1.3.1 canonical-close/publication runners;
- accepted A53 1x optimization;
- Owner Preview JSPREV2 parity restoration;
- ZIP/local-Windows preview as normal workflow;
- speculative JURE runtime substitution.

Do not begin pedal redesign merely because steering code exists. The active steering experiment remains open until Owner judgement determines its next step.

## Takeover success criterion / next checkpoint

A fresh agent should be able to recover, without this conversation:

- accepted source/product authority;
- accepted Friends/public artifact authority;
- exact active steering source;
- Owner Preview V2 executable + static-layer composition;
- what has technical evidence versus Owner acceptance;
- that JSPREV2 parity is restored on Preview;
- that Relative-X feel remains open;
- Pages as the default Owner-testing workflow;
- desktop/mobile hygiene as a separate open item;
- closed campaigns that must not be restarted.

**Next product checkpoint: Owner driving judgement `Obrót` vs `Przeciąganie` on the current Owner Preview candidate.**

If live refs and these primary docs disagree, stop and resolve the contradiction before product work.
