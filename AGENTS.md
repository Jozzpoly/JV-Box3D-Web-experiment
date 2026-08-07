# JV Web — agent operating contract

This file is the first operational authority for work in this repository. It is a guardrail, not a substitute for Git, executable tests, external evidence or owner validation.

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

## Canonical published R0 baseline

The first public JV Web R0 is CLOSED and must be treated as an immutable rollback/reference point:

```text
private source repository:
  Jozzpoly/JV-Box3D-Web-experiment

R0 source commit:
  5ba6cc406b8c1541e29cd1ae59ffed78a7509284

R0 source tree:
  08314a0182a38bbcd106e984dde73e737a1a13e7

validated public candidate ZIP SHA-256:
  f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public repository:
  Jozzpoly/JV-Box3D-Web-Public

public release branch:
  release/r0

public release commit:
  c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

public release tree:
  f1c5c9a971208d89da05143f10913891a58b3b70

previous public rollback commit:
  401068f5734c841d43907b71484bc03a2396c604

Pages:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/
  source release/r0 /(root)
```

Full closure and evidence boundaries are recorded in
[`docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`](docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md).

Do not rebuild, amend, rewrite or silently replace R0 when beginning later work. A later release must be a new exact artifact with its own provenance.

## Evidence vocabulary

Keep these levels separate:

```text
SOURCE-PRESENT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

For R0, all six levels exist, but not for every possible feature. In particular:

- public MAP_ONLY_R0 is published and owner-accepted;
- the private JSPREV2/local-full mode is not part of the public R0;
- `legacy_ts_m6` remains a reference browser fixture, not proven native JV parity;
- real owner chassis/wheels/models are not yet the public R0 vehicle.

## Post-R0 development model

`repair/jv-web-release-r0` is no longer the active product-development lane. It is the closed release/foundation history for R0.

The next active private development line is:

```text
development/jv-web-r1
```

It starts from the post-R0 grounding checkpoint. Fetch its current exact tip before doing work.

The first purpose of R1 is not to add random features. It is to transform the proven R0 demonstrator into the intended JV product systematically while preserving a continuously usable browser build.

### R1 priorities

1. preserve the published R0 rollback and release reproducibility;
2. establish the intended real vehicle visual/chassis/wheel path;
3. separate demonstrator/reference mechanics from future product authority;
4. keep desktop and mobile controls continuously usable;
5. improve presentation/UX only where it supports product validation;
6. treat local JSPREV2 and other private data as separate capabilities until publication rights/hosting are explicit.

## R0 known limitations that are NOT regressions

- public R0 deliberately contains no JSPREV2 scan capability or scan requests;
- public R0 uses the synthetic M6 proof visual rather than Jozz's intended final models;
- `runtimeBackend.id = legacy_ts_m6`, `productPhysicsAuthority = false`, `nativeParity = NOT_PROVEN`;
- the public build manifest contains build-time publication fields (`DORMANT`, `publicReady:false`, etc.) that were intentionally not rewritten after validation because doing so would change the validated artifact;
- the live page currently causes a harmless host-level `/favicon.ico` 404;
- public branch protection/default-branch normalization and broader security/performance hardening remain deferred.

These items may become future tasks, but none invalidates R0.

## Stop conditions for new development

Stop and investigate when:

- work would modify the already-published `release/r0` bytes in place;
- a change accidentally introduces JSPREV2/private bytes into a public artifact;
- a new artifact is not reproducible;
- desktop/mobile controls regress without explicit scope and owner awareness;
- a claim of native parity/product authority appears without evidence;
- a later release cannot be tied to exact source, artifact hashes and rollback.

## Required reading order

1. `AGENTS.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`
5. `docs/BRANCH_ROLES.md`
6. exact source/tests relevant to the current R1 task

Historical R0 work orders remain useful for provenance, but they are no longer the active development plan.
