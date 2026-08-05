# ADR-0005 — glTF colour and texture upload policy

Date: 2026-08-05
Status: `ACCEPTED FOR IMPLEMENTATION / TEXTURE PATH NOT YET ACTIVE`
Owner: Jozz

## Context

The lit-normal renderer introduces the first production-oriented surface lighting in JV Web. The next capability will add embedded base-colour textures for both owner-authored vehicles and static scan visuals.

Colour-space, image orientation and WebGL unpack behaviour must be fixed before texture code exists. Leaving these decisions to browser defaults would make desktop/mobile output device-dependent and could force a later rewrite of every material and visual acceptance result.

## Decision

JV Web uses one explicit colour pipeline:

```text
baseColorFactor: linear RGB
baseColorTexture RGB: sRGB encoded
baseColorTexture alpha: linear
        ↓
sRGB texture sample decoded to linear RGB
        ↓
linear factor multiplication
        ↓
linear lighting
        ↓
linear result encoded to sRGB for the default canvas framebuffer
```

The current `LIT_NORMAL_BASE_COLOR_V1` renderer already treats `baseColorFactor` as linear, performs lighting in linear space and explicitly encodes its RGB result to sRGB. `LIT_NORMAL_BASE_COLOR_TEXTURE_V1` must preserve the same equation and insert only the sRGB texture-decode term.

No renderer may apply lighting directly to sRGB texture values.

## Image decode and upload state

Embedded PNG/JPEG decode must use an injectable browser boundary. The production boundary must request or enforce:

```text
imageOrientation: none
premultiplyAlpha: none
colorSpaceConversion: none
```

Before `texImage2D`, the renderer-owned context must explicitly set:

```text
UNPACK_FLIP_Y_WEBGL = false
UNPACK_PREMULTIPLY_ALPHA_WEBGL = false
UNPACK_COLORSPACE_CONVERSION_WEBGL = NONE
```

The upload code must restore every modified pixel-store value after the transaction, including failure paths.

Why:

- glTF defines texture coordinate `(0,0)` at the upper-left of the image;
- image metadata must not silently change authored colour values;
- base-colour alpha is not premultiplied by the format contract;
- browser defaults are not accepted as an asset semantic.

A deterministic orientation fixture must prove all four texture corners on desktop and phone. Visual inspection of an unmarked texture is not sufficient evidence.

## WebGL1 NPOT policy

JV Web does not silently resize a non-power-of-two image.

For the first texture capability, an NPOT texture is accepted only when its effective sampler is WebGL1-complete without mipmaps:

```text
wrapS = CLAMP_TO_EDGE
wrapT = CLAMP_TO_EDGE
minFilter = NEAREST or LINEAR
no mip generation
```

An NPOT texture requesting `REPEAT`, `MIRRORED_REPEAT` or a mipmapped minification filter is rejected before GPU publication.

Power-of-two textures may use the supported wrap and mipmap subset defined by the future sampler capability gate. Missing glTF sampler fields must be resolved to their glTF defaults before the NPOT decision; defaults must never be replaced with convenient engine defaults.

This policy favours deterministic author feedback over hidden resampling, quality loss or device-specific incomplete textures.

## Initial texture material subset

`LIT_NORMAL_BASE_COLOR_TEXTURE_V1` will accept only:

- embedded PNG or JPEG via GLB `bufferView`;
- one `baseColorTexture` per material;
- `texCoord = 0`;
- `TEXCOORD_0` on every primitive using that texture;
- opaque alpha `1`;
- explicit supported sampler state;
- no texture transform extension.

It will reject:

- external image URI;
- browser colour-profile conversion;
- implicit or explicit vertical flipping;
- premultiplied upload;
- alpha mask/blend;
- normal, metallic-roughness, occlusion or emissive maps;
- multiple UV sets;
- KTX2/BasisU and all glTF extensions;
- silent NPOT resizing.

## Ownership and cancellation

Encoded image bytes, decoded image objects and WebGL texture objects are separate owned stages.

```text
embedded encoded bytes
        ↓ async decode
owned decoded image
        ↓ transactional upload
owned WebGL texture
```

If cancellation or failure occurs:

- no partial textured render resource is published;
- a decoded image completing late is closed/discarded;
- every created WebGL texture is deleted in reverse order;
- pixel-store and texture-binding state is restored;
- compressed byte size is never used as a runtime-memory estimate.

## Shared vehicle/scan consequence

This policy belongs to the shared textured rigid core. Vehicle and scan consumers may use different draw plans and budgets, but they may not interpret image orientation, colour space or sampler completeness differently.

## Validation boundary

Before the first owner texture or scan crop:

1. pure tests for sRGB transfer functions and sampler resolution;
2. deterministic embedded image fixture;
3. explicit four-corner UV orientation proof;
4. NPOT accept/reject matrix;
5. pixel-store restoration tests;
6. late-abort decode and upload rollback tests;
7. desktop and phone observation.

Until those conditions are met, textures remain rejected rather than ignored or approximately displayed.
