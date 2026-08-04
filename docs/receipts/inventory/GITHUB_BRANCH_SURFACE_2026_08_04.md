# GitHub branch surface inventory — 2026-08-04

Status: `COMPLETE VISIBLE-BRANCH ENUMERATION / OWNER REF POLICY REQUIRED`
Repository visibility during inventory: `PRIVATE`

## Method

The GitHub branch search endpoint was queried without a name filter. Sixteen branch refs were returned in one page. Known PR metadata and direct Git compare results were used to classify each ref.

No branch was created, moved, deleted or renamed.

Exact orphan-tip commits are intentionally omitted from this future-public document. They belong only in the ignored private recovery receipt created with the verified Git bundle. Publishing an exact dangling-object identifier could weaken later ref-removal privacy.

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

These branches are already represented by collaboration surfaces if the repository becomes public. Deleting a PR-backed branch does not erase its pull-request discussion.

## Default branch

```text
branch: main
current role: stale private landing branch
```

At the measured checkpoint, the active candidate was a pure descendant of `main` with zero commits behind. Exact identities remain in the local integration proof and final owner receipt; ancestry must be remeasured immediately before any approved fast-forward.

## Orphan ref A — F3 regression snapshot

```text
branch: agent/f3-regression-snapshot-2026-08-03
relative to main at measurement: 87 commits ahead, 0 behind
relative to clean lineage at measurement: 7 unique snapshot commits
PR: none
exact tip: private recovery receipt only
```

The tip workflow:

- edits TypeScript source through an inline Python replacement script;
- configures a validation-bot identity;
- commits generated source changes;
- pushes to another source branch;
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

1. create a private, hash-pinned Git bundle containing the exact ref;
2. verify exact list-heads and recovery in a separate private location;
3. keep exact commit identities only in ignored/private evidence;
4. after explicit Jozz approval, optionally delete only this remote ref before visibility;
5. never merge or cherry-pick the self-modifying workflow into the candidate.

## Orphan ref B — terrain scan integration

```text
branch: agent/terrain-scan-integration
relative to main at measurement: 136 commits ahead, 0 behind
merge base at measurement: main checkpoint
PR: none
exact tip: private recovery receipt only
```

Current tip surface includes:

- its own root MIT license;
- a manual-dispatch custom workflow;
- `npm install` cloud build rather than locked `npm ci`;
- an old TypeScript M6/parity implementation;
- terrain scan/collision laboratory code;
- placeholder asset directories;
- an asset synchronizer.

The synchronizer can:

- search the local filesystem structurally for native JV;
- use native-root/source-ref environment variables;
- log the resolved local native root;
- copy owner-authored glTF assets into a public asset directory;
- copy a local M6 session JSON into the public tree;
- download assets from a separate project repository;
- label generated provenance as a local working tree.

The current branch tip exposes placeholder READMEs rather than committed binary scan assets, but its 136-commit history has not yet been independently classified for deleted models, sessions, captures, local paths or asset rights.

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

1. create a private, hash-pinned Git bundle or dedicated private archive repository;
2. inventory every unique object and asset in the 136-commit history;
3. preserve durable terrain findings only after rights/privacy review;
4. do not merge the branch into JV Web;
5. after explicit Jozz approval and verified private recovery, optionally delete only this remote ref before visibility;
6. future scene/scan work uses the current scene-package contract, not this branch implementation.

## Ref deletion is not a purge

Deleting a remote branch reduces the visible ref surface but is not proof that every underlying Git object has been immediately purged from hosting infrastructure.

Therefore:

- exact orphan commits are not published in current public-facing documentation;
- a focused unique-history audit is required before deciding that ref deletion is sufficient;
- if a real secret, private capture, personal data or unlicensed asset is found, branch deletion alone is insufficient;
- remediation may require history rewriting, migration to a sanitized public repository, credential rotation and/or hosting-provider purge/support procedures;
- the exact remedy depends on the finding and requires Jozz approval.

The assistant must not:

- delete either orphan ref;
- force-update it;
- rewrite its history;
- move it to the active candidate;
- create a separate archive repository without owner approval.

Correct order:

```text
focused unique-history audit
→ exact private ref receipt
→ private recovery artifact
→ recovery verification
→ owner decision
→ appropriate remediation/ref policy
→ fetch/prune and all audits again
```

## Public-source verdict

```text
16 visible branches enumerated
13 mapped to PRs
1 default branch
2 orphan research/snapshot refs
orphan refs source-public classification: BLOCKED
exact orphan tips publicized: NO
private recovery artifact created: NO
SOURCE-PUBLIC-READY: NOT PROVEN
```

The active candidate can become a clean public default branch only after the entire public ref surface is accepted or deliberately reduced with verified private recovery, focused history evidence and Jozz approval.
