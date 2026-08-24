# JV Web — recipient surface

Updated: 2026-08-24
Owner: Jozz
Grounded source: `Jozzpoly/JV-Box3D-Web-experiment@3ef7e98ca78475c9a75a7d32030bcc6c5386031d`
Status: `PRE-CODEX RECIPIENT GROUNDING / DONOR OUTPUTS NOT YET INGESTED`

This document maps the current JV-Web vehicle as a **recipient** of future donor evidence. It is not the cross-project Inheritance Matrix, does not claim current JV_CORE or JURE state, and does not authorize a runtime redesign before donor closure.

The purpose is narrower: identify which current Web surfaces are protected product strengths, which are provisional/legacy vehicle internals, where authored/runtime/visual authority is split, and what a later donor claim must prove before JV-Web changes.

## 1. Evidence boundary

The findings below are grounded in current JV-Web source and tests at the exact commit above.

They do **not** prove:

- current JV_CORE/Native donor state;
- current JURE donor state;
- native parity of the Web vehicle;
- final steering, wheel/contact, suspension, drivetrain or visual-rig architecture;
- that a donor implementation should be copied 1:1.

Cross-project donor output becomes JV-Web evidence only after its exact source/provenance and demonstrated result are independently grounded.

## 2. Current mechanical recipient chain

Current execution path:

```text
pinned Native factory receipt
-> m6TopologyConfigFromReceipt
-> M6TopologyWorld
-> M6VehicleController
-> createM6VehicleRuntime
-> Box3D bodies/joints/shapes
-> M6 trace + VehicleVisualFrameV1
```

### Whole vehicle runtime backend

**FACT:** the active M6 world reports `legacy_ts_m6`.

The backend contract itself states:

- role: `REFERENCE_BROWSER_FIXTURE`;
- `productPhysicsAuthority: false`;
- `acceptsNewProductPhysics: false`;
- native parity: `NOT_PROVEN`.

It also records a known drivetrain semantic mismatch: Native `maxDriveSpeed` describes a wheel-motor angular-speed/rev-limit concept, while the Web reference backend currently treats it as a chassis-linear target in m/s.

**Recipient consequence:** future donor physics should not be treated as a patch that must preserve this backend architecture. The current backend is a functioning browser/product fixture and evidence source, not a physics quality ceiling.

### Config and solver intake

`m6TopologyConfigFromReceipt()` currently imports a broad set of values from `NativeFactorySnapshot`, including:

- chassis dimensions/density/CG offset;
- axle/track/rest geometry;
- rack geometry and servo/friction values;
- wheel dimensions/material values;
- drive/brake/coast values;
- suspension rates/travel/preload;
- wishbone geometry parameters;
- world solver settings.

It also requires historical topology flags such as front/rear rig type 1, wheel envelope mode 3, no rack-centering assist and no upright assist.

**Recipient consequence:** later synthesis must classify each inherited Native value separately as one of: useful measured/calibrated evidence, portable semantic truth, provisional tuning, or historical implementation assumption. Receipt presence alone is not enough to preserve a parameter or topology.

### Suspension and hardpoint geometry

`m6WishboneHardpoints()` procedurally constructs wishbone/steering/coilover hardpoints from the M6 config for the general four-corner runtime.

Front-left is a special case. `m6FrontLeftSourceRegisteredHardpoints()` retains the current suspension hardpoints provisionally but removes their old steering-axis authority, adds a source-derived steering-arm endpoint and explicit source-derived steering axis, and creates a separate carrier->knuckle steering DOF.

The source comments explicitly state that this does **not** make the current suspension hardpoints, carrier topology or rack mapping final architecture.

**Recipient consequence:** later authored geometry must replace a coherent neutral mechanical unit. Do not transplant a donor hardpoint into the incompatible procedural wishbone shape.

### Steering mechanism

The active steering path contains deliberate bridges:

- rack travel/servo remains receipt/config driven;
- front-left rack->angle is explicitly named `m6FrontLeftProvisionalSteeringAngleFromRack`;
- the source-derived curve is amplitude-normalized to a temporary JV-Web full-lock requirement of at least 35 degrees;
- front-right does not use an equivalent proven physical tie-rod mechanism; the controller marks it `TEMPORARY_SYMMETRIC_KINEMATIC_FRONT` and applies the same target through spherical-joint twist limits;
- the controller explicitly disclaims contact->rack back-drive proof and final FR steering-axis/hardpoint authority.

