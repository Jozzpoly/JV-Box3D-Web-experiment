# R1-F0 — vehicle foundation audit

Updated: 2026-08-07
Status: `COMPLETE / ARCHITECTURE DECISION RECORDED`
Branch basis: `development/jv-web-r1@6e132a61f1ae0e81b15d954b32ed92ad1f60ec4e`

## Purpose

Determine the smallest credible path from the published R0 synthetic/reference vehicle to Jozz's intended chassis + four real wheel visuals without destabilizing the proven physics, controls, world or release foundation.

This audit is architecture-only. It deliberately makes no runtime/code claim beyond the exact source inspected.

## 1. Baseline that must remain stable

Published R0 is an immutable comparison/rollback baseline:

```text
source:       5ba6cc406b8c1541e29cd1ae59ffed78a7509284
public:       c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
public tree:  f1c5c9a971208d89da05143f10913891a58b3b70
Pages:        https://jozzpoly.github.io/JV-Box3D-Web-Public/
```

R1 visual work must not require changing R0 physics/input behavior merely to display a different vehicle mesh.

## 2. Current live render path

The live R0/R1-base runtime path is:

```text
src/main.ts
  → M6DebugRenderer
  → M6ProductRenderer
  → M6WorldRenderer
```

`M6DebugRenderer` is only an alias of `M6ProductRenderer`.

`M6ProductRenderer` adds product-world subscription but no vehicle-asset renderer.

`M6WorldRenderer` draws the vehicle procedurally:

- chassis = generated box mesh;
- four wheels = generated cylinder meshes;
- front marker = generated box;
- rack/link observer geometry = generated lines;
- transforms come from `M6TraceFrame`.

Therefore the visible vehicle in R0 is not a GLB and does not exercise the dormant vehicle-visual pipeline.

## 3. Physics → visual boundary is already correctly designed

This is the strongest R1-F0 finding.

`M6TraceFrame` already contains:

```text
visualFrame: VehicleVisualFrameV1
```

`M6VehicleController.captureTrace()` builds that frame every physics step through `buildM6VisualFrameV1()`.

The frame covers the complete M6 visual topology:

### Parts — 18

```text
m6.chassis
m6.rack

for each fl/fr/rl/rr:
  wheel
  knuckle
  upper-arm
  lower-arm
```

### Segments — 8

```text
for each fl/fr/rl/rr:
  coilover
  steering-link
```

Total transform channels: 26.

This means a future GLB renderer does NOT need Box3D body/joint handles. Physics remains authoritative and the renderer can remain read-only.

### Architecture invariant

```text
Box3D/runtime
  → VehicleVisualFrameV1
  → visual bindings
  → renderer
```

Do not bypass this by exposing Box3D internals to rendering.

## 4. Existing dormant GLB foundation

The current R1 base already contains substantial reusable infrastructure.

### Package contract

`VehicleVisualPackageV1` provides:

- stable package ID/display name;
- M6 vehicle family;
- `M6_FULL_RIG_V1` profile;
- meter units;
- fixed +X forward / +Y up / +Z right axes;
- GLB URL + SHA-256 + byte length;
- binding IDs and node names;
- binding sources:
  - `PART`;
  - `SEGMENT_STRETCH`;
  - `SEGMENT_ENDPOINT_AIM`;
- per-binding local transform.

The package validator requires complete coverage of all 18 parts + 8 segments.

### Runtime loader

`loadVehicleVisualRuntimeV1()` already provides:

```text
manifest fetch
→ URL validation
→ GLB fetch
→ asset/hash validation
→ rigid GLB decode
→ CPU ownership seal
→ geometry budget validation
```

### GPU upload

`createRigidMeshGpuAssetV1()` already uploads:

- POSITION;
- optional NORMAL;
- optional TEXCOORD_0;
- Uint16 index buffers;
- material index metadata.

It owns deterministic GPU-buffer disposal.

### Pose resolver

`resolveVehicleVisualBindingsV1()` already maps `VehicleVisualFrameV1` + package bindings to `worldFromNode` matrices and supports fixed parts, stretched segments and endpoint-aimed segments.

## 5. What is actually missing

The missing core is considerably smaller than a new vehicle-rendering system.

There is currently no live renderer that connects:

```text
VehicleVisualRenderResourceV1
+ trace.visualFrame
+ resolveVehicleVisualBindingsV1()
+ decoded node→mesh mapping
→ WebGL draw calls
```

`RigidMeshGpuAssetV1` is an upload/ownership resource, not a draw engine.

The live `M6WorldRenderer` still draws procedural primitives and never creates a `VehicleVisualRenderResourceV1`.

## 6. Tiny full-rig fixture is the correct first integration target

The repository already generates:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

The fixture uses the same complete `M6_FULL_RIG_V1` contract and creates nodes/bindings for all current M6 part/segment IDs.

This is the ideal R1-F1 integration target because it separates two questions:

1. **Can the existing GLB pipeline drive the live renderer correctly?**
2. **Can Jozz's authored assets be imported/rendered correctly?**

Do not combine those questions in the first implementation slice.

## 7. Frozen owner-vehicle candidate — salvage assessment

Frozen source:

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Its final commit added preservation/generation of pixel textures and alpha masks.

