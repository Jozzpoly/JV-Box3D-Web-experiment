# ADR-0004 — Pages-ready JV Web Demonstrator

Date: 2026-08-04
Status: `ACCEPTED FOR DEMONSTRATOR FOUNDATION`
Decision owner: Jozz

## Context

The immediate product goal is a serious demonstrational JV build that can run on desktop and phone, eventually driving over a scanned environment. Jozz does not want to administer a server or perform a public launch yet, but has decided that the repository may become public as soon as a dedicated public-readiness gate passes.

Opening an HTML file in GitHub's repository viewer does not execute an arbitrary web application. GitHub Pages is the appropriate GitHub feature for serving a static game from a repository.

A single self-contained HTML file remains an optional research target, not the main distribution format. Embedding JavaScript, WebAssembly and a future scan into one file would increase startup memory, complicate failure recovery and make scene quality variants or chunking difficult. `file://` behavior is also not a reliable substitute for HTTP/HTTPS testing.

## Decision

The product distribution artifact is a **portable static site**:

```text
index.html
assets/*.js
assets/*.css
runtime/*.wasm
scenes/<scene-id>/...
build-manifest.json
.nojekyll
```

It must:

- be built locally from an exact commit;
- contain only relative internal URLs;
- work from the domain root and a nested path;
- run from a simple local HTTP server;
- be testable over LAN on a real phone;
- be copyable unchanged to a dedicated Pages publishing branch;
- never publish itself;
- remain compatible with `native_jv_wasm` and future scan packages.

## Publication model

Target:

```text
public source repository
+ dedicated generated publishing branch
+ GitHub Pages: Deploy from a branch
```

No custom deployment workflow is added. Publishing remains a manual repository-setting decision by Jozz.

The publishing branch contains generated static output only. Development history and generated output are not mixed in the default branch.

## Public-readiness gate

The repository must remain private until all of the following are satisfied:

```text
PUBLIC-READY =
  clean intended default branch
  + explicit project LICENSE
  + THIRD_PARTY_NOTICES
  + current-tree secrets/privacy audit
  + reachable-history secrets/privacy audit
  + GitHub cloud-surface audit
  + public README and project status
  + no private scan/source assets
  + portable package validation
  + desktop smoke
  + phone smoke
  + explicit owner approval
```

The GitHub cloud-surface audit includes:

- pull-request bodies, comments and reviews;
- issues and issue comments;
- historical Actions logs and downloadable artifacts;
- releases and attached files;
- packages;
- branch/tag names and still-reachable experimental refs.

Deleting a sensitive file in a later commit does not pass the history audit. If a secret is ever found, it must be revoked/rotated before any history cleanup is considered sufficient.

Historical PRs may remain as evidence, but each obsolete or corrected claim must have a prominent status/erratum so it cannot be mistaken for current architecture. Closing a PR does not hide its public content.

## GitHub Pages activation gate

Pages remains disabled until:

1. repository visibility is public;
2. the exact portable package has a receipt;
3. the publishing branch contains only intended release files;
4. root-path and repository-subpath tests pass;
5. Jozz explicitly approves publication.

A hard-to-guess Pages URL is not privacy or access control.

## Validation and challenge loop

Each iteration must answer:

1. **Claim** — what exact sharing or runtime property is claimed?
2. **Counterexample** — which browser, device, path, protocol or asset can disprove it?
3. **Smallest artifact** — what minimal package can falsify the claim?
4. **Path test** — root and nested path.
5. **Protocol test** — HTTP/HTTPS; `file://` is separate and never assumed.
6. **Mobile test** — touch ownership, orientation, background/resume, memory pressure.
7. **Resource audit** — compressed bytes, decoded memory estimate, request count, largest file.
8. **Privacy audit** — current tree, reachable history, branches, receipts, assets and GitHub metadata surfaces.
9. **License audit** — project code, dependencies and later scan/source ownership.
10. **Owner gate** — Jozz decides whether the result is useful and shareable.
11. **Receipt** — exact commit, artifact hash, browser/device and known limitations.

A green build without path, protocol, mobile, privacy and license evidence is not a shareable demonstrator.

## Polish and finalization loop

```text
truthful product identity
→ portable packaging
→ public-readiness audit
→ Demo/Lab separation
→ loading and failure UX
→ mobile input ownership
→ camera and reset
→ scene seam
→ performance tiers
→ native JV WASM parity
→ real scan conversion
→ phone owner test
→ immutable Pages package
→ explicit publication
```

Presentation polish never outranks truthful backend identity, input correctness, memory safety or reproducibility.

## Immediate implementation

1. Add a Vite relative base.
2. Copy `.nojekyll` into every build.
3. Generate a build manifest with source identity.
4. Validate that the package is path-portable and contains no accidental source artifacts.
5. Add a local Pages-ready gate that cannot publish.
6. Build a pre-public Git/history audit tool and separately inspect GitHub metadata surfaces.
7. Classify license and historical-PR blockers.
8. Only then continue with Demo/Lab and mobile controls.

## Rejected alternatives

### Execute the game directly from the GitHub code viewer

Not supported by the repository viewer.

### Use one giant HTML as the product format

Rejected as the default until a measured small-scene probe proves value on real phones. It is not suitable for the final scan by assumption.

### Make the repository public before the audit

Rejected because visibility exposes code, reachable repository history and GitHub collaboration metadata, not merely the current playable build.

### Add automatic Pages deployment now

Rejected. It would create publication capability before the owner and public-readiness gates.
