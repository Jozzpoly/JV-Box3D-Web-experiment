# JV Web R0 — canonical published baseline — 2026-08-07

Status: `PUBLISHED PASS / OWNER ACCEPTED`
Purpose: immutable grounding receipt for the first public JV Web release.

This document records the strongest combined state supported by external Windows evidence, fresh GitHub state and owner manual validation. It does not upgrade unproven features to proven ones.

## 1. Source identity

```text
private repository:
  Jozzpoly/JV-Box3D-Web-experiment

source branch at build:
  repair/jv-web-release-r0

source commit:
  5ba6cc406b8c1541e29cd1ae59ffed78a7509284

source tree:
  08314a0182a38bbcd106e984dde73e737a1a13e7
```

## 2. Canonical toolchain

```text
OS:         Windows 11 x64
Node:       24.16.0
npm:        11.13.0
TypeScript: 7.0.2
Vite:       8.1.5
```

## 3. Pre-public artifact proof

The combined pre-public gate produced two independent MAP_ONLY_R0 builds and compared them byte-for-byte.

```text
tests:
  290/290 PASS

artifact:
  14 files

reproducibility:
  14/14 byte-identical

candidate ZIP SHA-256:
  f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

candidate Git tree:
  f1c5c9a971208d89da05143f10913891a58b3b70
```

The exact artifact also passed a project-path Edge smoke before publication with zero JSPREV2 scan requests.

## 4. Publication proof

External publication evidence ZIP:

```text
JV_WEB_PUBLISH_EVIDENCE_5ba6cc4_20260807-205722.zip

SHA-256:
18bed9b4ed11c8620afebfdc5f78a21750a945b60ee6e0baa6337a52a4437fd1
```

It records:

```text
public repository:
  Jozzpoly/JV-Box3D-Web-Public

release branch before:
  release/r0@401068f5734c841d43907b71484bc03a2396c604

promoted commit:
  c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

promoted commit sole parent:
  401068f5734c841d43907b71484bc03a2396c604

promoted tree:
  f1c5c9a971208d89da05143f10913891a58b3b70

promotion:
  normal fast-forward
  no force

fresh post-push clone:
  exact HEAD/tree verified
```

## 5. Pages proof

Fresh GitHub state after publication:

```text
Pages status:
  built

build type:
  legacy

source:
  release/r0 /(root)

URL:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/

HTTPS:
  enforced
```

Final online automated Edge evidence on the live HTTPS URL:

```text
result:
  PASS

initial:
  Running / LIVE
  generation 1
  4 contacts

final:
  generation 2
  grid enabled

scan request count:
  0

unexpected errors:
  []

failed project responses:
  []
```

A browser-initiated user-site favicon request returned 404 outside the project prefix; this is cosmetic and not a project-resource failure.

## 6. Owner manual acceptance

After publication, Jozz manually opened and used the live Pages URL:

### Desktop

Observed by owner:

- page loads and runs;
- physical/reference vehicle is visible;
- driving, steering and braking work;
- terrain/offroad and standard scene are usable.

### Real smartphone

Observed by owner:

- live public URL loads;
- portrait layout exposes dedicated touch controls;
- landscape layout remains usable;
- drive/steer/brake controls work.

Screenshots supplied with the acceptance visually show the live state and responsive portrait/landscape UI. Interactive behavior is an owner observation, not a machine-generated phone trace.

Classification for the public R0:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

## 7. Exact scope of what is accepted

Accepted:

- first usable public JV Web URL;
- MAP_ONLY_R0 release architecture;
- E2R/synthetic terrain/world;
- reference M6 browser mechanics sufficient for driving demo;
- desktop keyboard/pointer use;
- mobile touch use;
- destroy/rebuild lifecycle;
- public project-path delivery;
- zero public JSPREV2 scan requests.

Not accepted/proven by this R0:

- native JV physics parity;
- current browser backend as final product-physics authority;
- final Jozz vehicle models/chassis/wheel visuals;
- public JSPREV2 scan;
- production UX/polish;
- broad browser/device compatibility matrix;
- security/performance hardening beyond the R0 artifact checks.

## 8. Known immutable-artifact metadata mismatch

The public artifact's `build-manifest.json` correctly records source identity and file hashes, but its `publication` fields describe the moment the artifact was built:

```text
mode: DORMANT
publicReady: false
pagesPublicationApproved: false
publishedByBuild: false
```

After publication these are historically stale, but they must NOT be edited inside R0 because that would change the validated artifact/tree. A future manifest schema should separate build-time readiness from post-build promotion status.

## 9. Rollback

Immediate public rollback identity:

```text
401068f5734c841d43907b71484bc03a2396c604
```

R0 itself should now remain immutable. Future releases are new artifacts/commits.

## 10. Foundation decision after R0

The R0 release-engineering campaign is closed.

Next development moves to:

```text
development/jv-web-r1
```

The goal is no longer “make Pages possible”. That capability is proven.

The next fundamental problem is product finalization: establish the intended real vehicle/chassis/four-wheel visual and authority model while preserving the playable desktop/mobile baseline.

Recommended first task:

```text
R1-F0 — vehicle foundation audit
```

Audit, without implementation first:

- current reachable render/vehicle path;
- synthetic M6 asset path;
- dormant GLB/vehicle-visual foundation;
- frozen owner-vehicle candidate;
- exact pieces worth salvage;
- minimal path to Jozz's real chassis + four wheels in the live browser.

Only after that decision should R1 implementation begin.
