# JV-Web — current project state

Updated: 2026-10-11
Owner: Jozz
Status: `POLISH CAMPAIGN 2026-10-10/11 ON work/polish-campaign-2026-10-10 / AWAITING OWNER DEVICE VERDICT` + `JASKINIA WINDOW LANE ON work/jaskinia-okno-2026-11-21 (on top of the campaign)`

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

## 1b. Jaskinia window lane 2026-11-21 (Opus Code, Owner-commissioned)

Owner, 2026-11-21, about JV and Jaskinia (his own repository of agent work): JV may be changed boldly and adapted to what Jaskinia needs; Jaskinia should be able to take JV into many windows and show separate windows with sliders for it.

Branch: `work/jaskinia-okno-2026-11-21`, on top of `work/polish-campaign-2026-10-10` (the campaign above was never deployed to any preview: the Owner Preview workflow accepts only its pinned source commit, so the campaign still waits for a build the Owner can open).

| Slice | What changed | Evidence |
|---|---|---|
| JV speaks the Jaskinia window contract | `src/product-jaskinia.ts`: silent unless the framing page says `{jaskinia: 1, type: "hi"}`. Then `hello`, `state` (place, speed, Moc, Hamulec, build), `signals` (speed, frames per second), `event`, `flag` on Ctrl+. Generation 1 is the old Jaskinia Studio instrument contract; with generation 2 (`okno/2`) JV also reads its knobs `jv.moc` and `jv.hamulec` from the Jaskinia settings and applies them live as the nearest allowed Moc / Hamulec choice, re-reading on `changed`. | `tests/jaskinia-okno.test.mjs` (8 tests, each with a control); suite 544/544; 10 of 10 mutations of the module killed |
| Speed for the host | `main.ts` exposes the forward speed the HUD already shows (`getProductForwardSpeedKmh`). | typecheck, suite |
| Listener before the first await | The first real browser run showed JV silent: the host says hi once, when the frame has loaded, and the listener was installed after the runtime import. Now it is installed before it; speed is read lazily. | portable build `77e76ee`, run in headless Edge against a minimal host speaking the Jaskinia contract, single hi as the real host does: new host (generation 2) answers and applies Moc 2× / Hamulec 1,3× and Moc 1× / Hamulec 0,7× live; old Studio host (generation 1) answers with state and signals, no settings read; control build `233692c` (campaign without the module) stays silent even with hi repeated |
| Tab follows the knobs | A screenshot of JV in the host window showed the Moc tab still highlighting 1,5× while the vehicle already drove at 2× set from Jaskinia. The vehicle settings now notify listeners on every change, whoever made it, and the Moc / Hamulec rows re-sync. | `tests/jaskinia-okno.test.mjs` TJ9 (with an unsubscribe control); suite 545/545; second screenshot in the same run highlights Moc 2× and Hamulec 1,3×, matching the state sent to the host |
| Native JV core sliders as live knobs | Owner, 2026-11-21: JV core had many sliders very important to him and JV Web never exposed them. `src/vehicle/m6/m6-live-parameters.ts`: 14 knobs from the native M5 drivable lab (drive torque and speed, brake torque, suspension stiffness, damping and front/rear scale, tire friction, steering stiffness and damping, contact stiffness, damping and push speed, gravity), applied live through Box3D setters by the world before its next step and by the controller per step; a reset or respawn carries the values in force. His native rule (2026-07-09) holds: any finite value is taken, absurd ones included; only a negative of a quantity the solver cannot take negative is clamped, and visibly. Moc / Hamulec from Jaskinia are no longer snapped to the tab presets (the tab keeps its presets). With nothing ever set nothing is applied. | `tests/m6-live-parameters.test.mjs` LP1–LP8 on the real vehicle (each with a control: torque 0 holds the car also after a reset, tire friction 0.05 halves acceleration because Box3D mixes it with the ground by geometric mean, soft springs sit lower, low gravity lifts the car, stiff steering turns in further, a respawn keeps the values); suite 553/553; mutations 10/10 (including a silent ceiling at the slider maximum) and 11/11 for the bridge |

Known limits: knobs flow from Jaskinia to JV only; a change made in the JV tab is reported in `state.data`, not written back. Mass and geometry sliders of the native lab (chassis extents and density, wheelbase, track, rest drop, wheel density, cylinder sides) need a vehicle rebuild and are not live knobs yet. Standalone JV is unchanged (no message leaves the page when it is not framed and greeted). Not accepted; nothing here touches the Owner Preview or the public build.

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
