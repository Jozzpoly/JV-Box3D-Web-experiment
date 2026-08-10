# JV Web — current handoff

Updated: 2026-08-10
Purpose: rolling continuation note. Keep this short; replace stale content instead of appending history.

## Authority

```text
Private repo: Jozzpoly/JV-Box3D-Web-experiment
Active branch: main
R1 product baseline before documentation/repo maintenance:
  commit 9a49982cc428bf6fb18f4e1b98ea1b073eaa8a5f
  product tree e28515182d3a447374044d9ffc70943fb888328d
Maintenance lineage integrated the cleaned R1 source into default main without product changes.

Public repo: Jozzpoly/JV-Box3D-Web-Public
Frozen Pages branch: release/r0
```

Always resolve live tips before writing.

## Protected current vehicle baseline

Generated package:

```text
id: m6-owner-full-rig-r3
real bindings: 59
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
```

Protect during the next steering slice:

- accepted R4 overall owner packaging feel;
- current wheel placement;
- physical wheel spin center vs authored `Socket_WheelMount` distinction;
- rear package/cardans/dampers;
- drivetrain, camera, world and UI.

`owner_r4` and `Tire=0` are owner/session observations, not persisted source presets.

## Current problem

Front steering/upright still appears to pivot incorrectly. Front steering rods also look too short.

Current source contains a material suspect: front visual reference calibration has no independent authored lower-outboard marker and derives it as a parallel-upright inference. That is a hypothesis source, not proof of the visible defect.

Existing dynamic steering tests do not measure the decisive live kingpin/anchor relationship.

## Next slice — F0 Front Steering Truth

**No product correction during F0.** Instrument/measure FL and FR at neutral, partial and full lock:

1. upper-arm ball anchor vs knuckle upper anchor residual;
2. lower-arm ball anchor vs knuckle lower anchor residual;
3. live upper->lower kingpin line;
4. incremental knuckle rotation axis vs the current live kingpin;
5. wheel spin-center distance/orbit around the live kingpin;
6. actual steer angle;
7. rack endpoint vs knuckle steering-arm endpoint;
8. visual transforms of front knuckle and steering-link bindings.

Establish numerical tolerance from neutral/noise behavior before judging full-lock data.

Decision:

- physics coherent -> preserve `m6-runtime-builder.ts`; repair visual/local-frame/reference calibration only;
- physics incoherent -> minimum physical correction justified by measured failure;
- mixed -> separate corrections into separate checkpoints.

## Owner interaction

Do not ask Jozz to debug F0. After the smallest F1 correction, provide one stable playable candidate and ask only whether upright/wheel pivot looks mechanically natural and accepted wheel/stance behavior remained unchanged.

After acceptance, record F1 in `docs/OWNER_CHECKPOINTS.md` and freeze it before moving to steering rods.

## Environment note

Canonical repo toolchain is exact Node 24.16.0 / npm 11.13.0. The current takeover environment has not yet demonstrated the full canonical runtime test path. Supplemental source/asset reproduction is green, but do not relabel it canonical until exact toolchain execution exists.
