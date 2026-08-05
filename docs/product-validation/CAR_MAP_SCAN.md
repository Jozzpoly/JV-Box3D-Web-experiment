# Active product candidate — car + E2R + JSPREV2

Status: **BASE PRODUCT GATE PASS / VISUAL FIX GATE PENDING / OWNER VISUAL REVIEW PENDING / DO NOT MERGE**

## Exact identity

- repository: `Jozzpoly/JV-Box3D-Web-experiment`
- product branch: `product/jv-web-car-map-scan`
- active visual-fix candidate: `c8e0bf24748b0a790a1c0039b1be801eef266580`
- first full green integrated product: `106312083875b5aa94cf1f9fc986ac3c26888aa5`
- accepted car baseline: `d6aa218064c2653f918cf7956d2fcd20a940caf3`
- native E2R/scan authority: `Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142`
- operator: `tools/product-validation/Launch-JvWebCarMapScan.ps1`
- development port after PASS: `5175`

The active candidate remains a descendant of the accepted car baseline. The vehicle input, steering controller, drive controller, suspension configuration and joint implementation are not modified by the visual-fix diff.

## Proven integrated checkpoint

The owner's exact Windows run at `106312083875b5aa94cf1f9fc986ac3c26888aa5` established:

- exact Node `v24.16.0` and npm `11.17.0`;
- TypeScript PASS;
- `251/251` tests PASS;
- documentation, notices and portable package PASS;
- real private JSPREV2 pack deeply validated;
- `7` tiles, `25` groups, `25` textures and `1,775,775` triangles;
- browser runtime started at `http://localhost:5175`;
- accepted car visible and controllable on E2R and the scan;
- rocks and bumper banks present;
- offroad present;
- scan geometry and Box3D collision observed working;
- map/scan target switching working.

This is the first complete integrated product checkpoint. It remains preserved and is not replaced by an unvalidated visual patch.

## Owner visual findings at the green checkpoint

Confirmed working:

- car mechanics and controls;
- E2R plate, offroad, rocks and bumpers;
- scan geometry;
- scan collision;
- camera and target switching.

Observed defects and omissions:

1. JSPREV2 texture atlases were visibly scrambled across otherwise-correct geometry.
2. Scan filtering was forced to linear smoothing with no interface control.
3. The observer grid was always drawn over the product world.
4. The product still uses the primitive debug vehicle; the proper authored vehicle model is not active yet.

## Root cause and active visual fix

Source comparison with the native scan renderer established that native JV:

- keeps the writer-provided UV stream unchanged;
- pairs manifest textures with groups in the same order;
- uploads decoded texture rows without a vertical image flip;
- uses `NEAREST` filtering.

The browser renderer at `106312…` instead forced `UNPACK_FLIP_Y_WEBGL = 1` and `LINEAR` filtering. With photogrammetry atlases, the vertical flip sends UV islands into unrelated atlas regions, which explains the apparent random texture mosaic rather than a simple upside-down image.

The active candidate `c8e0bf…` therefore:

- forces native-compatible `UNPACK_FLIP_Y_WEBGL = 0`;
- defaults to native-compatible `NEAREST` filtering;
- adds live `Piksele / Wygładzanie` controls without reloading the scan;
- updates all already-created scan textures while preserving the previous WebGL binding;
- defaults the observer grid to OFF;
- adds a live `Grid: włączony / wyłączony` diagnostic control;
- preserves the chosen view settings while switching between E2R and scan targets;
- adds focused tests for settings, texture upload policy and product entry wiring.

The visual-fix candidate has passed focused strict TypeScript review and isolated policy tests. It has not yet passed the repository's exact Windows gate or owner visual review.

## Validation boundary

The operator must establish for `c8e0bf…`:

1. exact remote SHA;
2. clean isolated external worktree;
3. Node `v24.16.0` and npm `11.17.0`;
4. full foundation gate PASS;
5. deep exact JSPREV2 V2 validation;
6. source identity unchanged after the gate;
7. external log and JSON receipt.

After the automated gate, owner review must check:

```text
Skan JSPREV2:
textures correctly mapped:
Piksele mode:
Wygładzanie mode:
filter switch without reload:
scan geometry unchanged:
scan collision unchanged:

Mapa E2R / offroad:
grid off by default:
grid live toggle:
rocks and bumpers unchanged:
car controls unchanged:
rebuild:
stability:
console:
```

## Next product stage after visual acceptance

Activate the proper vehicle model through the existing `VehicleVisualFrameV1` and vehicle visual-package pipeline. Do not couple authored vehicle rendering to scan UV repair, and do not change the accepted legacy car mechanics while adding its visual model.

## Git history note

During publication of the visual-fix branch, three accidental technical commits temporarily carried an empty `__invalid__` file. They were not force-pushed away or rewritten. The final candidate tree `3e241761784edd2a2fb6ab18095c25ea0e737185` contains no such file, and the final diff from `106312…` contains only the eight intended visual and test files.

No merge, Ready transition or native-parity claim is authorized by this record.
