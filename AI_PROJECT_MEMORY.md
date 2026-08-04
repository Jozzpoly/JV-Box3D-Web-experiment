# AI project memory — JV Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`
Owner: Jozz

## 1. Mission

Build a serious JV Web Demonstrator that:

- runs on desktop and phone;
- uses deliberately designed mobile controls;
- later drives over an optimized real-world scan;
- can be shared through GitHub Pages without a custom server;
- remains truthful about backend authority, native parity and owner acceptance;
- transfers validated knowledge to future JES work.

Do not evolve a second product physics implementation in TypeScript.

Read:

```text
docs/PROJECT_STATE.md
docs/REFOUNDATION_LOOP_PL.md
docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
docs/decisions/ADR-0004-pages-ready-demonstrator.md
docs/decisions/ADR-0005-project-license.md
```

## 2. Active line

```text
base:   agent/jv-web-refoundation@f06853467408d6c633ca806d985062c634b3a666
active: agent/jv-web-demonstrator-foundation
PR #18: draft / do not merge / do not publish
```

Resolve current head with Git; do not store a changing SHA here.

Never merge, mark Ready, move `main`, change visibility, enable Pages or choose a product default without Jozz.

## 3. Evidence boundary

Green refoundation base:

```text
77/77 tests PASS
TypeScript PASS
Vite build PASS
```

Earlier portable falsification:

```text
67067c5d46fc...
81/81 tests PASS
bundle PASS
portable FAIL on root-absolute /receipts URL
```

Fixed source:

```text
./receipts/jv_m6_factory_receipt.json
```

Latest local foundation gate:

```text
2f14d109980c99b844d80b80a080327e1fb4d900
Node 24.16.0
npm 11.17.0
receipt byte-exact
npm ci/docs/TypeScript PASS
109 tests: 108 PASS / 1 FAIL
```

Only fail: privacy identifier remained in one public-report field. No physics/runtime test failed. Final recursive sanitizer has since been corrected, but the newer head is **not locally green yet**. Never invent the new test count or package PASS.

## 4. Backend truth

```text
id: legacy_ts_m6
role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
acceptsNewProductPhysics: false
```

Critical mismatch:

```text
native maxDriveSpeed = 40 rad/s wheel rev limit
legacy TS             = 40 m/s linear target interpreted through radius
```

Do not add product drivetrain, steering, suspension, aero, contact or tire mechanics to this backend.

Product authority:

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
 TypeScript input/render/mobile/scene/UI host
