# GitHub cloud-surface inventory — 2026-08-04

Status: `PARTIAL INVENTORY / SOURCE-PUBLIC-READY NOT PROVEN`
Repository visibility during audit: `PRIVATE`

## Scope

This receipt records accessible GitHub collaboration and Actions surfaces that may become visible or relevant when the repository becomes public.

It is not an exhaustive scan of every raw workflow log, repository setting or GitHub product surface. Unavailable surfaces remain explicit blockers/review items.

## Pull requests and issues

Inspected:

- recent/open/closed PR bodies and available top-level comments;
- open issue #12;
- closed milestone issues #3, #5, #7 and #10;
- formal reviews and inline review threads for PR #1, #15, #17 and #18.

Findings:

- no obvious credential/token was observed in the available bodies/comments;
- no formal reviews or inline review threads exist on PR #1, #15, #17 or #18;
- PR #15 contained a now-invalid `maxDriveSpeed = 40 m/s` interpretation;
- a prominent historical erratum was added to PR #15;
- issue #12 was marked as historical RATE research rather than the current product roadmap;
- historical issues link to documents that are now archived or superseded;
- PR #1 remains explicitly quarantined;
- closing a PR/issue would not hide its public content.

This was a targeted metadata review, not a cryptographic proof that every historical comment is safe.

## Historical project license surface

PR #1 / branch `agent/bootstrap-web-poc` contains:

```text
MIT License
Copyright (c) 2026 Jozz Vehicle contributors
```

The current demonstrator candidate still has no root project `LICENSE` on `HEAD`.

Consequence:

- public licensing must classify reachable historical MIT text;
- choosing a conflicting current license without a ref/history strategy would create ambiguity;
- `THIRD_PARTY_NOTICES.md` does not license JV code or assets;
- nested vendor licenses never satisfy the root project-license requirement.

A separate reachable-license inventory scans exact Git blobs and classifies root project licenses, third-party notices and nested vendor licenses independently.

## Actions run 30816077386 — `audit-box3d-js-source`

```text
job: 91694046725
conclusion: success
permissions: contents: read
artifact: 8856776966
artifact name: box3d-js-0.0.2-source-receipt
artifact size: 7,872,623 bytes
artifact digest: sha256:1e6d198dcdb9b9bde45cd6a5142b28d47c7ff96473c99e74880aee5c5918f884
created: 2026-08-03T13:02:15Z
expires: 2026-09-02T13:02:13Z
```

Workflow source shows that the artifact path was only:

```text
audit/
```

The workflow did not checkout JV Web. It generated:

- npm metadata for `box3d.js@0.0.2`;
- the public npm tarball and unpacked package;
- a clone of the public binding repository;
- its public Box3D submodule;
- source/build/hash receipts.

### Byte-level ZIP review

The artifact ZIP was downloaded through the GitHub artifact endpoint and inspected without executing its contents or extracting it into the repository.

```text
observed ZIP bytes:          7,872,623
observed ZIP SHA-256:        1e6d198dcdb9b9bde45cd6a5142b28d47c7ff96473c99e74880aee5c5918f884
entries:                     499
uncompressed payload bytes:  21,680,214
compression ratio:           2.79
unsafe/escaping paths:       0
symlink entries:             0
duplicate entry names:       0
sensitive filenames:         0
secret-pattern findings:     0
```

The observed ZIP hash exactly matches GitHub's artifact digest.

The archive contained only the expected roots:

```text
binding-source/
package-unpacked/
box3d.js-0.0.2.tgz
npm-view.json
npm-pack.json
source-receipt.txt
tarball.sha256
engine-source-tree.sha256
```

Specific negative checks found no archive entry or text match for:

```text
.git/
.github/
.env
JV-Box3D
Jozz
C:\ or C:/ local paths
/home/runner
GITHUB_TOKEN
```

All text-like outer ZIP files and the nested npm tarball were scanned up to the full observed file sizes; no file exceeded the 2 MiB text-scan ceiling and no credential/token signature was found.

Two privacy-review matches were manually classified as public upstream metadata:

- a documentation/example path in vendored Sokol source;
- the published npm maintainer e-mail in `npm-view.json`.

They are not Jozz/JV Web data and are expected parts of the public upstream provenance artifact.

Risk classification:

```text
BYTE-REVIEWED
HASH MATCH
NO JV WEB CHECKOUT OR OWNER DATA OBSERVED
NO SECRET OR UNSAFE-ARCHIVE FINDING
PUBLIC UPSTREAM PROVENANCE ONLY
```

This finding is limited to the exact artifact digest above. A different artifact requires a new review.

## Actions run 30855702375 — F3 validation

```text
job: 91826090330
conclusion: success
steps: checkout, Node 24, npm ci, typecheck/tests, build, browser receipt
artifacts: none
```

No downloadable workflow artifact is currently listed for this run.

## Actions run 30858244976 — F4 validation

```text
job: 91834173347
conclusion: success
steps: checkout, Node 24, npm ci, typecheck/tests, build, current M6 browser lifecycle smoke
artifacts: none
```

No downloadable workflow artifact is currently listed for this run.

## Historical F2 write-capable workflow

The historical `f2-lock-and-validate` workflow used:

```text
workflow_dispatch
permissions: contents: write
```

It generated and pushed:

- `package-lock.json`;
- `F2_NODE24_VALIDATION.md`;
- `F2_BROWSER_SMOKE.json`.

It configured a bot identity and pushed to `agent/typed-box3d-boundary`.

This behavior is historical and explicitly rejected for current work. Refoundation removed the one-shot write-capable workflow from the active tree. No current custom workflow is allowed to mutate source branches.

## Current repository metadata

Observed through the GitHub repository API during this audit:

```text
visibility: private
default branch: main
archived: false
auto-merge: disabled
allow merge commit: true
allow squash merge: true
allow rebase merge: true
allow update branch: false
```

No setting was changed. The stale `main` landing surface remains a source-public blocker until Jozz approves an exact integration/default-branch plan.

Current code search returned no active `workflow_dispatch` occurrence on the indexed candidate state. This supports, but does not by itself prove, that no custom dispatch workflow remains in the intended public tree. The local Git tree audit remains authoritative for the exact candidate.

## Pages distinction

No Pages publication is active.

Future Pages may use GitHub's unavoidable system deployment after explicit owner approval. This is distinct from adding custom cloud build/test/deploy workflows. The intended publishing branch contains generated static output only and is created from an already locally validated artifact.

## Surfaces not fully audited

Still pending:

- raw logs for all historical workflow runs;
- exhaustive enumeration of every historical run, not only receipt-linked runs;
- Actions caches, if any;
- releases and attached assets;
- GitHub Packages;
- repository webhooks, deploy keys, environments, secrets and variables;
- branch-protection/rulesets and Pages settings at the moment of publication;
- every remaining issue/PR comment not returned by the accessible queries;
- forks, if any, after visibility changes.

Some of these surfaces require manual GitHub UI review because the current connector does not expose an exhaustive listing API.

## Source-public interpretation

Current result:

```text
PR/issue targeted review:                 PARTIAL PASS
formal reviews/threads on highest-risk PRs: NONE FOUND
source-audit artifact 8856776966:          BYTE-REVIEWED PASS
F3/F4 receipt-linked artifacts:            NONE
current repository metadata:               RECORDED / UNCHANGED
raw logs/all runs/releases/packages/settings: PENDING
project license decision:                  PENDING
intended default branch:                    PENDING OWNER DECISION
SOURCE-PUBLIC-READY:                        NOT PROVEN
```

No repository visibility, default branch, merge state or Pages setting was changed during this audit.
