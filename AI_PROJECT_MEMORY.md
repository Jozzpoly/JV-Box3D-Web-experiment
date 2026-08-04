# AI project memory — JV Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`
Owner: Jozz

## 1. Mission

Build a serious JV Web Demonstrator that:

- runs on desktop and phone;
- uses deliberately designed mobile controls;
- eventually drives over an optimized real-world scan;
- can be shared through GitHub Pages without a custom server;
- remains truthful about backend authority and native parity;
- supplies validated knowledge to future JES work.

Do not evolve a second product physics implementation in TypeScript.

Read:

```text
docs/PROJECT_STATE.md
docs/REFOUNDATION_LOOP_PL.md
docs/DEMONSTRATOR_VALIDATION_POLISH_LOOP_PL.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
docs/decisions/ADR-0004-pages-ready-demonstrator.md
```

## 2. Active line

```text
base: agent/jv-web-refoundation@f06853467408d6c633ca806d985062c634b3a666
active: agent/jv-web-demonstrator-foundation
PR: #18 draft / do not merge / do not publish
```

Never merge, mark ready, change visibility, enable Pages or select a product default without Jozz.

## 3. Evidence boundary

Green refoundation base:

```text
Node 24.16.0
npm 11.17.0
77/77 tests PASS
TypeScript PASS
Vite build PASS
```

First demonstrator gate at `67067c5d46fc...`:

```text
81/81 tests PASS
TypeScript PASS
Vite bundle PASS
portable validation FAIL
```

The fail was correct: bundled JS embedded root-absolute `/receipts/...`, which would break under a GitHub Pages project path.

Fixed source:

```text
./receipts/jv_m6_factory_receipt.json
```

The newer head has many additional tests and gates and is **not yet locally green**. Do not infer a new pass count.

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

Do not add product drivetrain, anti-roll, aero, suspension or future tire mechanics to this backend.

## 5. Product architecture

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
 TypeScript input/render/mobile/scene/UI host
```

First native spike uses unchanged M5/M6 sources plus a thin adapter. Obtain POSITION-like native/WASM baseline before structural refactor or shared native RATE.

## 6. Two tracks

### Track A — demonstrator

Allowed on frozen legacy fixture:

- portable package;
- Demo/Lab split;
- loading/error UX;
- mobile input ownership;
- camera/reset;
- scene seam and synthetic campus;
- quality profiles;
- LAN/phone testing;
- Pages packaging.

### Track B — physics authority

- Box3D + JV Core WASM;
- ABI/stable IDs/snapshots;
- native/WASM scenario parity;
- backend swap;
- later Wheel Scope backend.

## 7. Portable artifact truth

Current artifact contains:

```text
index.html
assets/
receipts/
THIRD_PARTY_NOTICES.md
build-manifest.json
.nojekyll
```

Generator requires a clean source tree. Manifest records exact commit, backend identity, runtime/compliance files and SHA-256 payload table.

It must remain:

```text
publicReady=false
pagesPublicationApproved=false
publishedByBuild=false
nativeParity=NOT_PROVEN
```

Validation layers:

1. static paths/file table/hash/authority/publication checks;
2. loopback HTTP byte smoke at `/` and `/JV-Box3D-Web-experiment/`;
3. later real browser desktop smoke;
4. later LAN phone smoke;
5. later exact Pages package smoke.

Build never publishes.

## 8. Public readiness

Decision:

```text
PUBLIC-READY PASS
→ owner approval
→ manual repository visibility change
→ PAGES-PUBLISH PASS
→ owner approval
→ manual Pages enablement
```

Current status:

```text
repository PRIVATE
Pages DISABLED
current project LICENSE MISSING
THIRD_PARTY_NOTICES PRESENT
public README candidate PRESENT on active branch
main/default branch NOT READY
```

Public audit scans current index, dirty state, all reachable blobs, commit/tag metadata and refs. Values resembling secrets are fingerprinted; ref names are redacted from the report.

Cloud audit must separately cover PRs/comments/reviews, issues, Actions logs/artifacts, releases and packages.

## 9. Licensing truth

Exact notices currently cover:

```text
box3d.js@0.0.2 / MIT
embedded Box3D 8441b4a... / MIT
Vite 8.1.5 / MIT
TypeScript 7.0.2 / Apache-2.0
```

Installed package metadata and exact `box3d.js/LICENSE` hash are verified during `npm run check` and portable build.

Historical fact:

```text
agent/bootstrap-web-poc / PR #1 contains MIT LICENSE
Copyright (c) 2026 Jozz Vehicle contributors
```

A reachable-license inventory now reports all historical license-like blobs. Jozz still must explicitly choose the current project license. Do not silently add MIT even though it is the lowest-conflict candidate.

Licensing code does not automatically license models, scans, textures, scenes or native JV assets.

## 10. GitHub history truth

- PR #15 has a prominent drive-unit erratum;
- issue #12 is marked as historical RATE research;
- PR #1 remains quarantined and carries historical MIT;
- no formal reviews/inline threads were found on PR #1, #15, #17 or #18;
- obvious secrets were not seen in inspected bodies/comments;
- logs/artifacts/releases/packages audit remains incomplete.

Default `main` is stale and cannot be the public landing branch. Do not update/merge/change default without Jozz.

## 11. Mobile and scene invariants

Mobile:

- landscape-first;
- exclusive pointer ownership;
- relative RATE pad is the first experiment;
- pointer release/cancel = semantic `RELEASE`, never hidden centre target;
- throttle/brake/reverse/camera cannot steal pointers;
- blur/visibility/pagehide/dispose release controls;
- quality changes render only.

Scene:

```text
source scan
render mesh / LOD
simplified collision mesh
scene manifest + spawn/bounds metadata
```

Never use a raw noisy photogrammetry mesh as the default collider.

## 12. Steering/wheel truth

Reference measurements:

```text
stationary held excess: 0.000 mm
driving held excess:    <= 0.284 mm
post-RELEASE peak:       2.541–2.817 mm
contacts:                4
```

Do not force-clamp before native comparison.

```text
legacy_m6_split_sphere_sidewall
= regression baseline / failure reference
```

Future wheel physics belongs to native JV Core after a fresh exact Wheel Scope source receipt.

## 13. Workflow rules

- respond to Jozz in Polish;
- GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge forbidden;
- always guide Jozz safely through local updates;
- no destructive reset/clean/stash without explicit owner decision;
- no merge/ready/visibility/Pages change without Jozz;
- no custom Actions, self-modifying CI or cross-repo loop;
- no parity claim from internal tests;
- no owner-feel claim without Jozz;
- no hidden assist/fallback;
- no unindexed destructive documentation removal;
- update this memory and `PROJECT_STATE.md` after meaningful checkpoints.

## 14. Immediate sequence

```text
1 static review current PR #18
2 one fresh local demonstrator gate
3 audit:public and classify findings
4 audit:licenses and obtain Jozz license decision
5 finish logs/artifacts/releases/packages cloud audit
6 prepare owner-approved default-branch integration
7 backend identity through trace/UI/receipt
8 Demo/Lab split
9 mobile pointer-ownership prototype
10 parallel native JV WASM parity spike
11 scene manifest + synthetic campus
12 scan audit/conversion when files arrive
13 phone owner gate
14 PUBLIC-READY decision
15 manual visibility change
16 PAGES-PUBLISH gate and manual enablement
```