# JV-Web — current project state

Updated: 2026-09-01
Owner: Jozz

## 1. Current routing

JV-Web is in **bounded product iteration**, not strategic cold takeover.

The read-only strategic takeover state documented on 2026-08-26 has been superseded by subsequent Owner decisions, live implementation and executed evidence. Do not restart that campaign automatically.

JV-Web is treated as its own browser product/R&D surface. It is not NextGen JV Lite and is not required to converge architecturally with NextGen JV.

Default loop:

`small need -> smallest sensible change -> risk-matched test -> faithful render/device evidence -> Owner judgement -> next iteration`

## 2. Source and publication authority

### Source authority

`Jozzpoly/JV-Box3D-Web-experiment/main`

An accepted slice should be consolidated to `main` only after current source, evidence and documentation agree.

### Owner Preview

`preview/owner-control` is composition/publishing infrastructure. It points to an exact source commit and explicit static layers. It is not source authority.

### Friends/public artifact authority

`Jozzpoly/JV-Box3D-Web-Public/main`

The accepted JSPREV2 static layer remains independently pinned during current source experiments.

Historical work/checkpoint/noop branches are non-authoritative evidence/history unless explicitly reactivated.

## 3. Current milestone — Steering I1

Detailed baseline:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

### FACT

- Direct Rotation and Relative-X remain explicit touch steering choices.
- Pointer release defaults to semantic `RELEASE`; ordinary touch steering no longer commands automatic return to zero.
- Hands-off graphical steering follows the live physical rack state.
- New touch grabs re-anchor to the current physical rack position.
- Configurable touch wheel ranges: 360/540/720/900/1080 degrees.
- Default/current Owner-used range: 900 degrees total.
- Wheel-range preference is session-scoped.
- Artificial centering is not exposed as a product setting; any adapter-level artificial-centering support is retained only as a controlled test/reference path.
- The steering slice did not change vehicle topology, wheel/contact backend, drivetrain, rig geometry, scan geometry or steering-return physics.

### EXECUTED EVIDENCE

The exact steering candidate was validated through the canonical Owner Preview workflow:

- exact source checkout;
- canonical Node/npm;
- dependency install;
- typecheck;
- portable build plus automated validation/tests;
- build-identity verification;
- composition with unchanged accepted JSPREV2;
- executable-layer unchanged verification;
- Pages deployment.

A post-feedback audit removed the unneeded Owner-facing artificial assist and restored one accidentally deleted explanatory comment. The corrected source passed canonical source/build validation again before documentation consolidation.

### OWNER-OBSERVED

On the current 900-degree preview:

- hands-off wheel/rack synchronization worked;
- release -> physical steering movement -> re-grab no longer produced the previous steering UI/physics offset/jump;
- driving feel was substantially better than before and better than expected;
- Owner is currently learning 900-degree steering and is not comparing the other ranges yet;
- artificial centering was not used and is not wanted as a dependency.

### NOT VALIDATED / NOT FROZEN

- 900 degrees is current-best/default, **not final forever**.
- Other range presets have not received Owner feel comparison.
- Changing range during an active gesture is not an accepted interaction contract.
- Mobile session-persistence behavior was not separately Owner-checked in this checkpoint.
- Owner could not perform a comprehensive whole-product regression pass during this checkpoint.
- Natural physical steering self-return/self-alignment is still effectively absent under the tested conditions.

## 4. Accepted product/reference capital

Unless contradicted by newer scoped evidence, useful current product/reference capital includes:

- working browser driving on desktop and phone;
- Plac E2R, Offroad and accepted JSPREV2 surfaces;
- current vehicle/rig presentation;
- Camera Manual Rig V1 and fullscreen behavior;
- analog absolute-position pedals, D/R lifecycle and independent multitouch ownership;
- Direct Rotation + Relative-X steering foundations;
- fail-closed input/lifecycle behavior;
- accepted mobile composition and desktop capability/HUD work;
- A53/Chrome render-1x scan boundary and exact-source Preview/static-layer provenance discipline.

These are product/reference capital, not a claim that every underlying implementation is final architecture.

Pedal Contact + Mechanical Feedback V1/V1.1 remains rejected/deferred historical evidence and must not be resurrected as current-best without new evidence.

## 5. Product identity and cross-project routing

JV-Web asks roughly:

> How good, accessible and useful can a real Jozz Vehicle browser experience be on desktop and phone?

NextGen JV asks deeper construction/platform questions. JURE/JV_CORE/JES and other projects may provide research or donor ideas.

Cross-project knowledge may change hypotheses. It does not prove current JV-Web state and does not mandate architecture transfer.

## 6. Current open pressures

### Steering mechanics

There is no useful natural physical steering-wheel self-return today. A future bounded R2 may investigate the causal mechanism: geometry, contact, constraints, damping/friction, load transfer and other physically relevant contributors.

That research must begin by identifying what the current physical system actually does. It must not hide the problem with an automatic center command or fake spring simply because that improves UI feel.

### Steering tuning

900 degrees is currently good enough to learn and substantially improved the feel, but final range/sensitivity remains open to later Owner comparison.

### Broader product work

Camera, UI, controls, world/scan experience, performance and other product surfaces remain legitimate future slices. There is no fixed roadmap requirement that steering R2 must happen next.

## 7. What not to do next by default

- Do not restart the 2026-08-26 strategic takeover.
- Do not launch a broad Native/JV_CORE archaeology campaign.
- Do not turn JV-Web into NextGen JV Lite.
- Do not rewrite vehicle physics merely because an input/presentation problem exists.
- Do not promote artificial steering centering into product truth.
- Do not delete historical branches as a cleanup ritual.
- Do not treat 900 degrees as permanently frozen without comparative Owner evidence.
- Do not claim broad device/product acceptance from this scoped steering checkpoint.

## 8. Natural next decision boundary

The Steering I1 stage is ready for consolidation when:

1. the corrected exact source passes canonical validation;
2. this documentation matches live source and Owner evidence;
3. `main` is re-verified as the candidate's ancestor;
4. the validated candidate is promoted to `main` without force.

After that, stop at the milestone boundary. Re-ground before selecting the next product/research slice.
