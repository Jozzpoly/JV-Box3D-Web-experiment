# JV Web — current project state

Updated: 2026-08-07
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / POST-R0 FOUNDATION GROUNDED`
Owner: Jozz

## 1. Exact identities

### Private source

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
R0 source branch: repair/jv-web-release-r0
R0 source commit: 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
R0 source tree:   08314a0182a38bbcd106e984dde73e737a1a13e7
```

The historical private `main` remains a navigation/default branch and is not the active product implementation.

### Public artifact

```text
repository: Jozzpoly/JV-Box3D-Web-Public
main:       401068f5734c841d43907b71484bc03a2396c604
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree:       f1c5c9a971208d89da05143f10913891a58b3b70
previous release rollback:
            401068f5734c841d43907b71484bc03a2396c604
```

### GitHub Pages

```text
URL:
  https://jozzpoly.github.io/JV-Box3D-Web-Public/

status:
  built

build type:
  legacy branch source

source:
  release/r0 /(root)

HTTPS:
  enforced
```

## 2. Exact published artifact

```text
validated candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public file count:
14

public Git tree:
f1c5c9a971208d89da05143f10913891a58b3b70
```

The public tree contains only the static artifact payload: HTML/CSS/JS, manifest, notices, synthetic scene/receipt, tiny proof vehicle files and `.nojekyll`. It does not contain the private source repository or JSPREV2 scan bytes.

## 3. Evidence classification

### Source/artifact proof

The final pre-public Windows gate on source `5ba6cc...` established:

```text
Windows 11 x64
Node 24.16.0
npm 11.13.0
TypeScript 7.0.2
Vite 8.1.5
tests: 290/290 PASS
two independent MAP_ONLY_R0 builds
14/14 artifact files byte-identical
zero public scan requests in project-path Edge smoke
```

### Publication proof

Publication evidence ZIP SHA-256:

```text
18bed9b4ed11c8620afebfdc5f78a21750a945b60ee6e0baa6337a52a4437fd1
```

It proves:

- public Gate 0 started from `release/r0@401068f...`;
- generated public commit `c3e33e3...` has sole parent `401068f...`;
- its tree is exact `f1c5c9a...`;
- push was normal fast-forward, no force;
- fresh clone after push reproduced exact HEAD/tree;
- Pages was created from `release/r0 /`;
- live GitHub Pages returned the application;
- final online Edge reached Running/LIVE;
- generation advanced 1 → 2 through rebuild;
- grid toggle worked;
- project responses succeeded;
- scan request count was zero;
- unexpected browser errors were empty.

The only observed non-project HTTP miss is the browser's host-level `https://jozzpoly.github.io/favicon.ico` request returning 404. It is cosmetic and outside the project prefix.

### Owner validation

Jozz manually used the live URL after publication:

- desktop browser: page/live world works;
- real smartphone: page works in portrait and landscape;
- mobile controls are visible and usable;
- vehicle drives, steers and brakes;
- offroad/terrain and standard scene behavior are usable.

This is `OWNER ACCEPTED` manual live-URL evidence. The screenshots visually support the live/responsive layouts; interaction claims are owner observation, not machine-generated phone telemetry.

## 4. R0 campaign closure

```text
R0-A repository authority             COMPLETE
R0-B canonical Windows/toolchain      COMPLETE PASS
R0-C structural MAP_ONLY_R0           COMPLETE PASS
C0-CHAR lifecycle characterization    COMPLETE PASS
C1 scan-free provider split           COMPLETE
C2 dedicated MAP_ONLY_R0 entry        COMPLETE PASS
R0-D reproducible public artifact     COMPLETE PASS
R0-E runtime validation               COMPLETE:
                                      automated live desktop Edge
                                      + owner real-phone/desktop validation
R0-F public repo + GitHub Pages       PUBLISHED PASS
R0-G default-branch normalization     DEFERRED / NOT REQUIRED FOR R0
```

R0 is CLOSED. Do not continue treating `repair/jv-web-release-r0` as an active feature-development campaign.

## 5. Product truth after R0

### Proven public behavior

- WebGL browser world runs from GitHub Pages;
- map-only E2R/synthetic terrain content is available;
- reference vehicle has contacts and movement;
- desktop and mobile input are usable;
- rebuild lifecycle works;
- public runtime makes no JSPREV2 scan request.

### Deliberately private/local behavior

- JSPREV2 scan loading/render/collision remains LOCAL_FULL/private;
- scan publication rights, size and hosting are not resolved by R0.

### Not yet final product authority

```text
runtimeBackend.id: legacy_ts_m6
runtimeBackend.role: REFERENCE_BROWSER_FIXTURE
productPhysicsAuthority: false
nativeParity: NOT_PROVEN
```

Do not present the current reference M6 as proven native-JV parity.

## 6. Known limitations / technical debt

1. **Vehicle presentation** — current public vehicle is a proof/synthetic M6, not Jozz's intended final models/chassis/wheels.
2. **Manifest lifecycle semantics** — `build-manifest.json` correctly binds the source and hashes but its publication booleans describe build-time dormant state. They were intentionally not rewritten after publication because that would mutate the validated artifact.
3. **Favicon** — host-level favicon request returns 404.
4. **Hardening** — branch protection, default-branch normalization, CSP/security headers, wider browser/device matrix and performance optimization remain future work.
5. **Bundle size** — main JS is roughly 1.23 MB; acceptable for R0, worth profiling later.
6. **Public scan** — intentionally absent.
7. **Licensing** — no general public reuse license has been granted.

None of these invalidates the R0 publication proof.

## 7. New development foundation

Create/continue post-R0 product work on:

```text
development/jv-web-r1
```

The branch starts from the R0 grounding checkpoint and must preserve R0 as an immutable comparison/rollback.

### First R1 questions before implementation

1. What exact visual/vehicle architecture should represent Jozz's real chassis and four wheels?
2. Which existing dormant GLB/vehicle-visual foundation pieces are worth salvaging versus rewriting?
3. What is the intended authority relationship between browser `legacy_ts_m6`, future native JV and Box3D mechanics?
4. Which R0 UI/debug surfaces remain development instrumentation and which belong in a user-facing demo?
5. What data can eventually be public (models, textures, scan) and under what license/hosting model?

Do not answer these by wholesale-merging historical candidate branches. Reinspect exact source and salvage only bounded, justified pieces.

## 8. Next allowed technical work

The next implementation should be an R1 product slice, not another R0 release gate.

Recommended first slice:

```text
R1-F0 vehicle foundation audit
```

It should map the current reachable vehicle render path, the 21 historically non-product-reachable visual files, current synthetic assets and frozen R1 candidate work. Its output should be a decision on the smallest credible path to Jozz's real chassis + four wheels in the live browser without destabilizing R0 physics/input.

No product code change is required merely to perform this audit.
