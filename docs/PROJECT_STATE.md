# JV-Web — current project state

Updated: 2026-10-11
Owner: Jozz
Status: `POLISH CAMPAIGN 2026-10-10/11 ON work/polish-campaign-2026-10-10 / AWAITING OWNER DEVICE VERDICT`

This is the single live current-state router for JV-Web. Live Git/current files, exact executed evidence and direct scoped Owner judgement outrank this document.

## 1. Current boundary

The repository/baseline hardening campaign from 2026-09-06 remains **closed**. Do not restart it merely because a new chat or executor exists.

JV-Web is in bounded product iteration:

`small need -> smallest sensible change -> causal validation -> Owner judgement when needed -> consolidate -> next need`

The spawn-location uncertainty is now closed for normal product work. Do not reopen geometry heuristics or A/B/C comparison unless new Owner evidence shows an actual spawn problem.

## 1a. Polish campaign 2026-10-10/11 (Claude, Owner-commissioned)

Owner request: autonomously polish, repair and finish JV Web as a complete simple driving sandbox without technical debt, fit for the Medium library (the library card links/embeds the playable build).

Branch: `work/polish-campaign-2026-10-10` (pushed). `main` was fast-forwarded only for the first commit (red-main repair, below). Everything else waits for Owner device judgement before promotion.

### EXECUTED EVIDENCE — shipped on the campaign branch

| Slice | What changed | Evidence |
|---|---|---|
| Red main | `main` had been red since the 2026-09-13 spawn slice (527/529): two source-shape tests still encoded the old labels/loader. Reconciled, no product change. | full `npm run build` green; FF to `main` `5c3830c` |
| Behavior tests | New headless harness (`tests/helpers/headless-vehicle.mjs`) + `tests/vehicle-driving-behavior.test.mjs`: exact product rig on Box3D, player-level thresholds. | runs < 1 s |
| Brake vs throttle | Brake used to cancel throttle entirely (throttle 1 + brake 0.05 → 0.0 km/h). Now brake-override blend: drive × (1 − brake) − brake torque. Resting brake trims, full brake always wins with full 650 Nm/wheel. | RED → GREEN behavior test |
| Rack wind-up | Released rack slid to full lock in corners (5 kg rack with nothing carrying it but friction; car tightened its own turn). Frame force now supplied; no centering. | 0.045 → 0.0755 m in 0.5 s before; 0.045 → 0.048 m over 3 s after |
| Symmetric front | FR mirrors the source FL geometry (carrier + steering revolute) instead of a generic wishbone. Vehicle was ~2 cm lower on the left at rest; now level, mirrored toe. Still the accepted kinematic bridge. Topology 20 bodies / 29 joints. | coilovers 0.577/0.606 vs 0.598/0.627 → 0.542/0.542 and 0.617/0.617 |
| Power profile | `JV_WEB_DRIVE_TORQUE_SCALE = 1.5` over the native 320 Nm/wheel (receipt untouched). | 0–50 km/h 5.35 s → 3.48 s, no wheelspin |
| Debt cleanup | 5 unreachable source files + their tests removed; 7 dated audits/takeover docs → `docs/archive/`; AGENTS.md prefers behavior tests. | suite green |
| Explicit composition | `product-main.ts` no longer replaces `globalThis.fetch`; `configureScenePackageTransform()` composes the spawn, revalidated. | Plac/Offroad/Skan/custom-start verified in browser |
| Product copy | "Jozz Vehicle" name/title/meta; Polish driving HUD ("Gaz 80%", "Hamulec 40%", "Lewo 50%"); status pill only for loading/faults; touch labels KIEROWNICA/HAMULEC/GAZ. Release validators were still expecting "M6 Drive"/"Plac E2R" (Friends export was silently broken) — reconciled. | screenshots desktop + phone |
| World readability | Procedural detail tiles via world-contract surface tags: Offroad grass/dirt, Plac concrete slabs. Presentation only, no assets. | screenshots |
| Embedding | Keyboard never reached the game inside an iframe (camera pointerdown preventDefault blocked focus). Canvas now takes focus on click. | cross-origin iframe: click + W → 18 km/h |
| Loading | Centred loading/fault overlay (phones previously showed a black screen: header is hidden on mobile); scan start says "Ładowanie skanu terenu (ok. 100 MB)…". | throttled-network screenshots |

