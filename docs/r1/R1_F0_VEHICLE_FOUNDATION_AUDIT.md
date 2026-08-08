# R1-F0 — vehicle foundation audit

Updated: 2026-08-08
Status: **TECHNICAL FINDINGS PRESERVED / ORIGINAL SCHEDULING SUPERSEDED**
Original audit basis: `development/jv-web-r1@6e132a61f1ae0e81b15d954b32ed92ad1f60ec4e`

## Supersession note

This document preserves the useful technical findings of the 2026-08-07 vehicle-foundation audit. It is **not the current roadmap**.

Since the original audit:

- R0 was published and owner-accepted;
- exact authored `Nadwozie.gltf` and `Offroad_Big_Wheels.gltf` were recovered with provenance and historical calibration evidence;
- the campaign scope was clarified: JV-Web is the active friend-demo core while native JV is read-only;
- actual owner-visible progress and play/feel were made explicit scheduling inputs;
- scan resources and `b3Wheel` became parallel opportunity/risk tracks rather than deferred non-goals.

Therefore the old rigid sequence `tiny GLB → owner geometry → textures` should be read only as one technically safe decomposition. Current scheduling authority is `docs/PROJECT_STATE.md` and the controlled handoff.

## 1. Durable technical finding — current live renderer is procedural

Current live path remains:

```text
src/main.ts
  → M6DebugRenderer
  → M6ProductRenderer
  → M6WorldRenderer
```

`M6DebugRenderer` is an alias of `M6ProductRenderer`.

`M6ProductRenderer` adds product-world subscription but no authored-vehicle draw path.

`M6WorldRenderer` still draws:

- chassis as a generated box;
- four wheels as generated cylinders;
- diagnostic front/rack/link primitives;
- world/terrain separately.

So the public R0 vehicle is not a GLB and does not exercise the authored-vehicle pipeline.

## 2. Durable technical finding — physics→visual boundary is already useful

`M6TraceFrame` contains:

```text
visualFrame: VehicleVisualFrameV1
```

`M6VehicleController.captureTrace()` builds it through `buildM6VisualFrameV1()`.

Current proof topology contains 18 rigid part transforms plus 8 segment channels:

```text
parts:
  chassis, rack
  wheel/knuckle/upper-arm/lower-arm × 4

segments:
  coilover × 4
  steering-link × 4
```

This is valuable because a renderer does not need transient Box3D body/joint handles.

Preferred boundary:

```text
physics/runtime
  → immutable semantic visual frame
  → bindings/transforms
  → renderer
```

Do not bypass this casually by exposing Box3D internals to rendering.

`M6_FULL_RIG_V1` is a useful current proof topology. It is **not declared the permanent future native↔Web ABI**.

## 3. Durable technical finding — substantial dormant GLB stack already exists

Current R1 includes reusable infrastructure for:

```text
VehicleVisualPackageV1
→ package-relative GLB URL
→ exact byte/hash gate
→ rigid GLB decode
→ CPU ownership/budget validation
→ GPU geometry-buffer ownership
→ binding-to-world transform resolution
```

`createRigidMeshGpuAssetV1()` uploads POSITION, optional NORMAL/TEXCOORD_0 and index buffers.

`resolveVehicleVisualBindingsV1()` maps `VehicleVisualFrameV1` + bindings into world matrices for fixed parts and segment bindings.

The missing product bridge is primarily:

```text
VehicleVisualRenderResourceV1
+ trace.visualFrame
+ draw-plan/bindings
+ decoded node/mesh mapping
→ live WebGL draw calls
```

plus production texture/material support for the real authored assets.

## 4. Tiny fixture — seam diagnostic, not product milestone

The repository generates a deterministic full-rig fixture:

```text
public/vehicles/tiny/vehicle.visual.json
public/vehicles/tiny/models/m6-rig-proof.glb
```

It remains useful when the implementation question is specifically:

