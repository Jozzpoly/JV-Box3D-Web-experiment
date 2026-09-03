# Wheel mode5 interruption recovery — 2026-09-03

This checkpoint exists because a long browser-orchestrated R&D run lost user-visible continuity. It is a recovery aid on an experimental branch, not product authority.

## Authority / protection

- Accepted `main` remains `5b28cc03d22264010680deb95a04abd04661bc22`.
- `preview/owner.json` still points to accepted source `529ae7d3e6d09faf2cfdd5bb034b01c693f8f9c0` and JSPREV2 `a325c279cfe63a0607dba33c3c635a1716e09f8f`.
- Do not change accepted main or the Owner Preview pointer during this research.
- Source research branch before recovery checkpoint: `work/wheel-mode5-d-pathology-2026-09-03` at `2197a24de50569bb6779a22b3cd5ac30c52b1370`.

## Recovered classification

### EXECUTED EVIDENCE — current C remains rejected

Owner-visible C is not accepted. Earlier diagnostics established that the current filled profile can report wheel contact while the exact Tire mesh is visibly separated. C remains a causal control only.

### EXECUTED EVIDENCE — earlier dead ends / narrowing

Recovered working-state reasoning and repo evidence show that the research already explored and rejected/contained several alternatives before E0:

- compound/sectorized torus variants caused excessive contact multiplicity, rolling resistance and/or faceting;
- PreSolve/witness filtering could reject obvious bore witnesses but did not recover correct onset broadly enough to be the solution;
- NEAREST1 demonstrated that reducing simultaneous support contacts can remove much of the drag, but discrete sector ownership still produces unacceptable periodicity/faceting;
- a simple circular torus cannot reproduce the Tire's full axial outer profile and inner void simultaneously.

These findings motivate a single continuous generalized annular profile rather than another multi-shape compound.

## E0 — annular representability gate

Commits through `55e2d86175c3ac5ba8849eb9aa4446fb6f7b8630` added a geometry-only oracle. No solver/native runtime change was required.

Input authority:

- exact rigid Tire piece, 396/396 non-degenerate triangles;
- verified R1 wheel-marker frame;
- requested width `0.4375 m`;
- recovered outer radius about `0.5455107635 m`;
- recovered inner bore profile from 129 axial slices.

The oracle compares:

- exact Tire mesh over 31 wheel spin phases;
- an axisymmetric annular solid generated from the same Tire;
- outer policies `MAX` and `P75`;
- angular discretization 64 vs 128 only as a numerical oracle-convergence check, not as a proposed compound collider.

Scope: 9 selected procedural rocks × 6 directions = 54 cases.

### E0 result

- 64→128 hit topology mismatch: `0` for both MAX and P75.
- P75-128: `0` false positives vs all exact phases and `0` false negatives vs any exact phase across all 54 cases.
- P75-128 numerical onset difference vs 64: median ~`0.005 mm`, p95 ~`0.504 mm`, max ~`0.657 mm`.
- P75 was materially more representative of the multi-phase Tire envelope than MAX: many MAX cases sit near the most protruding tread phase, while P75 generally tracks the representative smooth envelope.
- Small residual excursions outside the 31-phase sampled envelope were sub-millimetric; none exceeded 5 mm.

The geometry-only gate therefore did **not** falsify the generalized annular profile direction.

## E0b — historical provenance + explicit bore topology

Commits:

- `0d93864279deabe06c9a06f753878e7fa3b04255` — add E0b gate
- `ecc00157a13fd4cfa700b12beffb917830d9e153` — run E0b gate

Workflow `33745920662` completed successfully.

### Important provenance correction

The literal historical phantom rock geometry:

- half extents `(0.0599165943, 0.0454778222, 0.0646366016) m`
- rotation `(0.0003777314, 0.2446673045, 0.0000953154, -0.9696070123)`

matches current procedural rock index **45**, not 357. The old `357` label came from a ranked/sliced diagnostic index and must not be used as procedural-world provenance.

### Historical literal side-low case

Direction: normalized `(0.15, -0.25, 1)`.

Across 31 exact Tire phases:

- hit count: `23/31`;
- exact onset range: `0.1626201009 .. 0.1735420214 m`;
- exact phase median: `0.1672561846 m`;
- P75 annular-128 onset: `0.1700003025 m`;
- annular onset is inside the exact phase envelope (`outsideBy = 0`).

### Bore controls

Using a `30 mm` half-extent probe box swept through the wheel bore:

- center: `0/31` exact hits, no annular hit;
- +50 mm radial offset: `0/31`, no annular hit;
- +80 mm: `0/31`, no annular hit;
- +100 mm: grazing contact (`27/31` exact phases), annular onset inside phase envelope;
- +120 mm: contact in all `31/31` phases, annular onset inside phase envelope.

