# GitHub cloud-surface inventory — 2026-08-04

Status: `PARTIAL INVENTORY / PUBLIC-READY NOT PROVEN`
Repository visibility during audit: `PRIVATE`

## Scope

This receipt records accessible GitHub collaboration and Actions surfaces that may become visible or relevant when the repository becomes public.

It is not a secrets scan of raw workflow logs or artifact ZIP bytes. Unavailable surfaces remain explicit blockers/review items.

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

The current demonstrator candidate still has no project `LICENSE` on `HEAD`.

Consequence:

- public licensing must classify reachable historical MIT text;
- choosing a conflicting current license without a ref/history strategy would create ambiguity;
- `THIRD_PARTY_NOTICES.md` does not license JV code or assets.

A separate reachable-license inventory now scans exact Git blobs.

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

Risk classification:

```text
LOWER RISK THAN A REPOSITORY CHECKOUT ARTIFACT
ARTIFACT ZIP CONTENT NOT DOWNLOADED/BYTE-REVIEWED
```

The connector exposed artifact metadata but not archive contents. Do not claim full artifact review.

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

## Pages distinction

No Pages publication is active.

Future Pages may use GitHub's unavoidable system deployment after explicit owner approval. This is distinct from adding custom cloud build/test/deploy workflows. The intended publishing branch contains only an already locally validated static artifact.

## Surfaces not fully audited

Still pending:

- raw logs for all historical workflow runs;
- byte-level download/review of artifact `8856776966` while it remains available;
- exhaustive enumeration of every historical run, not only receipt-linked runs;
- Actions caches, if any;
- releases and attached assets;
- GitHub Packages;
- repository webhooks/deploy keys/environments/secrets/settings;
- branch-protection and Pages settings at the moment of publication;
- every remaining issue/PR comment not returned by the accessible queries;
- forks, if any, after visibility changes.

Some of these surfaces require manual GitHub UI review because the current connector does not expose an exhaustive listing API.

## Public-ready interpretation

Current result:

```text
PR/issue targeted review: PARTIAL PASS
formal reviews/threads on highest-risk PRs: NONE FOUND
known receipt-linked workflow artifacts: CLASSIFIED
raw logs/all runs/releases/packages/settings: PENDING
project license decision: PENDING
PUBLIC-READY: NOT PROVEN
```

No repository visibility or Pages setting was changed during this audit.