### NOT VALIDATED — needs Owner device verdict (Samsung A53 / Chrome)

- power 1.5× and brake-override feel; symmetric-front handling;
- HUD wording and loading overlay on the phone;
- Plac/Offroad detail tiles look (taste);
- no Friends/Public promotion has been made.

### Steering self-return — evidence, not shipped

`docs/evidence/STEERING_RETURN_PROBE_2026-10-10.md`: explicit virtual tie rods are unstable (negative knowledge); physical tie rods in the solver *do* produce self-alignment (21 km/h: 0.045 → ~0.007 m in ~1 s) but the current steering-arm geometry gives only ~15° lock and needs rig authoring (arm length, Ackermann, zero rest toe, bump-steer). Owner/JURE decision.

### Owner: delete manually on GitHub

```text
JV-Box3D-Web-experiment  work/stale-spawn-assertions        (merged into main)
JV-Box3D-Web-experiment  work/spawn-qol-2026-09-13          (merged into main)
JV-Box3D-Web-experiment  work/spawn-landmark-capture-2026-09-06  (archived: tag archive/jv-web-repo-cleanup-2026-09-06/preview/spawn-landmark-capture = same commit c2481f9)
JV-Box3D-Web-Public      preview/p1-2-owner                 (README already calls it redundant)
```

The agent proxy refuses ref deletion and tag creation, so these stay for the Owner.

### Measured, not acted on

Straight-line drift above ~100 km/h is chaotic with solver substeps on both baseline and candidate (baseline 4/8/16 substeps: +3.1/−7.1/−11.3 m over ~130 m) — numerical, not geometric.

## 2. Canonical product and steering baseline

Live source/documentation authority is always:

`Jozzpoly/JV-Box3D-Web-experiment/main`

The accepted mechanical steering baseline remains Steering I1:

`529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0`

Detailed baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Accepted Steering I1 truth still includes:

- Direct Rotation and Relative-X as explicit touch steering alternatives;
- semantic `RELEASE` instead of hidden pointer return-to-zero;
- hands-off presentation following physical rack state;
- re-grab anchored to live rack state;
- supported wheel ranges 360/540/720/900/1080 degrees;
- 900 degrees as current default/current-best;
- no Owner-facing artificial centering;
- useful natural physical self-return still unresolved.

The 2026-09-13 spawn slice changes product entry/location QoL only. It does not alter vehicle physics, drivetrain, steering mechanics, rig topology or accepted JSPREV2 content.

## 3. Accepted spawn / custom-start slice

Owner evidence on 2026-09-13:

- all three geometry-supported scan candidates A/B/C were judged broadly acceptable;
- no further semantic ranking between them was considered worth additional iteration;
- a lightweight way to create personal spawn points was considered useful.

Product decision:

- candidate **B** is the single product-facing `Skan` start;
- A and C remain supported only as retained evidence/debug-compatible routes, not product choices;
- product location UI is `Plac / Offroad / Skan` rather than exposing calibration A/B/C;
- every scan-backed start exposes `Zapisz start`;
- `Zapisz start` captures current chassis X/Z and creates a reusable URL using `jvSpawn=scan-custom` plus finite `jvSpawnX/jvSpawnZ`;
- saved links do **not** persist chassis Y; reopening re-resolves height against the live scan collision surface and fails closed when no drivable surface exists;
- normal location choices clear custom X/Z query state.

Runtime candidate validated before closure:

`2672c634a62d85a81e57b52d71ffadf13458ee46`

Executed Owner Preview gate:

`JV Owner Preview Pages` run `34756565275`

Result:

- exact spawn source resolution: PASS;
- canonical Node/npm setup: PASS;
- accepted executable validation: PASS;
- accepted JSPREV2 verification: PASS;
- focused spawn tests: PASS;
- TypeScript typecheck: PASS;
- portable candidate build: PASS;
- build identity/provenance checks: PASS;
- isolated spawn composition proof: PASS;
- accepted root byte-identity outside experiments: PASS;
- Pages artifact upload: PASS;
- Pages deploy: PASS.

