# JV Web — agent operating contract

This file is the first operational authority for work in this repository. It is a guardrail, not evidence that any build or runtime passed.

## Gate 0-R — remote repository identity

Use this gate for GitHub/connector-only inspection and every remote write. Verify from current GitHub data, not from a stored report:

```text
REPOSITORY: Jozzpoly/JV-Box3D-Web-experiment
VISIBILITY: expected private
DEFAULT:    current default branch
TARGET REF: exact intended branch
TIP:        exact current 40-character commit SHA
TREE:       exact current tree SHA
OPERATION:  READ or bounded WRITE
```

Before a remote write, fetch the target ref again immediately. Create the new commit with the verified current tip as its only parent. Stop on any ref movement, identity mismatch, unexpected file scope or permission ambiguity.

Gate 0-R permits repository analysis without a local checkout. It does not permit claims about a local build, working tree or browser run.

## Gate 0-L — local execution identity

A build, test, generated artifact or local edit requires a complete checkout of this repository. Verify:

```text
PROJECT:  Jozzpoly/JV-Box3D-Web-experiment
ROOT:     git rev-parse --show-toplevel
ORIGIN:   git remote get-url origin
BRANCH:   git branch --show-current
HEAD:     git rev-parse HEAD
TREE:     git rev-parse HEAD^{tree}
STATUS:   git status --short --branch
```

Stop immediately when the repository, remote, branch, commit, tree or working-tree state is not the intended one. A laboratory, extracted model folder, native `Box3d_FunProject` checkout, temporary replay or generated artifact is never a substitute for this repository.

## Current authority and campaign

```text
preserved product base:
  product/jv-web-car-map-scan
  c8e0bf24748b0a790a1c0039b1be801eef266580
  tree 3e241761784edd2a2fb6ab18095c25ea0e737185

controlled repair line:
  repair/jv-web-release-r0
  base: exact preserved product commit above
  current tip: always verify through GitHub
```

The repair line exists to establish repository authority, an exact toolchain and a reproducible map-only static release. R0 must not change physics, vehicle controls, camera behavior, E2R terrain, scan parsing/collision or the owner vehicle model.

`main` is a minimal historical default branch, not the current product implementation. Historical and candidate branches are evidence or salvage sources only unless Jozz explicitly promotes a bounded change after fresh validation.

## Fail-closed rules

Stop the current stage when any of the following occurs:

- repository, ref, parent commit or tree differs from the declared target;
- a local source tree is dirty before a gate;
- `npm ci`, tests or a build change tracked source or `package-lock.json`;
- a tool requires deleting, resetting or overwriting unexplained state;
- an artifact cannot be reproduced from a disposable clean checkout;
- a public build requests `/__jv_scan__/` or includes private scan bytes;
- a PASS claim lacks exact commands, exit codes, environment and source/artifact identity;
- progress requires bypassing a gate, force-pushing or rewriting history.

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
- R0-A established the repair line and a navigation-only guard on historical `main`; fetch both current refs before acting.
- R0-B is closed only for the last validated predecessor `e33b226c45005016daa2775226680c3b4db6a724`, tree `91215f5da39c0a770688f2ad082e5bf5998adb7e`: two independent Windows 11 x64 runs on Node 24.16.0 / npm 11.13.0 / TypeScript 7.0.2 / Vite 8.1.5 reached 285/285 tests, 18 documentation links and byte-identical 14-file LOCAL_FULL portable artifacts. The retained external evidence ZIP has SHA-256 `65a98e8175541207c63f21b32d93b4403e3c1b46157289e5c6edeb3d65636a3e`. Linux remains outside the R0 guarantee and is not a release gate.
- The C0-CHAR tip that contains this file is `SOURCE-PRESENT / REVALIDATION REQUIRED`; it does not inherit the predecessor PASS. Its exact commit/tree must pass a fresh two-worktree Windows gate before C1.
- `00e1c8...` is not a release base; its release work is stacked on unaccepted owner-vehicle commits.
- `candidate/jv-web-owner-vehicle-visual-r1@796b050...` is frozen, broken and salvage-only.
- Twenty-one TypeScript files are compiled/tested but not statically reachable from `src/product-main.ts`; see `docs/PROJECT_STATE.md`.
- No owner-vehicle implementation, Pages activation, visibility change, custom GitHub Actions, merge or default-branch change is allowed during R0 without a separate owner decision.

## Required reading order

1. `AGENTS.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/repair/R0_WORK_ORDER.md`
5. `docs/BRANCH_ROLES.md`
6. `docs/repair/R0B_WINDOWS_EVIDENCE_2026-08-07.md`
7. `docs/repair/R0C_MAP_ONLY_ARCHITECTURE.md`
8. exact source, tests and build scripts relevant to the current stage

Use repository files and current GitHub state as evidence. Do not fill gaps from conversational memory.
