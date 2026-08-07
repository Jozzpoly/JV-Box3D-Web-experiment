# JV Web — current project state

Updated: 2026-08-07
Status: `R0 PUBLISHED PASS / OWNER ACCEPTED / R1-F0 FOUNDATION AUDIT COMPLETE`
Owner: Jozz

## 1. Exact R0 identities

### Private source

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
R0 source commit: 5ba6cc406b8c1541e29cd1ae59ffed78a7509284
R0 source tree:   08314a0182a38bbcd106e984dde73e737a1a13e7
```

### Public artifact

```text
repository: Jozzpoly/JV-Box3D-Web-Public
main:       401068f5734c841d43907b71484bc03a2396c604
release/r0: c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree:       f1c5c9a971208d89da05143f10913891a58b3b70
rollback:   401068f5734c841d43907b71484bc03a2396c604
```

### GitHub Pages

```text
https://jozzpoly.github.io/JV-Box3D-Web-Public/
status: built
source: release/r0 /(root)
HTTPS: enforced
```

## 2. R0 proof summary

```text
validated candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

publication evidence ZIP SHA-256:
18bed9b4ed11c8620afebfdc5f78a21750a945b60ee6e0baa6337a52a4437fd1
```

Final pre-public evidence established Windows 11 x64, Node 24.16.0, npm 11.13.0, TypeScript 7.0.2, Vite 8.1.5, 290/290 tests, two independent 14-file byte-identical MAP_ONLY_R0 builds and zero scan requests.

Publication evidence established normal fast-forward promotion, exact public tree, fresh-clone verification, Pages creation and final live Edge PASS with generation 1→2, grid toggle, no project request failures, no unexpected browser errors and zero scan requests.

Jozz then manually accepted the live URL on desktop and a real smartphone: page/world usable, portrait+landscape layouts usable, vehicle driving/steering/braking usable, terrain/offroad and standard scene usable.

Classification:

```text
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER ACCEPTED
PUBLISHED
```

Owner phone interaction is manual evidence, not a machine-generated device receipt.

Canonical R0 record:
[`repair/R0_PUBLISHED_BASELINE_2026-08-07.md`](repair/R0_PUBLISHED_BASELINE_2026-08-07.md).

## 3. R0 is closed

```text
R0-A repository authority             COMPLETE
R0-B canonical Windows/toolchain      COMPLETE PASS
R0-C structural MAP_ONLY_R0           COMPLETE PASS
C0-CHAR lifecycle characterization    COMPLETE PASS
C1 scan-free provider split           COMPLETE
C2 dedicated MAP_ONLY_R0 entry        COMPLETE PASS
R0-D reproducible public artifact     COMPLETE PASS
R0-E runtime validation               COMPLETE
R0-F public repo + GitHub Pages       PUBLISHED PASS
R0-G default-branch normalization     DEFERRED / NOT REQUIRED FOR R0
```

Do not modify the published R0 bytes in place.

## 4. Known R0 limitations

- synthetic/proof vehicle rather than Jozz's intended final models;
- `legacy_ts_m6` remains `REFERENCE_BROWSER_FIXTURE`, `productPhysicsAuthority:false`, native parity not proven;
- `build-manifest.json` publication booleans are build-time dormant state and are historically stale after promotion;
- harmless host-level `/favicon.ico` 404;
- main bundle roughly 1.23 MB;
- branch protection/default-branch normalization and broader hardening deferred;
- public JSPREV2 intentionally absent;
- no general public reuse license granted.

None invalidates R0.

## 5. Active R1 development foundation

Active branch:

```text
development/jv-web-r1
```

R0 grounding/open-R1 commit:

```text
6e132a61f1ae0e81b15d954b32ed92ad1f60ec4e
```

R1 exists to turn the proven demonstrator/release foundation into the intended product without reopening solved release infrastructure.

## 6. R1-F0 vehicle foundation audit — COMPLETE

Canonical decision record:
[`r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md`](r1/R1_F0_VEHICLE_FOUNDATION_AUDIT.md).

### Current live vehicle rendering

```text
main.ts
→ M6DebugRenderer
→ M6ProductRenderer
→ M6WorldRenderer
```

The live vehicle is still procedural:

- chassis box;
- wheel cylinders;
- rack/link debug primitives.

It does not use the existing GLB vehicle-visual pipeline.

### Already-present visual architecture

The current source already has:

```text
M6TraceFrame.visualFrame                    PRESENT
complete 18-part + 8-segment visual frame   PRESENT
M6_FULL_RIG_V1 package/binding contract     PRESENT
GLB hash/policy/decoder/runtime loader       PRESENT
GPU geometry buffer upload                  PRESENT
binding→world transform resolver            PRESENT
deterministic full-rig tiny fixture          PRESENT
live GLB draw integration                    MISSING
runtime pixel-texture pipeline               MISSING
```

The critical boundary is already correct: `M6VehicleController.captureTrace()` creates the complete `VehicleVisualFrameV1`, so rendering does not need Box3D internals.

### Frozen candidate assessment

`candidate/jv-web-owner-vehicle-visual-r1@796b050...` remains salvage-only.

Useful concepts:

- Blockbench inspection/conversion;
- owner chassis calibration;
- marker-driven wheel calibration;
- deterministic owner package generation;
- real 5-channel concept: chassis + 4 wheels;
- diagnostic geometry for the other full-rig channels.

Not reusable as a completed runtime:

- candidate's live `M6ProductRenderer` is still the same procedural implementation wrapper;
- final candidate texture generation outruns the runtime decoder/GPU renderer;
- no wholesale merge is justified.

## 7. R1 architecture decision

Keep `M6_FULL_RIG_V1`. Do not create a reduced chassis+4-wheels runtime contract now.

Keep:

```text
Box3D mechanics
→ M6TraceFrame.visualFrame
→ VehicleVisualPackage bindings
→ renderer
```

as the authority boundary.

### R1-F1 — next implementation slice

Prove the existing dormant GLB stack end-to-end with the deterministic tiny full-rig fixture.

Scope:

- load `vehicles/tiny/vehicle.visual.json` + GLB;
- create the existing GPU visual resource;
- resolve bindings from `trace.visualFrame`;
- draw bound meshes with current base-color materials;
- keep world/terrain/physics/input unchanged;
- preserve destroy/rebuild and desktop/mobile controls;
- make fallback/debug state explicit rather than disguising GLB failure.

Do NOT include owner models, texture support, physics changes, scan work, Pages work or UI redesign in R1-F1.

### R1-F2

After live GLB proof: selectively salvage owner import/calibration tooling and render real chassis + four wheels untextured first, with diagnostic placeholders for the remaining 21 visual channels.

### R1-F3

Only after geometry/pose owner acceptance: add pixel textures, NEAREST/CLAMP_TO_EDGE, OPAQUE/MASK and alpha cutoff to the runtime decoder/GPU/draw pipeline.

## 8. Immediate next action

Implement `R1-F1 — live GLB full-rig proof` on `development/jv-web-r1` as a bounded product slice.

Do not create a new public release merely for the internal integration step. Validate locally/Windows against R0 behavior first; publish a new artifact only after there is owner-visible value worth sharing.
