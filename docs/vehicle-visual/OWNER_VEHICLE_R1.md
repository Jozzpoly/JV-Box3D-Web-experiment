# Owner vehicle visual R1 — source ingestion and live render boundary

Status: **PIXEL TEXTURE CONTRACT IMPLEMENTED / LIVE RENDER IN PROGRESS / FULL GATE PENDING**

## Product milestone

R1 exists to replace the blue debug chassis and four debug wheel cylinders with
the owner's real `Nadwozie.gltf` and `Offroad_Big_Wheels.gltf` while preserving
the accepted M6 physics, controls, camera and world.

The first visual milestone is deliberately limited to five real channels:

```text
m6.chassis
m6.fl.wheel
m6.fr.wheel
m6.rl.wheel
m6.rr.wheel
```

Rack, steering links and suspension geometry may remain diagnostic until the
first real car is visible and reviewed in the browser.

## Authorities

- accepted product base: `product/jv-web-car-map-scan@c8e0bf24748b0a790a1c0039b1be801eef266580`;
- candidate branch: `candidate/jv-web-owner-vehicle-visual-r1`;
- native source authority: `Jozzpoly/Box3d_FunProject@33722127777248b3dcb228fb47f7de2fad847036`;
- historical visual calibration: `891c7561142b601f62ea76b68b0f55f8fababc6c`;
- chassis source Git blob: `a25cb0ef61d342ce476c9ef26a3b24188bace047`;
- wheel source Git blob: `c13c77a8e5552175ee8266b2da33a54691f1dae9`;
- physical-dimension receipt Git blob: `6a5cb337a7d4707946835e83e036365130c52459`.

## Preserved calibration

Chassis:

```text
scale: 0.35
rotation: -90 degrees around Y
vertical offset: -0.60 m
```

Wheel:

```text
radius: 0.514062464 m
width:  0.4375 m
```

The wheel transform is derived from the exact authored markers:
`Socket_WheelMount`, `Marker_TireRadiusOuter`,
`Marker_TireWidthLeft`, and `Marker_TireWidthRight`.

## Pixel material contract

The real Blockbench exports are not opaque colour-only meshes. They use an
embedded PNG base-colour texture, `MASK` alpha with `alphaCutoff = 0.05`,
`doubleSided = true`, NEAREST filtering and CLAMP_TO_EDGE wrapping.

R1 therefore preserves and validates:

- embedded `image/png` bytes;
- `baseColorTexture` on `TEXCOORD_0`;
- `OPAQUE` or `MASK` alpha only;
- exact alpha cutoff for MASK materials;
- NEAREST minification and magnification;
- CLAMP_TO_EDGE on both texture axes;
- base-colour factor, double-sided state, metallic `0`, roughness `1`.

BLEND, external images, non-PNG images, linear filtering, repeat wrapping,
normal/occlusion/emissive/metallic-roughness textures and unsupported material
extensions fail closed.

The generated rigid GLB embeds the validated PNG in its BIN chunk and reports:

```text
textureRendering: EMBEDDED_BASE_COLOR_MASK_V1
```

## Safety boundary

The importer still proves the authored bind pose before flattening skinning:

```text
jointWorld × inverseBindMatrix ≈ meshWorld
```

It rejects external buffers, inactive nodes, cycles, animations, morph targets,
unknown attributes, invalid accessors, malformed weights, missing markers,
non-triangle primitives and geometry outside the mobile Uint16 boundary.

## Runtime integration contract

The owner visual pass must:

1. load through the existing package, SHA, ownership and budget gates;
2. upload the existing sealed CPU geometry transactionally;
3. decode only the embedded validated PNG texture;
4. use `UNPACK_FLIP_Y_WEBGL = 0`, NEAREST and CLAMP_TO_EDGE;
5. render the five real channels from `VehicleVisualFrameV1` in the exact
   camera used by `M6WorldRenderer`;
6. suppress only the debug chassis/front marker/wheel cylinders after a complete
   successful owner draw;
7. leave diagnostic rack and suspension lines visible;
8. fall back to the accepted debug vehicle if loading or GPU setup fails;
9. release all GPU and image resources exactly once.

## Evidence

Demonstrated outside the repository's final gate:

- existing source importer and calibration synthetic gate: 10/10 PASS;
- textured MASK/NEAREST/CLAMP generation tests: 3/3 PASS;
- deterministic textured GLB output: PASS;
- BLEND and non-pixel sampler rejection: PASS.

Still pending:

- exact TypeScript 7 and full repository gate;
- generation against the exact two owner source files;
- generated package/GLB validation through the existing runtime gates;
- browser review of scale, axes, wheel orientation, steering and spin;
- real-phone performance review;
- promotion decision.

No merge, Ready transition, product-branch replacement or publication is
authorized by this document.
