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

This is the strongest current evidence that the annular topology preserves the Tire hole rather than recreating the filled-profile phantom.

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
- Explicitly gate accepted candidate separation with a caller-provided `acceptanceSkin`; first gate should use `0 m` to avoid inheriting a 20 mm speculative contact envelope.
- Return one selected native boundary manifold candidate plus telemetry; do not yet alter the solver/contact graph of the vehicle.

### E1 status at interruption

- Header generator: written, not independently executed in CI after interruption.
- Binding patcher: written, not yet proven to compile against the pinned Box3D.js source.
- Native probe workflow: **not yet present**.
- Vehicle/runtime integration: **not started**.
- Owner preview/publication: **not touched**.

## Next bounded gate

**E1a — compile + native static oracle only.**

1. Build against the same pinned Box3D.js + donor wheel patch family used by the current mode5 diagnostic runtime.
2. Generate the E1 native profile header and patch bindings.
3. Prove the new native probe compiles/exports.
4. With `acceptanceSkin = 0`, reproduce:
   - literal historical phantom case;
   - center/50/80 mm bore no-hit controls;
   - 100 mm grazing and 120 mm contact controls.
5. Compare native onset with E0/E0b annular onset. A few millimetres may be tolerated for discretization/manifold semantics; centimetric early contact is a falsifier.
6. Record `acceptanceSkin = 20 mm` only as a causal control, not as an accepted setting.

Only after E1a passes should research consider a dynamic single-manifold/native-shape spike. No product/runtime adoption is implied by E1a.