```

## 5. Three readiness gates

### SOURCE-PUBLIC-READY

Requires exact default-branch candidate, owner-approved project license/rights strategy, current/history/ref/path scan, reachable-license inventory, classified review findings, GitHub cloud/settings audit, public documentation, asset-rights classification and owner approval.

### DEMONSTRATOR-PACKAGE-READY

Requires local Node 24 foundation PASS, portable static/privacy/network/compliance PASS, loopback root/subpath HTTP PASS, desktop browser smoke and exact package receipt.

### PAGES-PUBLISH-READY

Requires public source, package readiness, mobile lifecycle/performance PASS, owner mobile acceptance, release-only publishing branch and owner approval exact package.

Never collapse them into one `PUBLIC-READY` label.

## 6. Portable/build truth

Artifact contract:

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Manifest records exact commit, fingerprinted ref, backend identity, runtime/compliance assets and payload SHA-256. It must never expose branch/private metadata, claim parity/product authority or grant public/Pages approval.

Foundation runner now pins exact branch/commit through the entire build, checks final clean tree and verifies manifest source/publication fields.

Package scripts contain no publish/deploy/pages function. Build never publishes.

## 7. Public-history safety

Audit scans:

- current index and dirty/untracked state;
- all reachable blobs;
- commit and annotated-tag metadata;
- refs and current/historical path identifiers;
- sensitive filenames and credential patterns;
- symlinks and gitlinks;
- large/unscanned objects;
- final recursive report sanitization.

Exact current `.npmrc` may be accepted only when bytes equal:

```text
engine-strict=true
save-exact=true
```

Any drift or historical `.npmrc` remains blocked.

The report requires nine public contracts. Eight exist; root `LICENSE` is intentionally missing pending Jozz.

## 8. Review ledger

Ignored local evidence:

```text
.local-audit/public-readiness.json
.local-audit/license-inventory.json
.local-audit/public-review-classifications.json
```

Every review finding must be:

```text
ACCEPTED + safe rationale + reviewer + UTC timestamp
or
REMEDIATE
```

`PENDING`, stale/missing entries, wrong source commit or rationale containing private identifiers fail. The audit runner generates reports and the pending ledger but never accepts findings automatically.

## 9. Licensing truth

Exact notices cover:

```text
box3d.js@0.0.2 / MIT
embedded Box3D 8441b4a... / MIT
Vite 8.1.5 / MIT
TypeScript 7.0.2 / Apache-2.0
```

Inventory separates:

```text
root project license
third-party notice
nested vendor license
```

A nested license never satisfies the project-license requirement.

Historical fact:

```text
PR #1 contains MIT License
Copyright (c) 2026 Jozz Vehicle contributors
```

ADR-0005 recommends MIT as the least-conflicting option but **does not select it**. Jozz must choose exact strategy, holder text and year. Do not add `LICENSE` silently.

Code licensing does not automatically license models, scans, photographs, textures, fonts, audio, logos, scenes or native JV assets.

## 10. GitHub collaboration/cloud truth

Canonical map:

```text
docs/PUBLIC_COLLABORATION_HISTORY.md
```

Observed:

```text
13 PR records
12 open drafts
1 closed quarantine (#8)
0 merged
issues #3/#5/#7/#10/#12
```

Available bodies/comments were reviewed; no obvious credential, Jozz-local path or private owner e-mail observed. #1/#8 quarantined, #15 has drive erratum, #17 architecture authority, #18 active candidate.

Artifact `8856776966` was byte-reviewed and hash-matched; no unsafe path, secret or JV/Jozz owner data found.

Raw logs reviewed: source audit, F3 and F4. Tokens were masked; hosted-runner paths only. F2 manual-dispatch raw log, Actions caches, exhaustive runs, releases, packages and settings remain manual UI items.

## 11. Main integration truth

Measured checkpoint:

```text
main@5c64903d753f893adc42be90e0c3d8053a95a922
candidate behind: 0
merge base: exact main
```

Candidate was a pure descendant. Remeasure before decision. Preferred owner-approved integration is an exact fast-forward of `main`, not merging every stacked PR, squash, merge commit or force update.

No `main` or default-branch change has been made.

## 12. Public policy surface

Present:

```text
README.md
THIRD_PARTY_NOTICES.md
SECURITY.md
CONTRIBUTING.md
docs/PROJECT_STATE.md
docs/PUBLIC_COLLABORATION_HISTORY.md
docs/PUBLIC_ASSET_RIGHTS_POLICY.md
docs/operations/SOURCE_PUBLIC_RELEASE_RUNBOOK_PL.md
```

Missing intentionally:

```text
LICENSE
```

Private workspaces:

```text
.local-assets/
.local-scans/
.private-work/
```

Asset policy is default-deny.

## 13. Mobile/scene truth

Mobile contract uses Pointer Events, exclusive pointer ownership and semantic RELEASE on up/cancel/lostcapture/background. Quality profiles never change physics.

Scene contract separates source scan, render representation and collision proxy with units, spawn, bounds, rights and file hashes.

Mobile implementation and scene loader wait for a green foundation checkpoint.

## 14. Workflow rules

- respond to Jozz in Polish;
- GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge forbidden;
- keep frequent progress checkpoints;
- guide local updates safely;
- no destructive reset/clean/stash without owner decision;
- no merge/Ready/main/default/visibility/Pages change without Jozz;
- no custom Actions, self-modifying CI or cross-repo loop;
- no parity, owner-feel or readiness claim from the wrong evidence level;
- no hidden assist/fallback;
- update this memory and PROJECT_STATE after meaningful checkpoints.

## 15. Immediate sequence

```text
1 fresh Node 24 foundation gate on current head
2 report-only public/history + license audits
3 generate review ledger
4 classify every finding
5 obtain Jozz exact project-license decision
6 add exact LICENSE and rerun dependent gates
7 finish manual GitHub UI audit
8 remeasure main fast-forward proof
9 prepare exact owner approval receipt
10 owner-approved fast-forward main
11 owner-approved private -> public
12 immediate public/anonymous clone verification
13 keep Pages disabled
14 continue Demo/Lab, mobile, native WASM and scene work
```