This is the strongest geometry-only evidence that the annular topology preserves the Tire hole rather than recreating the filled-profile phantom.

## E1 — interrupted native diagnostic spike

The interruption occurred after two E1 preparation commits but before a validated E1 build/run:

- `eb00ab2b66904b718410eabebf7be1e4d8cc68b2` — `tools/wheel-mode5-e1-write-annular-native-header.mjs`
- `2197a24de50569bb6779a22b3cd5ac30c52b1370` — `tools/wheel-mode5-e1-patch-bindings.py`

### Intended E1 architecture

This is **not yet a vehicle collider**.

- Generate a native header from the same 129-station P75 outer profile + recovered inner bore.
- Build one closed annular triangle surface in native memory (outer surface, inner surface, annular axial ends).
- Do not register thousands of Box3D shapes.
- Reuse Box3D's low-level hull-vs-triangle manifold builder for a diagnostic box probe.
- Explicitly gate accepted candidate separation with a caller-provided `acceptanceSkin`; first gate uses `0 m` to avoid inheriting a 20 mm speculative contact envelope.
- Return one selected native boundary manifold candidate plus telemetry; do not yet alter the solver/contact graph of the vehicle.

## E1a — recovered and executed native static oracle

Recovery branch:
`work/wheel-mode5-recovery-checkpoint-2026-09-03`

Recovery checkpoint commit:
`ebbe5e95366c96889912be321184683d2cd216d5`

E1a additions:

- `36b6c50049b085955ce37c704626ff5fb517cd89` — native oracle driver;
- `86e09068bdabfae1a6d9a7fa75605f27f5790268` — workflow.

Workflow:
`33761240785`
job:
`100667812161`
result: **SUCCESS**.

The patched Box3D.js build, upstream smoke tests, generated P75 annular header and native binding all compiled and executed successfully.

Generated native profile:

- 129 axial stations;
- 64 angular sectors for the native diagnostic surface;
- `33024` surface triangles;
- inner radius range `0.1312499866 .. 0.2624999853 m`;
- outer P75 range `0.5056460202 .. 0.5455107509 m`.

### E1a zero-skin results

Historical literal phantom case:

- E0 P75-64 onset: `0.1700947544113708 m`;
- native zero-skin onset: `0.17009475708007812 m`;
- difference: ~`2.67e-9 m`;
- accepted native separation at onset: `-7.45e-9 m` (effectively zero, not speculative positive separation);
- exact Tire phase median: `0.167256184632239 m`;
- native onset remains inside the exact Tire phase envelope.

Bore controls, zero skin:

- center: no contact through full sweep;
- +50 mm: no contact;
- +80 mm: no accepted contact despite broad/raw triangle candidates;
- +100 mm: native onset `0.160062837600708 m`, only ~`0.00780 mm` from E0b annular onset;
- +120 mm: native onset `0.16158034483591716 m`, only ~`0.00031 mm` from E0b.

### 20 mm acceptance-skin causal control

For the same historical literal case:

- zero-skin onset: `0.1700947571 m`;
- 20 mm-skin onset: `0.2044052649 m`;
- early-contact lead along the oblique approach path: **`34.3105 mm`**;
- accepted separation at that early onset: `0.0199999958 m`.

This is strong executed evidence that the generalized annular geometry itself can preserve the Tire bore and reproduce the E0/E0b boundary in native Box3D collision math, while a 20 mm positive-separation acceptance policy independently recreates a large visible early-contact effect.

E1a is still a **static collision oracle**, not a solver-integrated vehicle collider.

## Current research verdict

- Filled C: rejected.
- Witness filtering of a filled shape: rejected as solution.
- Multi-shape/sectorized rolling compounds: poor direction because contact multiplicity/faceting/rolling loss were demonstrated.
- Generalized annular P75 topology: **survives E0, E0b and E1a**.
- 20 mm acceptance/speculative envelope: demonstrated causal source of substantial early contact and should not be inherited blindly.
- Dynamic rolling/contact continuity remains **NOT VALIDATED**.

## Next bounded gate

Before solver integration, test the remaining high-value risk directly:

**E1b — native contact-continuity oracle.**

Sweep wheel spin phase against representative flat-ground and oblique/small-obstacle cases while using the E1 native annular manifold query. Measure:

- contact onset continuity;
- normal-angle continuity;
- contact-point continuity;
- station/sector ownership transitions;
- 64-sector vs a higher-resolution diagnostic surface as a convergence control.

Purpose: falsify triangle-faceting or contact-patch hopping before investing in a solver-integrated custom shape.

Only if E1b is satisfactory should the project proceed to a dynamic single-manifold/native-shape spike. No Owner Preview or accepted product change is implied by E1a/E1b.
