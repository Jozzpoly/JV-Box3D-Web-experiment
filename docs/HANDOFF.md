# JV Web — takeover handoff

Updated: 2026-08-20
Status: `HANDOFF READY / ACTIVE STEERING A/B LIVE ON OWNER PREVIEW / RELATIVE-X OWNER FEEL OPEN / JURE PAUSED`

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
accepted source main before the docs-only authority close:
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

Owner Preview pointer:
  1b25cf242a007b84f236155e6067539c825876ec

Owner Preview URL:
  https://jozzpoly.github.io/JV-Box3D-Web-experiment/

accepted Friends/public artifact main:
  1b64b45b0d3c1d5cb7ccc469e98e300568580f60

accepted Friends executable promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2
```

Source repository is now public. `main` is accepted source/product authority. `JV-Box3D-Web-Public/main` remains accepted Friends/public artifact authority. `preview/owner-control` is only the operational Preview control lane.

## Accepted baseline — preserve

P1.2/P1.3/P1.3.1 is closed and Owner-accepted within its documented scope. Canonical close on `cd7f5f89...` used Node 24.16.0 / npm 11.17.0, normal repository build and full suite **462/462 PASS**.

Owner final A53/Chrome smoke on the accepted Friends surface confirmed world/vehicle boot, steering, throttle+brake, utility drawer, steering plate default OFF with ON/OFF toggle, landscape/browser/fullscreen sanity and JSPREV2 loading.

Protect Plac E2R, Offroad, approved JSPREV2 on the Friends surface, owner vehicle, Camera Manual Rig V1, Fullscreen V1, P1.2/P1.3/P1.3.1 presentation foundation, analog pedals, multitouch/lifecycle/D-R semantics and accepted A53 render-1x performance unless a later focused slice explicitly changes them.

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
- Owner currently confirms the real Pages surface exposes and switches `Obrót / Przeciąganie`.

Still open:

- Relative-X driving feel on A53;
- progressive gain 1 -> 4 ergonomics;
- whether both modes should remain;
- final steering acceptance;
- integration into accepted `main`.

**Do not merge, retune or replace Relative-X merely because it is deployed. The next steering decision follows Owner driving judgement.**

## Owner Preview contract

Owner Preview Pages is the default iterative testing surface:

`https://jozzpoly.github.io/JV-Box3D-Web-experiment/`

`preview/owner.json` points to one exact committed source candidate. The Pages workflow performs exact checkout, clean-tree verification, canonical Node/npm/dependency install, typecheck, portable build and build-identity verification before deploy.

Foundation behavior already proven: valid deploy, fail-closed invalid SHA with no replacement deploy, previous live Preview retained, recovery succeeds.

Owner explicitly accepts Pages as the normal workflow. **Do not return to ZIP/local-Windows testing as the default because of agent tooling limitations.** ZIP/local preview is forensic/emergency fallback only.

## Open capability gaps / observations

### JSPREV2 on Owner Preview

Owner confirmed JSPREV2 is still unavailable in the current portable Owner Preview build.

Classification: `IMPORTANT OPEN PREVIEW CAPABILITY GAP / NOT A STEERING BLOCKER`.

Do not interpret this as a regression of the accepted Friends surface, where JSPREV2 remains accepted and previously Owner-validated.

### Desktop/mobile capability hygiene

Owner observed that desktop exposes some mobile-oriented functions/controls that produce no useful effect there.

Classification: `OWNER OBSERVED / NOT YET SCOPED`.

Do not apply broad CSS hiding before inventorying exact controls and intended desktop semantics.

## Ref discipline at takeover

After the docs-only authority correction, accepted `main` may be one docs-only commit ahead of the active steering branch's merge base. Do **not** rebase or force-update the steering branch merely to make `behind=0`; preserve the exact `1b25cf24...` candidate currently tied to Owner Preview evidence.

`preview/owner-control` remains a special permanent operational lane. Do not merge its control history into source `main` merely for symmetry.

## Closed work not to restart

Without new contradictory evidence, do not reopen:

- old recovery/publication campaigns;
- neutral-foundation validation machinery;
- Camera/Fullscreen reconstruction;
- old P1 CSS/overlay repair;
- P1.2/P1.3/P1.3.1 canonical-close/publication runners;
- accepted A53 1x optimization;
- ZIP/local-Windows preview as normal workflow;
- speculative JURE runtime substitution.

Do not begin pedal redesign merely because steering code exists. The active steering experiment remains open until Owner judgement determines its next step.

## Takeover success criterion

A fresh agent should be able to recover, without this conversation:

- accepted source/product authority;
- accepted Friends/public artifact authority;
- exact active steering source and Preview pointer;
- what has technical evidence versus Owner acceptance;
- that Relative-X feel remains open;
- Pages as the default Owner-testing workflow;
- JSPREV2 Preview and desktop/mobile hygiene as separate open items;
- closed campaigns that must not be restarted.

If live refs and these primary docs disagree, stop and resolve the contradiction before product work.
