# JV Web — agent operating contract

This file is the first operational authority for work in this repository. It is a guardrail, not a substitute for Git, executable evidence, recovered source records or owner validation.

## Gate 0-R — remote identity

Before every connector/GitHub write, verify from current GitHub data:

```text
repository
target branch
exact 40-character tip
exact tree
intended operation
```

Create only bounded fast-forward descendants of the verified tip. Stop on ref movement, unexpected scope, permission ambiguity or identity mismatch. Never force-push or rewrite history as routine recovery.

## Gate 0-L — local execution identity

A local build/test/artifact claim requires a complete clean checkout and explicit verification of:

```text
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short --branch
```

Do not use an unrelated local JV/Box3D folder as a substitute for the repository named by the task.

## Current campaign scope

For the current JV-Web campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = active private core / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = public friend-demo / release artifact surface

Jozzpoly/Box3d_FunProject
  = native JV maintained by another agent and frozen for this campaign
```

Do not advance, reorganize or tune native JV unless Jozz explicitly changes scope. Reading exact native files is allowed when JV-Web needs an existing asset, semantic contract or mechanism such as `b3Wheel`.

## Canonical published R0 baseline

The first public JV Web R0 is CLOSED and must be treated as an immutable rollback/reference point:

```text
private source repository:
Jozzpoly/JV-Box3D-Web-experiment

R0 source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated public candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public repository:
Jozzpoly/JV-Box3D-Web-Public

release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604

Pages:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source release/r0 /(root)
```

Full R0 closure/evidence boundaries:
[`docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`](docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md)

Do not rebuild, amend or silently replace R0 when beginning later work. A later release is a new exact artifact with its own provenance.

## Evidence vocabulary

Keep these levels separate:

```text
SOURCE-PRESENT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED / OWNER ACCEPTED
PUBLISHED
```

A lower level never silently implies a higher one.

Historical exact evidence may remain valuable even when it does not describe current R1. Do not erase a proven older result merely because the active branch has moved.

## Active R1 development model

The active private development lane is:

```text
development/jv-web-r1
```

Always fetch its current exact tip.

Current campaign purpose: transform the proven R0 foundation into a motivating, increasingly game-like friend-demo while preserving a usable desktop/mobile build.

Current owner-directed capability goals include, adaptively ordered:

- real Jozz vehicle model;
- materially better chase camera + mobile pinch zoom;
- recovery of the proven private JSPREV2 desktop scan path and phone assessment;
- faster world-location teleportation;
- vehicle presets/settings and FWD/RWD/AWD;
- correctly defined drivetrain/shaft locking;
- selected QoL;
- rebuilt Web/mobile UI;
- Web port of newer native `b3Wheel` if the technical path is sane.

Visible presentation/UX progress is a legitimate product goal in this campaign, not only a validation aid. Social-media optimization is not yet a constraint.

Jozz's live play/feel may reorder work. Do not execute a stale roadmap mechanically.

## Private scan vs public release

The private scan is an active development capability, not forbidden R1 work.

However:

- public R0 intentionally contains no JSPREV2 bytes or requests;
- private scan bytes must never leak into a public artifact accidentally;
- future public scan publication requires an explicit asset/hosting/rights/size decision;
- private scan recovery and public scan publication are separate questions.

The strongest preserved historical desktop scan baseline is `product/jv-web-car-map-scan@c8e0bf24748...`; exact evidence details are indexed in the handoff docs.

## R0 known limitations that are NOT regressions

- public R0 deliberately has no JSPREV2 scan;
- public R0 uses synthetic/proof vehicle visuals rather than Jozz's final model;
- `legacy_ts_m6` remains a reference browser fixture, not proven native JV parity;
- build-manifest publication fields describe build-time dormant state and were not rewritten after validation;
- harmless host-level `/favicon.ico` 404;
- broader hardening/default-branch normalization/performance work deferred.

## Stop conditions

Stop and investigate when:

- work would modify published `release/r0` bytes in place;
- private scan bytes accidentally enter a public artifact;
- a new release artifact is not reproducible;
- desktop/mobile usability regresses without explicit scope and owner awareness;
- native parity/product authority is claimed without evidence;
- a release cannot be tied to exact source/artifact/rollback;
- a gate failure is being confused with a product failure;
- the process is expanding into release/foundation machinery without proportional product value.

## Fresh-agent required reading order

1. `AGENTS.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`
5. `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`
6. `docs/handoff/RECOVERED_CAR_MAP_SCAN_EVIDENCE_2026-08-05.md`
7. `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`
8. `docs/r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`
9. `docs/BRANCH_ROLES.md`
10. only exact source/tests relevant to the first revalidated R1 question

Do not begin a fresh conversation by broadly searching for resources already indexed in the handoff.