**Recipient consequence:** steering input/control UX can remain protected while the underlying mechanical steering implementation is a high-priority challenge surface for later donor synthesis.

### Wheel/contact backend

Each wheel currently uses `legacy_m6_split_sphere_sidewall`:

- one sphere is the rolling terrain-contact shape;
- one cylinder/hull is the sidewall/non-terrain shape;
- category/mask filtering separates their contact roles;
- both are attached to the same dynamic wheel body.

The backend name and contract are explicitly legacy.

**Recipient consequence:** wheel/contact donor evidence should be judged against the observed strengths/failures of this split-envelope model, not against a requirement to preserve its shape decomposition.

### Neutral JURE-facing geometry seam

`src/vehicle/neutral-mechanism.ts` and `m6-neutral-geometry.ts` expose a small engine-neutral representation of bodies, frames and relations.

Current front-left projection is deliberately:

- read-only;
- derived from current procedural Web geometry;
- not a Box3D runtime input;
- not authored authority;
- not the future JURE serialized schema.

**Recipient consequence:** retain this as a comparison/lowering seam unless later evidence shows it is insufficient. Do not promote the current projected procedural geometry into authored truth.

## 3. Current visual recipient chain

Current product rendering path:

```text
assets/owner-vehicle/source + asset contracts + factory receipt
-> buildOwnerM6FullRigPackageR3()
-> generated public/vehicles/m6-owner-r3 package
-> strict vehicle visual package validation
-> VehicleVisualFrameV1 from live Box3D runtime
-> binding resolution / draw plan
-> M6OwnerVehicleLayer WebGL rendering
```

### R3 is build-generated, not committed authored output

The product loads:

`vehicles/m6-owner-r3/m6-owner-full-rig-r3.visual.json`

`predev` and `prebuild:bundle` run `generate:owner-full-rig`, which currently resolves to the R3 generator. R3 artifacts therefore derive deterministically at build time from tracked source assets/contracts/receipt.

**Recipient consequence:** generated R3 GLB/manifest is runtime evidence, not a new authored-source authority.

### R3 is a calibrated derivative of R2

`buildOwnerM6FullRigPackageR3()` starts from `buildOwnerM6FullRigPackageR2(input)` and then applies reference-calibrated geometry/binding changes.

Current tests prove deterministic generation and constrain the R3 blast radius. The R3 report itself distinguishes different treatments, including:

- FL source-rigid front wishbone treatment with deferred rig authority;
- FR legacy visual front wishbone treatment;
- front/rear authored-reference chassis patches;
- front/rear damper part-pair mappings;
- cardan differential-output to authored-hub part-pair mapping;
- wheel-mount visual interface calibration;
- other subsystems inherited from R2 byte layout.

The front-upper pilot is explicitly `VISUAL_ONLY...` and reports `physics: UNCHANGED`.

**Recipient consequence:** R3 proves that Web can bind complex moving authored pieces to live runtime motion, but successful visual calibration is not proof that the underlying mechanical runtime geometry is correct.

### Visual binding semantics already have useful extension points

`VehicleVisualBindingSourceV1` supports:

- `PART`;
- `SEGMENT_STRETCH`;
- `SEGMENT_ENDPOINT_AIM`;
- `PART_PAIR_STRETCH`;
- `PART_PAIR_ENDPOINT_AIM`;
- `PART_PAIR_ROLL_PINNED_STRETCH`.

`VehicleVisualFrameV1` supplies rigid part transforms plus dynamic segments such as coilover and steering-link endpoints.

Live R3 tests prove that 59 real R3 roots resolve against a real moving M6 and remain spatially attached through settle, steering and drive.

**Recipient consequence:** future donor/JURE work does not automatically require replacing the visual binding system. First determine whether a problem belongs to authored geometry, runtime mechanics, representation intent, or binding semantics.

## 4. Protected Web strengths vs challenge surfaces

### Preserve by default

These are product strengths or useful boundaries and should not be casually rewritten during donor inheritance:

- browser/mobile product shell and accepted controls;
- Direct Rotation / Relative-X control foundation;
- absolute-position analog pedals and accepted D/R multitouch lifecycle;
- current accepted mobile/desktop UI boundaries;
- Owner Preview exact-source/provenance workflow;
- scene/world loading and accepted JSPREV2 capability;
- strict visual-package validation and runtime asset ownership/budget gates;
- `VehicleVisualFrameV1` separation between runtime motion and render binding;
- small engine-neutral JURE comparison seam;
- current tracing/provenance facilities where they help falsify a replacement.

Preservation is scoped: a later focused experiment may improve any of these when evidence justifies it.

### Challenge explicitly after donor closure

These are current recipient surfaces with source-level evidence of provisional/legacy status:

1. whole `legacy_ts_m6` physics backend;
2. drivetrain semantics and longitudinal motor/brake balance;
3. `legacy_m6_split_sphere_sidewall` wheel/contact model;
4. procedural general wishbone hardpoints;
5. mixed FL source-registered vs FR legacy/procedural steering geometry;
6. temporary symmetric FR steering bridge;
7. provisional rack->angle/full-lock mapping;
8. separation between current R3 visual calibration and actual mechanical authority;
9. R2 inheritance inside R3 where later authored/mechanical evidence can replace it cleanly.

## 5. Donor intake falsifiers

These questions should be answered with exact donor evidence before any Inheritance Matrix cell becomes a concrete Web implementation decision.

### Rig / suspension

- Does the donor provide one coherent neutral mechanical unit rather than isolated hardpoints?
- Are units, basis, handedness, placement and source provenance explicit?
- Is the demonstrated donor geometry internally coherent and materially better than current procedural Web geometry?
- Which current runtime force laws/topology remain JV-owned after neutral geometry replacement?

### Steering

- Does the donor prove real steering-axis/tie-rod/rack geometry for both front corners?
- Does it support the desired lock range without an arbitrary amplitude normalization bridge?
- Is Ackermann/bump-steer/contact feedback actually demonstrated, or merely encoded?
- Can the mechanical replacement preserve accepted Web input semantics independently of the old runtime bridge?

### Wheel/contact

- What exact problem does donor contact evidence solve relative to the split sphere/sidewall model?
- Does it demonstrate terrain rolling, sidewall behavior, stability and performance under Web-relevant conditions?
- Which behavior is mechanical truth versus donor-engine-specific implementation?

### Feel / drivetrain

- Is a donor value a physical/semantic invariant, an Owner-approved feel result, or only legacy tuning?
- Does the donor evidence distinguish wheel-speed/torque semantics from chassis-linear target semantics?
- Does it address the known Web complaint space such as broad low power and brake dominance without coupling the result to donor-only architecture?

### Visual mechanics

- Is the visible misalignment caused by authored source geometry, runtime physical geometry, representation mapping or binding transform?
- Can a future authored damper/spring/cardan/wishbone mapping be expressed by current binding primitives without hidden calibration?
- If not, what is the smallest missing representation semantic demonstrated by a real rig?

## 6. Natural post-donor execution order

After JV_CORE and JURE donor closures are grounded:

1. build the cross-project Inheritance Matrix from exact donor evidence plus this recipient map;
2. challenge each proposed inheritance against current Web product strengths and known provisional seams;
3. select one coherent high-value replacement unit rather than redesigning the whole car at once;
4. preserve accepted control/product behavior unless the experiment explicitly targets it;
5. for JURE-authored geometry, validate schema/provenance/placement/neutral coherence before any runtime substitution;
6. isolate a risky JURE/runtime experiment on `jure/<specific-purpose>` only when the actual substitution begins;
7. test the causal blast radius first, then browser/render/Owner-device behavior;
8. integrate only after the replacement is demonstrably better and its authority boundary is clear.

## 7. Current stop condition

Until donor closure is available, do **not** implement a new substantial vehicle physics/rig/contact/drivetrain architecture from this document alone.

Useful pre-donor work is limited to recipient grounding, evidence correction and small non-behavioral preparation that reduces uncertainty for later synthesis. If new current-source evidence contradicts this map, correct the map before planning from it.
