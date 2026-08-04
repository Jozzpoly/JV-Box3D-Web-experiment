# JV Web — StaticSceneVisualPackageV1

Updated: 2026-08-04
Status: `PRELIMINARY CONTRACT / NOT ACTIVE IN RUNTIME`
Owner: Jozz

## Purpose

Prepare a durable visual boundary for synthetic environments and photogrammetry scans while vehicle rendering remains the active priority.

```text
static-scene manifest
        ↓
pinned GLB bytes
        ↓
shared rigid GLB CPU decoder
        ↓
static worldFromAsset
        ↓
shared GPU mesh ownership
```

This contract does **not** make scan import active. It ensures the vehicle pipeline is reusable rather than building a second GLB parser later.

## Coordinate contract

```text
units:   meter
forward: +X
up:      +Y
right:   +Z
```

A scan is transformed into the world by one explicit `worldFromAsset` position and normalized quaternion. Import corrections belong in the manifest, not as unexplained edits to vehicle spawn or physics.

## Local-origin policy

Photogrammetry geometry must be authored near a scene-local origin.

```text
mode: SCENE_LOCAL_ORIGIN
maxRadiusMeters: explicit positive limit
```

Large survey or geographic coordinates must be rebased before packaging. This protects WebGL float precision and keeps vehicle/world transforms numerically stable.

## Visual and collision separation

```text
photogrammetry render GLB ≠ collision mesh
```

The visual scan may contain holes, noise, high-frequency detail and thin surfaces unsuitable for vehicle collision. Collision remains a separate `ScenePackageV1` source with its own simplification, scale and validation.

Never use a heavy scan render mesh as collision merely because it is already available.

## Package fields

The preliminary manifest pins:

- stable package ID and display name;
- purpose: `SYNTHETIC` or `PHOTOGRAMMETRY_SCAN`;
- metre/JV axes;
- clean package-relative GLB URL;
- exact byte length and SHA-256;
- `worldFromAsset` position and rotation;
- local-origin maximum radius;
- maximum nodes, triangles and materials.

## Shared and scan-specific work

Shared with the vehicle pipeline:

- GLB container validation;
- one embedded buffer policy;
- CPU vertex/index decode;
- node hierarchy and cycle detection;
- materials subset;
- transactional GPU buffers;
- disposal and rebuild;
- root/subpath portable URLs.

Still required specifically for scans:

- active glTF scene-root selection;
- static hierarchy world-matrix compilation;
- normals and texture pipeline;
- texture resolution/memory budgets;
- culling and chunking strategy;
- optional LOD or spatial cells;
- independent simplified collision package;
- real-phone performance measurement.

## Priority boundary

```text
ACTIVE:
vehicle tiny-fixture renderer
vehicle model/rig pipeline

PREPARED ONLY:
static scan manifest and shared CPU/GPU seams

NOT ACTIVE:
real scan import
triangle collision
scan LOD/streaming
```

The first real scan is imported only after the tiny vehicle asset renders, disposes and rebuilds correctly on desktop and phone.