> Can the dormant GLB/binding/GPU stack drive the live renderer without mixing in owner-asset import problems?

However, after the real source assets were recovered, the tiny fixture must not become a multi-stage campaign of its own. Use it only as much as needed to isolate a renderer seam. The owner-visible target is the real chassis + real wheels in the running product.

## 5. Recovered owner assets strengthen the next visual work

Exact source assets now exist and are indexed in the handoff/resource pack.

Chassis:

```text
assets/source/Nadwozie.gltf
SHA-256 45055fee11458290d107e8442d1da0d032ed9a094bea98a069d99e1a87954ca8
```

Historical measured start point:

```text
model 3.28m × 2.73m × 1.23m
yaw -90°
chassis-local position (0, -0.60, 0)
vehicle wheelbase 2.50m
track 2.10m
```

Wheel:

```text
assets/source/Offroad_Big_Wheels.gltf
SHA-256 1fe1d08dd068157d699dc5232054ee61f6aa5a14af15480be0c77aeb55b5b617
```

It contains semantic mount/spin/radius/width markers.

A fresh implementation should start from these known assets/evidence rather than broad discovery or eyeballed calibration.

## 6. Frozen owner-vehicle candidate — salvage assessment remains valid

Frozen source:

```text
candidate/jv-web-owner-vehicle-visual-r1
796b050b4b90a2383803cab13f9dcd3aeca5f97f
```

Useful salvage includes:

- strict Blockbench glTF inspection/conversion;
- chassis calibration;
- wheel marker calibration;
- deterministic owner package generation;
- source/hash receipts;
- preserving real chassis + four wheel channels while retaining diagnostic placeholders elsewhere;
- pixel texture/alpha-mask generation ideas.

Do not resume/merge the branch wholesale. At its final tip the live renderer was still procedural and the texture-producing tooling was ahead of runtime decode/upload/draw support.

## 7. Textures/materials remain a separate technical problem

Current R1 GLB policy/runtime is intentionally limited compared with the authored Blockbench files. Real pixel-art presentation may require support for:

- embedded images/textures;
- `baseColorTexture`;
- sampler/texture GPU ownership;
- NEAREST / CLAMP_TO_EDGE;
- alpha mode/cutoff for MASK-like materials.

Do not hide this problem by flattening the final vehicle into an unrepresentative visual. But also do not require the full texture subsystem before proving a renderer seam if a smaller diagnostic step answers the immediate question.

## 8. Scheduling guidance after supersession

Do not treat this as an ordered roadmap.

For a car-focused slice, a plausible decomposition is:

```text
inspect current live draw seam
→ use tiny fixture only if needed to isolate it
→ integrate exact Nadwozie + four wheel assets
→ correct pose/scale from evidence + owner observation
→ implement only the material/texture subset actually needed
→ evolve chase camera close to this owner-visible work
```

But current owner feel, scan readiness or a blocking `b3Wheel` discovery may legitimately reorder the campaign.

## 9. Invariants to keep

- public R0 remains a comparison/rollback baseline;
- vehicle visuals should consume read-only semantic state rather than Box3D handles;
- real authored model data must not silently become physics authority;
- historical branches are salvage sources, not authorities;
- tiny fixture is a diagnostic tool, not the definition of progress;
- owner visual/feel acceptance is required when the question is visual/experience quality;
- ordinary private work should use focused validation rather than R0 release ceremony.

## 10. Current verdict

The original core diagnosis still stands:

```text
physics pose authority          PRESENT
semantic visual frame           PRESENT
GLB validation/decoder          PRESENT
GPU geometry upload             PRESENT
binding transform resolver      PRESENT
live authored GLB draw bridge   MISSING
production pixel materials      MISSING
owner source assets             NOW RECOVERED
owner import/calibration tools  SALVAGE-AVAILABLE
```

What no longer stands is the claim that the project must mechanically execute `R1-F1`, then `R1-F2`, then `R1-F3`. The current handoff deliberately keeps scheduling adaptive.