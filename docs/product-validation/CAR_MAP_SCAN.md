# Active product candidate — car + E2R + JSPREV2

Status: **LOCAL GATE PENDING / OWNER BROWSER ACCEPTANCE PENDING / DO NOT MERGE**

## Exact identity

- repository: `Jozzpoly/JV-Box3D-Web-experiment`
- product branch: `product/jv-web-car-map-scan`
- product commit: `106312083875b5aa94cf1f9fc986ac3c26888aa5`
- accepted car baseline: `d6aa218064c2653f918cf7956d2fcd20a940caf3`
- native E2R/scan authority: `Jozzpoly/Box3d_FunProject@959aefb78587ce60cf2b8eb03ff82797a4165142`
- operator: `tools/product-validation/Launch-JvWebCarMapScan.ps1`
- development port after PASS: `5175`

The product is exactly 52 commits ahead of the accepted car baseline and zero commits behind. The vehicle input, steering controller, drive controller, suspension configuration and joint implementation are not modified by the product diff.

## Intended result

One browser runtime contains:

- owner-accepted `legacy_ts_m6` car mechanics;
- active E2R plate, offroad, rock islands and bumper banks;
- one explicit or unambiguously selected JSPREV2 pack;
- exactly 25 render groups and 25 texture files;
- real Box3D collision for E2R and the scan authority mesh;
- separate owned render streams and collision streams from the same pinned pack;
- one WebGL context and one camera;
- explicit `Mapa E2R` and `Skan JSPREV2` start targets;
- scan spawn derived from the current AABB center and real mesh surface;
- mobile-safe 16-bit render chunks;
- checked WebGL buffer and texture uploads.

## Preserved failed evidence

Two earlier exact attempts remain preserved outside the repository:

1. `04713ab…` — TypeScript stopped on one implicit callback type;
2. `84910b9…` — TypeScript passed and 237/238 tests passed; the only failure was non-canonical `-0` in scan origin.

Neither worktree nor log is deleted or rewritten. They are evidence of the failures that led to the consolidated hardening commit.

## Consolidated hardening before the next gate

The current product does not merely change the failed assertion. It also:

- canonicalizes outward numeric zeros;
- validates the complete JSPREV2 descriptor table and payload;
- checks finite vertex fields and index bounds in the selected real pack;
- rejects ambiguous or heuristic pack selection;
- resolves relative `ACTIVE_PREVIEW.json` paths from the selector directory;
- refuses fallback when an explicit pack is invalid;
- validates PNG/JPEG/WebP signatures and pack budgets;
- exposes V2 counts and memory estimates to browser and receipt;
- catches WebGL errors reported through `getError()`;
- adds a full E2R integration test with the accepted M6 on plate and offroad.

## Validation boundary

The implementation has undergone source review and independent focused tests, but has not yet passed the owner's exact Windows gate at this SHA. The operator must establish:

1. exact remote SHA;
2. clean isolated external worktree;
3. Node `v24.16.0` and npm `11.17.0`;
4. full historical foundation gate PASS;
5. deep exact JSPREV2 V2 validation;
6. source identity unchanged after the gate;
7. external log and JSON receipt.

Only after those checks does it start Vite at `http://localhost:5175`.

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
