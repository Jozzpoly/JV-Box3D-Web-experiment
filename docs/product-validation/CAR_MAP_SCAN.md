# Active product candidate — car + E2R + JSPREV2

Status: **LOCAL GATE PENDING / OWNER BROWSER ACCEPTANCE PENDING / DO NOT MERGE**

## Exact identity

- repository: `Jozzpoly/JV-Box3D-Web-experiment`
- product branch: `product/jv-web-car-map-scan`
- product commit: `04713ab33ba8788d3ee404f2165484366b7a717b`
- accepted car baseline: `d6aa218064c2653f918cf7956d2fcd20a940caf3`
- native E2R/scan authority: `Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142`
- operator: `tools/product-validation/Launch-JvWebCarMapScan.ps1`
- development port after PASS: `5175`

The product commit is exactly 50 commits ahead of the accepted car baseline and zero commits behind it. The vehicle input, steering controller, drive controller, suspension configuration and joint implementation are not modified by the product diff.

## Intended result

One browser runtime contains:

- the owner-accepted `legacy_ts_m6` car mechanics;
- active E2R plate, offroad, rock islands and bumper banks;
- the exact local JSPREV2 pack with 25 render groups and 25 textures;
- real Box3D collision for E2R and the merged scan mesh;
- one WebGL context and one camera;
- explicit `Mapa E2R` and `Skan JSPREV2` start targets;
- scan spawn derived from the current scan AABB center and its real mesh surface;
- mobile-safe 16-bit render mesh chunks without `OES_element_index_uint`.

## Validation boundary

The implementation and tests exist in the product branch. They have not yet been executed in the owner's exact Windows toolchain. The operator must establish all of the following before browser observation:

1. exact remote product SHA;
2. clean isolated external worktree;
3. Node `v24.16.0` and npm `11.17.0`;
4. full historical foundation gate PASS;
5. exact local JSPREV2 selection with 25 groups and 25 textures;
6. source identity unchanged after the gate;
7. external gate log and JSON receipt.

Only after those checks does the operator start Vite at `http://localhost:5175`.

## Owner observation

Both start targets must be inspected separately.

```text
Mapa E2R:
samochód widoczny:
skręt:
jazda/hamulec:
rebuild:
kamera:
mapa widoczna:
kontakt z mapą:

Skan JSPREV2:
przełączenie celu:
spawn na powierzchni:
skan widoczny:
tekstury 25/25:
kontakt ze skanem:
skręt i jazda:
rebuild pozostaje na skanie:
kamera:
stabilność:
konsola przeglądarki:
```

No merge, Ready transition or native-parity claim is authorized by this record.

## Preserved history

Renderer Host R1, the later renderer stack and the quarantined red implementation remain preserved as historical and forensic sources. This product candidate does not delete, rewrite, reset or merge those branches.
