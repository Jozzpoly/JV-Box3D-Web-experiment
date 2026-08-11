# AI project memory — JV Web

Updated: 2026-08-11
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / S2 FL CORNER ROLES ACTIVE`
Owner: Jozz

This file is a short router, not project history. Current Git, exact execution evidence and direct owner observation outrank documentation.

## Product direction

JV-Web should increasingly feel like a real browser expression of Jozz's own game: worth launching, driving, tuning and showing to friends.

Current campaign: recover the owner vehicle until its mechanical structure is visually readable and coherent. Work one attributable interface/constraint at a time. Do not hide unresolved local rigging with stance or downstream tuning.

Handling/stability/steering-feel recovery remains deliberately deferred until visual/mechanical recovery closes.

## Current authority

```text
PRIVATE ACCEPTED / INTEGRATED PRODUCT
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

INTEGRATED PRODUCT CHECKPOINT
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

FROZEN S1 COLD TECHNICAL EVIDENCE
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908

PUBLIC FRIEND DEMO
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

NATIVE JV
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

The clean S1 integration is complete. The frozen S1 branch is no longer an integration blocker and must not be used as a second product authority.

## Integrated owner-accepted FL upper result

`main@67d66ed...` contains the minimal reviewed S1 result:

- `owner.fl.upper-arm` uses `PART_PAIR_ROLL_PINNED_STRETCH`;
- inboard X = midpoint of physical `upperFront` + `upperRear` X;
- inboard Y/Z = accepted S1-C semantic-main-chassis components;
- final inboard = constraint-composed visual attachment; literal mesh-contact claim = NONE;
- outboard = existing physical upper ball;
- static FRONT + TOP relationship OWNER ACCEPTED;
- real neutral suspension articulation OWNER ACCEPTED.

Clean integration used two bounded commits / eight files. The eight ported blobs are byte-identical to the reviewed frozen implementation on that surface. Package identity stayed 829944 bytes / `57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a`, with 59 real bindings and unchanged physics.

## Current bounded task

`S2-FL-ROLES — front-left corner landing / kinematic body-role validation`

Mode: validation-first / read-only / no production patch by default.

Purpose: before changing more geometry, prove that authored FL front-corner endpoints/pieces are associated with the correct moving M6 bodies/shared pivots through real runtime motion. Names are not authority; source hierarchy, current contracts, generated binding semantics and live coincidence/motion are evidence.

No new work branch is needed because this task has no remote write authority. If a role mismatch is found, return REPLAN and open a later repair transaction rather than patching inside S2.

## Near-term dependency direction

If S2 passes cleanly:

```text
S3 wishbones — likely FL lower next, preserving integrated FL upper
-> S4 upright / hub / wheel package
-> dampers / steering / cardans
-> stance
-> whole-rig visual integration
-> separate dynamics/feel recovery
```

Do not mirror FR merely because FL upper is integrated.

Owner feedback from the S1 live gate: the diagnostic line clutter made the motion harder to read. For the next owner-sensitive geometry gate, prefer minimal isolation/fixed FRONT+TOP/SIDE views if they materially reduce ambiguity; do not build tooling for its own sake.

## Implementer bootstrap

1. Resolve the exact CONTROL TIP supplied by the orchestrator.
2. Read current `AGENTS.md`.
3. Read current `docs/IMPLEMENTER_TASK.md`.
4. Inspect only source/tests required by the bounded question.
5. Do not preload old chats, archived branches or old task packets as authority.
