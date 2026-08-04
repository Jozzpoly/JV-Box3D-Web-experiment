# GitHub Actions raw-log review — 2026-08-04

Status: `PARTIAL RAW-LOG REVIEW / SOURCE-PUBLIC-READY NOT PROVEN`
Repository visibility during review: `PRIVATE`

## Method

Known receipt-linked GitHub Actions job logs were downloaded through the GitHub job-log API and read as text. No job was re-run. No workflow, secret, cache, repository setting or artifact was modified.

This receipt records only the exact jobs below. It is not an exhaustive list of all historical Actions runs.

## Job 91694046725 — source audit

Run:

```text
30816077386
workflow/job: audit-box3d-js-source / receipt
permission: contents: read
```

Observed:

- GitHub token value rendered as `***`;
- only standard hosted-runner paths under `/home/runner/...`;
- no checkout of JV Web;
- public npm metadata, package inventory and upstream Box3D/binding source excerpts;
- exact public package/source hashes;
- upload of artifact `8856776966`;
- artifact ZIP digest matches the separately byte-reviewed archive;
- no Jozz local Windows path, private owner e-mail or credential value observed.

The log includes public npm integrity/signature metadata. Those values authenticate the public npm package and are not repository credentials.

Classification:

```text
RAW LOG REVIEWED
TOKEN MASKING OBSERVED
PUBLIC UPSTREAM PROVENANCE ONLY
NO OWNER-PRIVATE DATA OBSERVED
```

## Job 91826090330 — F3 validation

Run:

```text
30855702375
workflow/job: validate-f3-factory / validate
permission: contents: read
```

Observed:

- checkout token and auth header rendered as `***`;
- auth header removed during post-job cleanup;
- standard hosted-runner paths only;
- PR merge ref and public commit identities;
- Node/npm versions;
- npm install result with zero observed vulnerabilities;
- 37/37 test output;
- Vite bundle output and known bundle warnings;
- headless browser receipt with public runtime identity, contact/rebuild values and user agent;
- no downloadable workflow artifact;
- no Jozz local path, private owner e-mail or credential value observed.

Cache observation:

```text
setup-node npm cache restored
cache key derived from OS/architecture/package-lock hash
cache size approximately 24 MB
```

The log indicates an npm download cache, not a source checkout artifact. Its repository UI entry still requires manual cache-list review before visibility changes.

Classification:

```text
RAW LOG REVIEWED
TOKEN MASKING/CLEANUP OBSERVED
NO OWNER-PRIVATE DATA OBSERVED
NPM CACHE SURFACE REQUIRES MANUAL UI CONFIRMATION
```

## Job 91834173347 — F4 validation

Run:

```text
30858244976
workflow/job: validate-f4-current-m6 / validate
permission: contents: read
```

Observed:

- checkout token and auth header rendered as `***`;
- auth header removed during post-job cleanup;
- standard hosted-runner paths only;
- PR merge ref and public commit identities;
- Node/npm versions;
- npm install result with zero observed vulnerabilities;
- 46/46 test output;
- Vite bundle output and known bundle warnings;
- M6 browser receipt containing topology, legacy wheel-backend identity, RELEASE state, rack/contact values and headless user agent;
- no downloadable workflow artifact;
- no Jozz local path, private owner e-mail or credential value observed.

Cache observation:

```text
setup-node npm cache saved
cache key derived from OS/architecture/package-lock hash
transferred payload approximately 24 MB
```

Classification:

```text
RAW LOG REVIEWED
TOKEN MASKING/CLEANUP OBSERVED
NO OWNER-PRIVATE DATA OBSERVED
NPM CACHE SURFACE REQUIRES MANUAL UI CONFIRMATION
```

## Historical F2 write-capable workflow

Known exact receipt commit:

```text
8c86c94762a79f444f425b61fa82ca07e649bbd8
```

Known workflow behavior from source:

```text
workflow_dispatch
contents: write
creates/updates package-lock and F2 receipts
configures actions@users.noreply.github.com
pushes to agent/typed-box3d-boundary
```

The available commit-workflow endpoint returned no run because it filters to pull-request-triggered workflow runs. The F2 validation was manually dispatched, and its exact run/job ID was not recovered through the current connector search.

Therefore:

```text
F2 WORKFLOW SOURCE REVIEWED
F2 GENERATED COMMIT/RECEIPTS REVIEWED
F2 RAW JOB LOG NOT REVIEWED
MANUAL ACTIONS UI LOOKUP REQUIRED
```

Do not infer that the missing API result means the run or log does not exist.

## Current result

```text
source-audit raw log: REVIEWED / NO PRIVATE FINDING
F3 raw log:           REVIEWED / NO PRIVATE FINDING
F4 raw log:           REVIEWED / NO PRIVATE FINDING
known npm cache:      CLASSIFIED / MANUAL UI CHECK PENDING
F2 raw log:           PENDING MANUAL UI LOOKUP
all historical runs:  NOT EXHAUSTIVELY ENUMERATED
SOURCE-PUBLIC-READY:  NOT PROVEN
```

## Manual completion checklist

Before public visibility:

1. open Actions → All workflows and enumerate every historical run;
2. locate the F2 manual run that produced commit `8c86c947...`;
3. inspect its raw log for token masking, local/private paths and pushed content;
4. review the Actions cache list and remove stale caches if Jozz chooses;
5. confirm no unreviewed downloadable artifact remains;
6. record exact run/job/artifact/cache identities without copying secret values;
7. keep Pages disabled.
