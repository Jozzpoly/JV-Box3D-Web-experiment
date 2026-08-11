# AI project memory — JV Web

Updated: 2026-08-11
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / S2 OWNER SEMANTIC VALIDATION PENDING`
Owner: Jozz

This is a router, not project history. Current Git, exact execution evidence and direct owner observation outrank documentation.

## Product direction

JV-Web should increasingly feel like a real browser expression of Jozz's own game. Current priority is owner-vehicle visual/mechanical recovery, one attributable interface at a time. Do not hide unresolved local rigging with stance or downstream tuning. Handling/stability/steering feel remain deferred until visual/mechanical recovery closes.

## Current authority

```text
PRIVATE PRODUCT AUTHORITY
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

INTEGRATED PRODUCT CHECKPOINT
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

FROZEN S1 COLD EVIDENCE
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32

PUBLIC R0
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

## Integrated accepted result

FL upper static placement + real neutral live articulation are OWNER ACCEPTED and cleanly integrated on `main` through `67d66ed...`. Preserve that result unless new evidence explicitly reopens it.

## Current S2 status

Technical S2-FL-ROLES evidence returned `REVIEW_READY`: source hierarchy, generated binding semantics and real M6 differential motion were mutually consistent with the proposed chassis/lower-arm/knuckle role map.

**This is NOT owner validation.**

Jozz explicitly stated that he has already gone through this kind of corner-interpretation stage with agents about three times and agents were confident while the resulting implementation was badly wrong. Therefore the project must not proceed to S3 based on technical self-consistency alone.

Current ACTIVE task: `S2-OWNER — owner validation of FL corner role interpretation`.

The owner must see a clear static map of the actual source rig plus a focused runtime demonstration of what we think belongs to chassis, lower arm and knuckle/upright, with shared pivots visible. Only after Jozz confirms/corrects this semantic model may the orchestrator close S2.

Known technical warnings to preserve:

- authored `Socket_SteeringRod` position differs from current physical steering arm by about 0.222 m; body role support is not steering-geometry acceptance;
- interface-audit cardan endpoint path is stale relative to current R3 semantics;
- worst S2 observed shared-joint residual was about 6.263 mm at lower ball; not classified as role swap, but preserve for later geometry work.

## Near-term direction

Only after S2 owner semantic acceptance:

```text
S3 wishbones — likely FL lower, preserving integrated FL upper
-> S4 upright / hub / wheel
-> dampers / steering / cardans
-> stance
-> whole-rig visual integration
-> later dynamics/feel recovery
```

Do not treat a green technical role ledger as authority over direct owner understanding.
