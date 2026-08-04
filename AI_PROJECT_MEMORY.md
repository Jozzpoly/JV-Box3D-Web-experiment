# AI project memory — JV Box3D Web

Updated: 2026-08-04
Status: `CANONICAL / READ_FIRST`
Owner: Jozz

## 1. Current mission

Prepare JV Web as a clean browser host for the same mechanical system as native Jozz Vehicle and as a future JES research surface.

Do not evolve a second product physics implementation in TypeScript.

Accepted architecture:

```text
Box3D source + portable native JV Core
                    ↓
          one WebAssembly module
                    ↓
      stable C ABI + immutable snapshots
                    ↓
        TypeScript input/render/UI host
```

Read:

```text
docs/PROJECT_STATE.md
docs/REFOUNDATION_LOOP_PL.md
docs/decisions/ADR-0003-native-jv-core-wasm.md
```

## 2. Active branch

```text
agent/jv-web-refoundation
```

Started from validated reference head:

```text
agent/f5-dynamic-steering-validation
0d938e402f618ae34e0d959a9862d97c2f88a926
```

All earlier stacked PRs remain untouched historical evidence. Do not merge or mark ready without Jozz.

## 3. Validated reference runtime

Latest pre-refoundation local evidence:

```text
Node 24.16.0
npm 11.17.0
TypeScript PASS
75/75 tests PASS
Vite production build PASS
browser startup and physical drive PASS
```

It provides:

- deterministic fixed-step host;
- timestamped steering and longitudinal timelines;
- real `box3d.js@0.0.2` WASM;
- receipt-derived current M6 graph;
- physical rack/tie-rods;
- `RELEASE | POSITION | RATE`;
- RATE candidates `0.06 / 0.12 / 0.21 / 0.36 m/s`;
- read-only WebGL observer;
- wheel-motor drive/reverse/coast/brake;
- dynamic rack-excursion matrix.

This backend is now classified as:

```text
backend id: legacy_ts_m6
role: reference/browser fixture
product physics authority: false
native parity: not proven
```

## 4. Critical drive mismatch

Native JV:

```text
maxDriveSpeed unit = rad/s
motor target = ±maxDriveSpeed
throttle scales available torque
wheel spin determines torque taper
```

Current TypeScript reference backend:

```text
maxDriveSpeed interpreted as m/s
target wheel speed = throttle * maxDriveSpeed / wheelRadius
chassis speed determines torque taper
```

With receipt values:

```text
maxDriveSpeed = 40
wheelRadius = 0.514062464
native target ≈ 40 rad/s
legacy TS target ≈ 77.8 rad/s at full throttle
```

Therefore successful drive, braking and deterministic replay are not native drive parity.

Do not add further product drivetrain, anti-roll, aero, tire or suspension mechanics to `legacy_ts_m6`.

## 5. Steering truth

Default realistic mechanics:

```text
rackCenteringHertz = 0
uprightAssist = false
```

`RELEASE` means:

- hands-on spring/servo OFF in the first fixed step;
- no target toward zero;
- no centre timer or centre hold;
- physical friction remains;
- physical caster/contact/linkage/inertia may move the rack;
- wheels may remain turned at standstill.

RATE remains a named experiment in physical rack-space. No profile is product-approved.

Dynamic measurement:

```text
stationary held excess: 0.000 mm
driving held excess:    <= 0.284 mm
post-RELEASE peak:       2.541–2.817 mm
contacts:                4
```

Interpretation:

- active command clamp works;
- small loaded limit compliance is measured;
- post-RELEASE mechanism is not isolated;
- do not force-clamp the rack before native comparison.

## 6. Wheel direction

Current backend:

```text
legacy_m6_split_sphere_sidewall
```

Role:

```text
regression baseline / fallback / failure-reference
```

It is not the future tire architecture.

Future Wheel Scope work must feed a replaceable native wheel/contact seam in JV Core. Deformation and pressure belong to the foundation of the future wheel system, not a later visual patch.

## 7. Refoundation loop

For every iteration:

```text
read current state
→ select one smallest contradiction
→ write hypothesis and invariant
→ create a falsifying test
→ make one minimal reversible change
→ validate at the correct evidence level
→ criticize the solution
→ compress state
→ improve the loop after 3–5 iterations
```

Full process:

```text
docs/REFOUNDATION_LOOP_PL.md
```

## 8. Documentation cleanup

Problem:

- about 11.5k lines of docs;
- many overlapping broad audits from one day;
- stale README and state claims;
- duplicated branch/status histories;
- old handoffs acting as pseudo-canonical state.

Active manifest:

```text
docs/DOCUMENT_CLEANUP_MANIFEST_2026_08_04_PL.md
```

Rules:

- extract durable knowledge before archive/delete;
- broad audits and handoffs move to indexed archive;
- receipts remain separate from plans/opinions;
- read-first chain stays at five items or fewer;
- do not create new broad audit or session handoff files.

## 9. Next program

```text
C1 compress active documentation front
C2 archive broad audits, handoffs and quarantine evidence
C3 remove obsolete one-shot workflows after preserving receipts
C4 expose legacy_ts_m6 identity in code/UI/trace
C5 define unit-semantic runtime contracts
C6 design versioned native ABI and stable part IDs
C7 build smallest native JV Core + Box3D WASM spike
C8 run native/WASM parity scenarios
C9 replace browser backend only after evidence
```

## 10. Non-negotiable workflow rules

- respond to Jozz in Polish;
- use GitHub connector and ordinary Git only;
- Git Diff Patcher Bridge is forbidden;
- do not shift routine repository work onto Jozz;
- no merge or ready transition without Jozz;
- no automatic workflows, self-modifying CI or cross-repo commit loops;
- no repeated Actions debugging;
- no owner-feel claim without Jozz;
- no parity claim from internal green tests alone;
- no hidden fallback or assist;
- no destructive deletion until unique knowledge is preserved and links are audited.

## 11. Local paths

```text
native:
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\box3d

web:
C:\Pliki_Joza\Gamo_devovo\Box3d_FunProject\JV-Box3D-Web-experiment\JV-Box3D-Web-experiment
```

GitHub does not prove local uncommitted state.