The immediately preceding broader A/B/C + custom-start candidate `231023edcd1bab66bfb11fe015e9a370db0357a6` also passed the same qualification/deploy path. The later `2672c634...` candidate is preferred because it removes calibration-choice clutter from the product surface without changing the underlying evidence routes.

## 4. Owner Preview

`preview/owner-control` remains operational composition/publishing infrastructure, not product source authority.

As of the 2026-09-13 spawn closure it pins the exact spawn candidate `2672c634a62d85a81e57b52d71ffadf13458ee46` together with the accepted JSPREV2 static layer:

`Jozzpoly/JV-Box3D-Web-Public@a325c279cfe63a0607dba33c3c635a1716e09f8f`

The Preview workflow also continues to carry historical/experimental wheel compositions. Their presence in Preview does not imply product acceptance.

## 5. Closed / retained evidence

### Spawn calibration

Classification:

`OWNER ACCEPTED ENOUGH / PRODUCT CHOICE COLLAPSED / CLOSED`

The earlier geometry analysis remains useful provenance, but there is no current need for more road-detection heuristics, more candidate ranking or a spawn-manager subsystem.

### Wheel mode5

Classification:

`RQ2C_ORIENTATION_HOLD / CLOSED`

The failed zero-degree support/rolling-slip gate remains negative evidence. Do not reopen the sequence merely for completeness or tune it to manufacture PASS.

### Visual wheel width

Classification:

`READY FOR OWNER JUDGEMENT / VISUAL ONLY / UNPROMOTED`

The retained width variants remain visual-only evidence and do not change physics/contact/radius/wheel centers/rig authority.

## 6. Current open questions

Spawn no longer controls the schedule.

Material open product/research questions include:

- useful natural physical steering self-return;
- visual wheel presentation / width judgement;
- sphere-based legacy wheel/contact representation and broader asset/visual/physics coherence;
- broader handling/mechanical fidelity questions not resolved by Steering I1;
- product-vs-laboratory UI separation where diagnostic controls materially interfere with `link -> load -> drive`.

The current wheel backend still uses the accepted legacy split representation until separate evidence justifies replacement. Do not treat visual asset markers as physics authority by implication.

## 7. Likely next frontier

If no newer Owner need supersedes it, the strongest major research candidate remains:

**Wheel Representation R0 — asset / visual / physics coherence.**

However it should not be entered merely because it is fundamental. Prefer a smaller product/feel slice first whenever it can produce more useful Owner evidence at substantially lower cost.

The first wheel-representation boundary remains:

`AUTHORED HINT -> VALIDATED VISUAL CALIBRATION -> ACCEPTED PHYSICS REPRESENTATION`

## 8. Authority / reading order

For fresh continuation:

1. live Git and exact executed evidence;
2. `AGENTS.md`;
3. this `docs/PROJECT_STATE.md`;
4. focused baseline/evidence documents only when the current question requires them.

`README.md` is project identity/setup, not the live state ledger.

`docs/HANDOFF.md` is a compact continuation entry point, not competing authority.

`AI_PROJECT_MEMORY.md` is a compatibility pointer, not another mutable state ledger.

## 9. Do not do by default

- do not restart old takeover or repository-cleanup campaigns;
- do not reopen spawn A/B/C comparison without a new product problem;
- do not build a spawn manager, named-slot system or editor merely because custom links now exist;
- do not reopen RQ2C/yaw/solver micro-forensics by sequence inertia;
- do not promote visual-wheel/wheel-mode5 experiments without missing Owner/product evidence;
- do not silently restore artificial steering centering;
- do not upgrade `box3d.js` as routine housekeeping;
- do not modify GitHub Actions without explicit Owner approval;
- do not confuse a green technical gate with proof that unresolved vehicle mechanics are finished.

## 10. Immediate continuation

The spawn slice is closed after consolidation.

Normal continuation is:

`re-ground current product feel -> choose the smallest high-value friction/fidelity slice -> execute -> validate -> use Owner judgement only where it contributes unique evidence`