### Valuable ideas/code to consider salvaging later

The candidate contains owner-vehicle tooling that is absent from current R1:

- Blockbench glTF inspection/conversion;
- chassis calibration;
- wheel marker calibration;
- deterministic owner M6 GLB/package generation;
- source-authority/hash receipts;
- real-channel concept:
  - `m6.chassis`;
  - four wheel channels.

The owner generator deliberately kept the full 26-channel contract while using real geometry for only 5 channels and diagnostic geometry for the remaining 21. This is architecturally useful and avoids weakening the runtime contract.

### Why the candidate must NOT be resumed wholesale

At its final tip:

- `M6ProductRenderer` is byte-identical to the current procedural renderer wrapper and does not render owner GLB assets;
- the runtime GLB decoder still exposes material `baseColorFactor` + `doubleSided`, not embedded texture/image/sampler/alpha-mask resources;
- GPU asset code uploads UV buffers but does not allocate WebGL textures or implement texture sampling;
- therefore the candidate's generated textured GLB data was ahead of the live runtime's decode/upload/draw capability.

The candidate is useful source material, not a completed visual pipeline.

## 8. Architecture decision

### Keep `M6_FULL_RIG_V1`

Do NOT introduce a new reduced `CHASSIS_PLUS_4_WHEELS` runtime contract now.

Reasons:

- complete visual-frame data already exists every physics step;
- full topology is stable and validated;
- tiny fixture already exercises it;
- diagnostic placeholders allow incremental replacement of visual channels;
- weakening the contract creates another migration layer without solving the actual missing draw integration.

### Keep physics/render isolation

`trace.visualFrame` remains the sole pose authority for GLB visualization.

### Do not add texture support in the first renderer integration

R1-F1 should use the already-supported material `baseColorFactor` only. Textures/alpha masks are a later bounded problem.

## 9. Planned implementation sequence

### R1-F1 — live GLB full-rig proof

Goal: prove the dormant visual stack end-to-end in the real live renderer using the deterministic tiny fixture.

Minimum scope:

1. create/load `VehicleVisualRenderResourceV1` from the tiny package;
2. resolve package bindings against `trace.visualFrame` every render frame;
3. map bound nodes to decoded mesh indices;
4. draw GPU primitives using package/world matrices;
5. use decoded `baseColorFactor` for simple untextured material color;
6. keep terrain/world rendering unchanged;
7. provide an explicit debug/procedural fallback or comparison mode rather than silently hiding GLB failures;
8. validate destroy/rebuild generation changes, camera and desktop/mobile controls remain unchanged.

No owner models and no texture implementation belong to R1-F1.

### R1-F2 — owner chassis + four wheels, untextured first

After R1-F1 is runtime-proven:

1. selectively port the smallest trustworthy Blockbench inspection/calibration/generation pieces from the frozen candidate;
2. revalidate source authority rather than inheriting old claims;
3. generate a full-rig package with real chassis + four wheels and diagnostic placeholders for the other 21 channels;
4. render using the already-proven R1-F1 path;
5. owner visually validates scale, orientation, wheel center/radius/width and motion.

Do not require pixel textures to prove geometry/pose integration.

### R1-F3 — pixel textures/materials

Only after owner geometry is proven:

- extend GLB decoder to preserve images/textures/samplers/baseColorTexture/alpha mode/cutoff;
- add owned WebGL texture resources;
- implement NEAREST + CLAMP_TO_EDGE policy;
- support OPAQUE/MASK rendering;
- prove deterministic build/runtime behavior.

Salvage candidate logic selectively where it still satisfies the current runtime contract.

### Later

- replace diagnostic remaining components with authored components when useful;
- refine UI/presentation;
- decide which diagnostics remain development-only;
- create a new public release only after a meaningful user-facing slice is accepted.

## 10. Explicit non-goals for immediate R1 work

Do not combine R1-F1 with:

- native-JV parity work;
- physics refactor;
- control refactor;
- public scan/JSPREV2;
- GitHub Pages/release infrastructure changes;
- texture/material expansion;
- full UI redesign;
- wholesale candidate merge.

## 11. Success criterion for R1-F1

The first R1 implementation slice is successful when the live browser visibly renders the deterministic GLB full rig from the same `trace.visualFrame` that drives the current procedural reference, while:

```text
physics behavior unchanged
input behavior unchanged
world/terrain unchanged
rebuild generation still works
desktop/mobile still usable
GLB resource lifecycle clean
no fallback disguised as PASS
```

Only then should Jozz's authored chassis/wheel data become the next variable.

## 12. Final R1-F0 verdict

The project does not need a new vehicle architecture from scratch.

It already has:

```text
physics pose authority         PRESENT
full visual frame              PRESENT
full-rig binding contract      PRESENT
GLB validation/decoder         PRESENT
GPU geometry upload            PRESENT
binding transform resolver     PRESENT
deterministic full-rig fixture PRESENT
live GLB draw integration      MISSING
owner import tooling           SALVAGE-ONLY / NOT ON R1
runtime pixel textures         MISSING
```

The shortest safe path to Jozz's real vehicle is therefore:

```text
prove live GLB rendering first
→ introduce real chassis + 4 wheels second
→ add pixel textures third
```

This becomes the R1 implementation foundation.
