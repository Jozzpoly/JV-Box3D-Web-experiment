# GitHub branch surface inventory — 2026-08-04

Status: `COMPLETE VISIBLE-BRANCH ENUMERATION / OWNER REF POLICY REQUIRED`
Repository visibility during inventory: `PRIVATE`

## Method

The GitHub branch search endpoint was queried without a name filter. Sixteen branch refs were returned in one page. Known PR metadata and direct Git compare results were used to classify each ref.

No branch was created, moved, deleted or renamed.

## Complete observed branch list

```text
agent/bootstrap-web-poc
agent/clean-browser-core
agent/current-m6-topology
agent/f3-regression-snapshot-2026-08-03
agent/f5-dynamic-steering-validation
agent/f5-minimal-drive
agent/f5-visual-observer
agent/fundamental-audit-rebuild
agent/jv-web-demonstrator-foundation
agent/jv-web-refoundation
agent/jv-web-runtime
agent/native-factory-receipt
agent/physical-rate-steering
agent/terrain-scan-integration
agent/typed-box3d-boundary
main
```

## PR-backed branch classification

| Branch | PR | Classification |
|---|---:|---|
| `agent/bootstrap-web-poc` | #1 | quarantined historical prototype |
| `agent/fundamental-audit-rebuild` | #2 | superseded foundation recovery |
| `agent/clean-browser-core` | #4 | historical F1 checkpoint |
| `agent/typed-box3d-boundary` | #6 | historical F2 checkpoint |
| `agent/jv-web-runtime` | #8 | closed quarantined failed experiment |
| `agent/native-factory-receipt` | #9 | historical F3 checkpoint |
| `agent/current-m6-topology` | #11 | historical F4 checkpoint |
| `agent/physical-rate-steering` | #13 | F5 steering research |
| `agent/f5-visual-observer` | #14 | visual observer checkpoint |
| `agent/f5-minimal-drive` | #15 | legacy drive fixture with erratum |
| `agent/f5-dynamic-steering-validation` | #16 | dynamic steering measurement |
| `agent/jv-web-refoundation` | #17 | architecture authority |
| `agent/jv-web-demonstrator-foundation` | #18 | active source-public/package candidate |

These branches are already represented by public collaboration surfaces if the repository becomes public. Deleting a branch does not erase a PR discussion. Their bodies/comments still require the classification map in `docs/PUBLIC_COLLABORATION_HISTORY.md`.

## Default branch

```text
branch: main
observed tip checkpoint: 5c64903d753f893adc42be90e0c3d8053a95a922
current role: stale private landing branch
```

At the measured checkpoint, the active candidate was a pure descendant of `main` with zero commits behind. Final ancestry must be remeasured before any owner-approved fast-forward.

## Orphan ref A — F3 regression snapshot

```text
branch: agent/f3-regression-snapshot-2026-08-03
tip: d583d3f573300335446b1b1f99fdd8ce29d2e7df
relative to main: 87 commits ahead, 0 behind
relative to current candidate at measured checkpoint: diverged; 7 unique snapshot commits
PR: none
```

The tip commit modifies `f3-sync-and-validate.yml`. The workflow:

- edits TypeScript source through an inline Python replacement script;
- configures `JV F3 Validation Bot`;
- commits generated source changes;
- pushes to `agent/native-factory-receipt`;
- also commits validation receipts.

This is the exact self-modifying validation pattern rejected by refoundation.

Classification:

```text
UNMERGED REGRESSION SNAPSHOT
SELF-MODIFYING/WRITE-CAPABLE WORKFLOW ERA
NOT ACTIVE INSTRUCTION
NO PUBLIC PR CONTEXT
PUBLIC REF REVIEW BLOCKER
```

Recommendation:

1. create a private, hash-pinned Git bundle or private archive receipt containing the exact ref;
2. verify the bundle can list and recover tip `d583d3f...`;
3. keep the receipt in the private project memory, not the public package;
4. after explicit Jozz approval, delete only this remote ref before repository visibility changes;
5. never merge or cherry-pick the self-modifying workflow into the candidate.

## Orphan ref B — terrain scan integration

```text
branch: agent/terrain-scan-integration
tip: 9c4172fead575a85d4d47466a4b5194cc5612c57
relative to main: 136 commits ahead, 0 behind
merge base: exact main checkpoint
PR: none
```

Current tip surface includes:

- its own root MIT license;
- `.github/workflows/build.yml` with manual `workflow_dispatch`;
- `npm install` cloud build rather than locked `npm ci`;
- an old TypeScript M6/parity implementation;
- terrain scan/collision laboratory code;
- placeholder asset directories;
- `tools/sync-jv-assets.mjs`.

The synchronizer can:

- search the local filesystem structurally for native JV;
- use `JV_NATIVE_ROOT` and `JV_SOURCE_REF` environment variables;
- log the resolved local native root;
- copy owner-authored glTF assets into `public/assets/`;
- copy local `build/jozz_vehicle_m6_session.json` into the public tree;
- download assets from `Jozzpoly/Box3d_FunProject`;
- label generated provenance as `local-working-tree`.

The current branch tip exposes placeholder READMEs rather than committed binary scan assets, but the 136-commit history has not yet been independently classified for deleted models, sessions, captures, local paths or asset rights.

The branch's own memory describes it as a disposable browser research host that should not be migrated file-for-file.

Classification:

```text
UNMERGED TERRAIN/ASSET RESEARCH LINE
DUPLICATE NON-AUTHORITATIVE VEHICLE IMPLEMENTATION
LOCAL ASSET/SESSION BRIDGE
CUSTOM WORKFLOW PRESENT
136-COMMIT RIGHTS/PRIVACY HISTORY NOT YET CLASSIFIED
PUBLIC REF REVIEW BLOCKER
```

Recommendation:

1. create a private, hash-pinned Git bundle or dedicated private archive repository containing the exact ref;
2. inventory every object and asset in its 136-commit history;
3. preserve durable terrain findings as documentation/receipts only after rights/privacy review;
4. do not merge the branch into JV Web;
5. after explicit Jozz approval and verified private recovery, delete only this remote ref before public visibility;
6. future scene/scan work uses `SCENE_PACKAGE_CONTRACT_PL.md`, not this branch implementation.

## Why ref deletion is not automatic

Deleting a remote branch is an owner-controlled destructive visibility decision. It can reduce the public branch surface but may make unique research history less convenient to recover.

Therefore the assistant must not:

- delete either orphan ref;
- force-update it;
- rewrite its history;
- move it to the active candidate;
- create a new archive repository without owner approval.

The correct order is:

```text
exact ref receipt
→ private recovery artifact
→ recovery verification
→ owner decision
→ optional remote-ref deletion
→ fetch/prune and all-refs audit again
```

## Public-source verdict

```text
16 visible branches enumerated
13 mapped to PRs
1 default branch
2 orphan research/snapshot refs
orphan refs source-public classification: BLOCKED
SOURCE-PUBLIC-READY: NOT PROVEN
```

The active candidate can become a clean public default branch only after the entire public ref surface is either accepted or deliberately reduced with verified private recovery and Jozz approval.
