# JV Web — agent operating contract

This file is the first operational authority for work in this repository. It is a guardrail, not evidence that any build or runtime passed.

## Gate 0 — establish the physical project identity

Before analysis, edits, tests or GitHub writes, print and verify:

```text
PROJECT:  Jozzpoly/JV-Box3D-Web-experiment
ROOT:     git rev-parse --show-toplevel
ORIGIN:   git remote get-url origin
BRANCH:   git branch --show-current
HEAD:     git rev-parse HEAD
STATUS:   git status --short --branch
```

Stop immediately when the repository, remote, branch, commit or working-tree state is not the intended one. A laboratory, extracted model folder, native `Box3d_FunProject` checkout, temporary replay or generated artifact is never a substitute for this repository.

## Current authority and campaign

```text
preserved product base:
  product/jv-web-car-map-scan
  c8e0bf24748b0a790a1c0039b1be801eef266580
  tree 3e241761784edd2a2fb6ab18095c25ea0e737185

controlled repair line:
  repair/jv-web-release-r0
  must descend directly from the preserved product base
```

The repair line exists to establish repository authority, an exact toolchain and a reproducible map-only static release. R0 must not change physics, vehicle controls, camera behavior, E2R terrain, scan parsing/collision or the owner vehicle model.

`main` is a minimal historical default branch, not the current product implementation. Historical and candidate branches are evidence or salvage sources only unless Jozz explicitly promotes a bounded change after fresh validation.

## Fail-closed rules

Stop the current stage when any of the following occurs:

- branch or HEAD differs from the declared target;
- the source tree is dirty before a gate;
- `npm ci`, tests or a build change tracked source or `package-lock.json`;
- an artifact cannot be reproduced from a clean checkout;
- a public build requests `/__jv_scan__/` or includes private scan bytes;
- a PASS claim lacks an exact command, exit code, environment and source/artifact identity;
- progress requires bypassing a gate, force-pushing, resetting or cleaning away unexplained state.

Never use `git reset --hard`, `git clean`, force-push, forced worktree removal or history rewriting as routine recovery. Preserve evidence and report the blocker.

## Evidence vocabulary

Keep these levels separate:

```text
SOURCE-PRESENT       code or documents exist
SOURCE-GATE PASS     exact automated source checks passed
ARTIFACT-GATE PASS   exact generated payload passed its checks
RUNTIME OBSERVED     exact build ran in a named browser/device
OWNER ACCEPTED       Jozz accepted the named behavior on the exact build
PUBLISHED            the exact artifact is reachable at the recorded URL
```

A lower level never implies a higher one. Documents and historical PR descriptions are not executable evidence.

## Current boundaries

- The strongest preserved product base is `c8e0bf...`; it is not a proven public release.
- The exact Node/npm decision is pending controlled comparison in R0-B. Do not call a Node 22 or TypeScript 5.8 auxiliary run canonical.
- `00e1c8...` is not a release base; its release work is stacked on unaccepted owner-vehicle commits.
- `candidate/jv-web-owner-vehicle-visual-r1@796b050...` is frozen, broken and salvage-only.
- Twenty-one TypeScript files are compiled/tested but not statically reachable from `src/product-main.ts`; see `docs/PROJECT_STATE.md`.
- No owner-vehicle implementation, Pages activation, visibility change, custom GitHub Actions, merge or default-branch change is allowed during R0 without a separate owner decision.

## Required reading order

1. `AGENTS.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/BRANCH_ROLES.md`
5. the exact source, tests and build scripts relevant to the current stage

Use repository files and current GitHub state as evidence. Do not fill gaps from conversational memory.
