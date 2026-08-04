# ADR-0004 — public-source and Pages-ready JV Web Demonstrator

Date: 2026-08-04
Status: `ACCEPTED FOR DEMONSTRATOR FOUNDATION`
Decision owner: Jozz

## Context

The immediate product goal is a serious JV demonstrator that runs on desktop and phone and eventually allows driving over a prepared scan. Jozz does not want to administer a server. The repository may become public after a dedicated source-public gate, while the playable GitHub Pages site remains a later and separate decision.

Opening an HTML file in GitHub's code viewer does not execute an arbitrary web application. GitHub Pages is the appropriate eventual feature for serving the static game from the repository.

A single self-contained HTML file remains an optional measured probe, not the main distribution format. Embedding JavaScript, WebAssembly and a future scan into one file would increase startup memory, complicate failure recovery and make scene variants/chunking difficult. `file://` is not a reliable substitute for HTTP/HTTPS validation.

## Decision

The product artifact is a **portable multi-file static site**:

```text
index.html
assets/
runtime/
scenes/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

It must:

- be built locally from an exact clean commit;
- contain only declared relative internal assets;
- have no hidden remote HTML/CSS dependency;
- work at domain root and a repository subpath;
- run from a simple local HTTP server;
- be testable over LAN on a real phone;
- be copyable unchanged to a generated Pages branch;
- never publish itself;
- remain compatible with `native_jv_wasm` and future scan packages.

## Publication model

```text
reviewed public source repository
+ generated release-only publishing branch
+ GitHub Pages: deploy from branch
```

No custom cloud build/test/deploy workflow is added. Publishing remains a manual repository-setting decision by Jozz.

GitHub Pages records an internal platform deployment run even when a branch is the source. This is not permission to restore custom CI or cloud builds. The publishing branch contains generated static output only; development history and generated output are not mixed in the default branch.

## Gate A — SOURCE-PUBLIC-READY

This gate answers only:

> Can the repository, current source and reachable collaboration/history surfaces be shown publicly without an unresolved legal, privacy or presentation blocker?

The repository remains private until:

```text
SOURCE-PUBLIC-READY =
  intended clean default branch
  + explicit project LICENSE selected by Jozz
  + exact THIRD_PARTY_NOTICES
  + current-tree and dirty-state audit
  + reachable Git blobs/metadata/ref-name audit
  + reachable-license inventory
  + GitHub cloud-surface audit
  + public README/current state
  + no private/unapproved source assets
  + historical errata where required
  + explicit owner approval of the exact candidate
```

Phone gameplay, final scan integration and Pages deployment are **not** requirements for making the source repository public. Their absence must remain explicit in README/status.

The GitHub cloud-surface audit includes:

- PR bodies, comments and reviews;
- issues and issue comments;
- historical Actions logs and downloadable artifacts;
- releases and attached files;
- packages;
- branch/tag names and still-reachable experimental refs;
- repository settings requiring manual UI review.

Deleting a sensitive file in a later commit does not pass the history audit. Any discovered secret is revoked/rotated before history cleanup can be considered sufficient.

Historical PRs may remain evidence, but obsolete or corrected claims receive prominent status/errata. Closing a PR does not hide its public content.

## Gate B — DEMONSTRATOR-PACKAGE-READY

This gate answers:

> Is one exact nonpublishing artifact structurally and operationally ready for real browser/device testing?

Required:

```text
portable static validation
+ source-ref privacy policy
+ no-remote-dependency policy
+ payload/compliance SHA-256 table
+ loopback HTTP root/subpath byte smoke
+ desktop browser startup/rebuild/error smoke
+ exact artifact receipt
```

This gate can be executed while the repository is private.

It does not require native JV parity. If `legacy_ts_m6` remains active, the artifact and UI must identify it as a non-authoritative reference fixture.

## Gate C — PAGES-PUBLISH-READY

This gate answers:

> Can the exact demonstrator package be made available under a stable public HTTPS URL?

Pages remains disabled until:

1. `SOURCE-PUBLIC-READY PASS` and repository visibility is public;
2. `DEMONSTRATOR-PACKAGE-READY PASS` exists for the exact commit/package;
3. mobile shell and pointer ownership pass on a real phone;
4. LAN phone startup/background/orientation/performance smoke passes;
5. the generated publishing branch contains only intended release files;
6. root and repository-subpath tests pass;
7. rollback/unpublish procedure is known;
8. Jozz approves publication of the exact package.

A hard-to-guess Pages URL is not privacy or access control.

## Gate D — PUBLIC DEMONSTRATOR ACCEPTANCE

After Pages enablement:

- test the actual HTTPS URL on desktop and phone;
- verify cold/warm load, touch controls, background/resume and reset;
- verify About/Credits/Licenses;
- verify no source/private asset leak;
- record exact Pages deployment/package receipt;
- obtain Jozz's driving/UX verdict.

A Pages deployment existing is not the same as an accepted demonstrator.

## Validation and challenge loop

Each iteration answers:

1. **Claim** — what exact source/artifact/device/publication property is claimed?
2. **Counterexample** — which history item, browser, device, path, protocol or asset disproves it?
3. **Smallest artifact** — what minimal fixture falsifies the claim?
4. **Evidence level** — source, Node, portable, HTTP, browser, phone, owner or Pages?
5. **Privacy** — can the gate/report itself copy a found secret?
6. **License** — code, third party and assets classified separately?
7. **Path/protocol** — root, subpath, HTTP and later HTTPS?
8. **Mobile lifecycle** — ownership, cancel, background and orientation?
9. **Resource audit** — transfer, decoded memory, requests and largest file?
10. **Receipt** — exact commit/package/device and known limitations?

A green Node build is neither source-public readiness nor a shareable mobile demonstrator.

## Polish and finalization loop

```text
truthful product identity
→ source/history/license cleanliness
→ portable packaging
→ Demo/Lab separation
→ loading and failure UX
→ mobile input ownership
→ camera and reset
→ scene package seam
→ measured performance tiers
→ native JV WASM parity track
→ real scan conversion
→ phone owner test
→ immutable Pages package
→ explicit publication
→ actual HTTPS acceptance
```

Presentation polish never outranks backend truth, input correctness, privacy, rights, memory safety or reproducibility.

## Immediate implementation order

1. Fix and regress path portability.
2. Harden manifest truth/privacy/compliance.
3. Add loopback root/subpath HTTP verification.
4. Build current/history/ref/license audit tools with secret-safe reports.
5. Inspect GitHub collaboration/Actions surfaces.
6. Prepare public README and default-branch integration plan.
7. Obtain explicit project-license decision.
8. Pass fresh demonstrator-foundation gate.
9. Then create separate Demo/Lab/mobile implementation branch.
10. Continue native JV WASM parity in parallel.

## Rejected alternatives

### Execute from the GitHub code viewer

Not supported by the repository viewer.

### One giant HTML as the default product format

Rejected until a measured small-scene probe proves a concrete benefit. It is not assumed suitable for a scan.

### Public repository before source/history/license audit

Rejected because visibility exposes source, reachable history and collaboration metadata, not only a playable build.

### Require finished phone gameplay before source visibility

Rejected as gate conflation. The repository may be honestly public while the demonstrator remains explicitly unfinished and Pages disabled.

### Enable Pages or automatic deployment now

Rejected. It creates a public runtime surface before package, phone and owner gates.
