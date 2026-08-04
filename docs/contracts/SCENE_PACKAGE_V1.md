# JV Web — ScenePackageV1

Updated: 2026-08-04
Status: `ACTIVE MINIMAL CONTRACT`
Owner: Jozz

## Purpose

`ScenePackageV1` is the smallest stable boundary between the browser demonstrator and a drivable environment.

It prevents scene integration from depending on hidden scale, guessed axes, manually adjusted spawn points or one combined mesh being used accidentally for both rendering and physics.

## Canonical file

```text
public/scenes/synthetic-flat-lab.scene.json
```

The default URL is site-relative:

```text
./scenes/synthetic-flat-lab.scene.json
```

The same package therefore works from localhost, LAN HTTP and a repository subpath.

## Coordinate contract

```text
units:   meter
forward: +X
up:      +Y
right:   +Z
```

A scene using another convention must be converted before it is accepted. The runtime does not silently swap axes or infer scale.

## Required fields

```text
format = jv-web-scene-package
schemaVersion = 1
id
displayName
units
axes
spawn
render
collision
```

Unknown keys fail closed.

## Spawn

```text
position: [x, y, z] in meters
yawRadians: finite number
```

The current legacy backend supports only `yawRadians = 0`. This is an explicit backend limitation, not a limitation of the scene schema.

## Render source

```text
NONE
GLB { url, sha256 }
```

`NONE` is used by the synthetic validation lab.

`GLB` reserves the minimum data required by the future scene renderer. Describing a GLB does not mean the current backend can load it.

## Collision source

```text
BUILTIN_GROUND_PLANE { heightMeters }
TRIANGLE_MESH { url, sha256 }
```

The current legacy backend supports only a built-in plane at `y = 0`.

A future scan must use a deliberately prepared collision representation. The visual scan mesh must not automatically become the physics collision mesh.

## Asset paths

Asset URLs must:

- be site-relative;
- contain no scheme or host;
- not start at `/`;
- not contain a `..` segment;
- carry a lowercase 64-character SHA-256 value.

No remote CDN or hidden network dependency is allowed.

## Runtime order

```text
fetch scene package
→ strict schema validation
→ backend support validation
→ create scene resources
→ create vehicle at scene spawn
→ begin fixed-step host
```

A scene failure must create zero vehicle-world ownership or must roll back all staged resources.

## Portable package

The portable build must declare both:

```text
receipts/jv_m6_factory_receipt.json
scenes/synthetic-flat-lab.scene.json
```

as required runtime assets. Each must also exist in the payload table with exact bytes and SHA-256.

## Deliberately outside V1 implementation

- GLB decoding;
- texture loading;
- triangle-mesh cooking;
- level-of-detail generation;
- scan chunk streaming;
- occlusion or culling systems;
- automatic coordinate conversion;
- automatic collision generation;
- real scan performance acceptance.

Those capabilities should be added only when their implementation becomes active.
