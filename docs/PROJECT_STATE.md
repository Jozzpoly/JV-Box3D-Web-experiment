# JV Web — accepted project state

Updated: 2026-08-11
Owner: Jozz
Status: `R0 PUBLISHED / R1 ACTIVE / S1 FL UPPER INTEGRATED / S2 FL CORNER ROLES ACTIVE`

This document describes accepted/integrated product state and the current durable boundary. It is not an experiment log.

## 1. Product authority

```text
Private accepted/integrated authority:
Jozzpoly/JV-Box3D-Web-experiment
main
(resolve live tip before every write)

Integrated FL-upper product checkpoint:
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450

Frozen S1 cold evidence:
work/owner-rig-s1-attachment-authority
393ef4600be5c83ef42bced4a8a451446e372c32
tree: 92c896a8b0579a66b3c5381b777baf853a469908

Public R0:
Jozzpoly/JV-Box3D-Web-Public
release/r0
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44

Native JV:
Jozzpoly/Box3d_FunProject
read-only reference for this campaign
```

`main` is the product. Frozen/candidate branch names are evidence or transaction pointers, never parallel product authority.

## 2. Product goal and campaign

Goal: a browser friend-demo that increasingly feels like Jozz's own game and is worth launching, driving, tuning and showing to friends.

Active lane: restore owner-vehicle visual/mechanical readability one attributable interface at a time.

Dependency principle:

```text
chassis / attachment frame
-> corner landing + kinematic body roles
-> wishbone relationships
-> upright / hub / wheel
-> dampers / steering / cardans
-> stance
-> whole-rig integration
-> later dynamics/feel campaign
```

Do not use downstream geometry, stance or handling changes to conceal unresolved upstream relationships.

## 3. Integrated S1 result

The clean curated integration candidate was independently reviewed and fast-forward promoted to `main`.

Exact integrated commit:

```text
67d66ed412342fee5445b2901d85a663a084bf4e
tree: f2e1836800719cc9cc7007631568c41e45471450
parent/control lineage: 220083612116ea055cc7ae39498bd59a61fbce70
integration shape: 2 commits / 8 files / no merge / no S1-history cherry-pick
```

Independent review confirmed the four product blobs and the four focused regression blobs on the curated surface are byte-identical to the exact reviewed frozen implementation.

Integrated package invariants remain:

```text
package: m6-owner-full-rig-r3
real bindings: 59
GLB bytes: 829944
GLB SHA-256: 57a20f3d54277d50f07afd56e5f4e00980b4386cdab74d23d3d09893cf45c28a
physics: unchanged
```

Automated candidate evidence was supplemental rather than canonical-toolchain evidence: focused tests 30/30 PASS, existing real-M6 runtime 1/1 PASS, plus a 180-frame neutral live regression reproducing the reviewed endpoint/frame behavior. GitHub CI was absent; do not call this a CI PASS.

## 4. Owner-accepted FL upper boundary

Accepted at current precision and now integrated:

- static FRONT + TOP chassis-side placement;
- inboard X from physical upper hinge-axis midpoint;
- inboard Y/Z from the accepted semantic-main-chassis calibration;
- no literal mesh-contact claim for the composed inboard point;
- existing physical upper ball preserved as outboard;
- `PART_PAIR_ROLL_PINNED_STRETCH` behavior through real neutral extension/compression/rebound/rest.

Still NOT accepted by this result:

- FR upper;
- FL lower wishbone;
- final wheel-side upright/hub/wheel package;
- dampers/springs;
- steering geometry;
- cardans;
- mesh proportion/scale;
- stance;
- handling/dynamics/feel.

## 5. Current unresolved visual truth

Owner-visible/recovered evidence still says:

- wheel-side upright/hub/suspension package is buried in the wheel region;
- dampers/springs are visibly wrong and enter/intersect the wheel region;
- cardans visibly miss proper mating, especially differential-side;
- final stance likely needs to sit slightly higher;
- global wheel placement cannot be accepted while surrounding corner geometry is incoherent;
- FL upper mesh proportion/stretch is imperfect but deliberately deferred unless later correct rigging requires changing it.

Dynamics/handling/steering controllability remain OWNER OBSERVED strongly regressed and deliberately deferred until visual recovery closes.

## 6. Current dependency question — S2 FL corner roles

Before another geometry correction, validate the current front-left authored corner landing / kinematic body-role mapping.

Current source contract includes non-obvious semantics, for example:

- `Socket_ChassisMount_b` is knuckle-side despite its name;
- `Socket_WheelCenter`, `Socket_SteeringRod`, `Socket_CardanHub` are knuckle-side;
- `Socket_SingleDamperLower` rides the lower arm;
- `Socket_ChassisMount_a`, `Socket_SingleDamper_Mount`, `Socket_SingleDamperUpper`, `Socket_CardanDrive` are chassis-side.

These declarations are evidence to validate, not truth to assume. A joint-shared endpoint may be represented in another body's local coordinates if the world-space joint point remains coincident through motion; do not require literal `ridesBody == partId` when the mechanics say otherwise.

S2 is read-only by default. If current roles/pivots/handed placement are coherent, close the technical dependency and proceed toward S3 wishbones. If not, return exact mismatch evidence and open a separate repair transaction.

## 7. Owner-validation ergonomics

The S1 live owner gate was accepted, but Jozz reported that line clutter made the relevant motion harder to read.

For the next owner-sensitive geometry decision, use minimal isolation and reproducible projection views when they materially improve attribution. T1/T3 remain lazy tooling: do not turn them into a separate project if disposable/focused presentation is enough.

## 8. Branch/cleanup note

`work/owner-rig-s1-clean-integration` now points to the same integrated commit as `main` and has completed its purpose. It should be deleted when a proper delete-ref operation is available.

Two accidental no-op refs, `noop-should-not-create` and `noop-should-not-create-2`, also point exactly at `67d66ed...`; they contain no unique product state and are cleanup-only. Current connector tooling exposes no delete-ref, so do not use these refs as development bases or evidence authority.

No new S2 work branch is created because S2 has no remote write authority.

## 9. Public boundary

Published R0 remains immutable. R1 publication waits for meaningful integrated owner-visible progress; do not rebuild R0 in place.
