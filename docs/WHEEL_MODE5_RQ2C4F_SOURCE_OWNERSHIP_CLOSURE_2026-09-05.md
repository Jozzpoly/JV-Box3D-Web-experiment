# Wheel mode5 — RQ2C4F source-ownership closure

Updated: 2026-09-05  
Owner: Jozz

Status: **SOURCE-GROUNDED PARTIAL / ROUTINE MICRO-FORENSICS CLOSED**

This record closes the exact source-ownership review opened by the trusted RQ2C4F rolling-pair localization. It does **not** turn the 0-degree qualification into a PASS and it does not authorize yaw, product promotion or a physics change.

## 1. Trusted starting evidence

Trusted RQ2C4F closure localization:

- branch result head: `5ffe5e0f206fc4d7f345ae4f66c7c086ab392ebc`;
- executed source: `a7d3389edf6c51664d5615d657e879109b161420`;
- workflow run `33973506632`;
- job `101326068112`;
- artifact `9971633765`;
- artifact digest `sha256:e0e32986831498022e0f05ae1bae039d3c6e48e136b335f90a3c4a588ff48c4a`;
- result: `docs/WHEEL_MODE5_RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION_RESULT_2026-09-05.md`.

RQ2C4F proved that the initialized 0-degree rolling pair is exactly closed and that the observed blocker emerges after dynamics begin. At the peak rolling-pair residual:

- rolling pair: `+0.034570694 mm/s`;
- COM tangential drift: `+0.004529953 mm/s`;
- axle-spin-rate contribution: `+0.030174406 mm/s`;
- geometric lever contribution: `-0.000109348 mm/s`.

The spin-rate term therefore supplies about `87.3%` of the peak rolling-pair magnitude. This is a kinematic result only.

The frozen actual-support witness remains:

`0.034093857 mm/s = 17.0469x` the `0.002 mm/s` qualification gate.

## 2. Exact apparatus source reviewed

The exact RQ2C4 composition is rooted in:

- `isaac-mason/box3d.js@2617a0ff763a60c9f17cee57c6ea72aab75a5077`;
- pinned `erincatto/box3d@8441b4a06d6d09dcfb0b0f704df4d847d1437b92`;
- recovered `B3X-WHEEL-001` donor delta from `Jozzpoly/Box3d_FunProject` `77a67132...241fe10a`;
- `tools/wheel-mode5/rq2c3/patch-rq2c3-parallel-linear-guide.py`;
- `tools/wheel-mode5/rq2c4/patch-rq2c4-parallel-hard-relax.py`;
- read-only RQ2C4D/E/F scenario instrumentation.

The wheel/contact donor delta does not replace the pinned `src/contact_solver.c`, `src/solver.c` or base `src/parallel_joint.c` solver laws. The RQ2C3/RQ2C4 patches extend ParallelJoint with the scalar local-Z translation guide and hard-relax lifecycle semantics.

## 3. What can change axial spin in this exact 0-degree apparatus

### 3.1 No external drive/brake torque

The RQ2C3/RQ2C4 scenario initializes matched rolling and then advances only with `b3World_Step(...)`. It does not apply the historical RH0 RQ2 drive/brake pulse.

This is important: the current RQ2C4F spin drift must not be explained using the separate RQ2a/RQ2b torque experiments.

### 3.2 No configured angular damping or rolling resistance

`b3DefaultBodyDef()` zero-initializes angular damping; the scenario does not override it.

`b3DefaultSurfaceMaterial()` zero-initializes rolling resistance and the scenario overrides friction/restitution only. The contact solver's rolling-resistance block is therefore inactive here.

Gravity acts through the body COM and supplies no direct axial torque.

### 3.3 Contact friction has an explicit first-order axial torque path

Pinned `contact_solver.c` resolves central tangential friction as a tangent-plane impulse `P` and updates angular velocity through:

`invI * cross(r, P)`.

For the aligned flat-road rolling geometry, the longitudinal tangent impulse acts at the support lever below the COM. Its first-order moment is about the wheel axle. This is therefore an explicit direct mechanism capable of changing the measured current-axle spin rate.

Normal contact impulses, central twist friction and the zero rolling-resistance block do not provide the same first-order longitudinal axle-torque path in the ideal aligned geometry. Finite numerical/orientation coupling remains possible.

### 3.4 ParallelJoint is designed to leave spin about local Z free

The base pinned ParallelJoint solves two angular collinearity components using `perpAxisX/perpAxisY`; it does not add a third twist constraint around the aligned local-Z axis.

The RQ2C3 scalar translation guide applies its force impulse along frame-A local Z and constructs its angular lever impulses with cross-products against that axis. At exact alignment those direct guide/joint angular impulses are perpendicular to the free axle/spin direction.

However, the executed system has finite floating-point orientation error, world-space inverse inertia and repeated warm-start/solve/relax phases. Source review therefore does **not** prove that every joint-related contribution to `dot(omega, actualAxle)` is identically zero at the numerical level.

### 3.5 Velocity integration can create indirect numerical coupling

Pinned `solver.c` integrates force/torque, damping and a one-iteration Newton-Raphson gyroscopic correction before constraint solve.

The recovered wheel mass model is axisymmetric about the wheel axis, so the ideal rigid-body symmetry strongly suppresses torque-free change of the spin component about that symmetry axis. But finite transverse angular motion plus the discrete gyroscopic solve means the exact floating-point contribution should not be declared zero without measurement.

## 4. Ownership verdict

**Source-localized fact:** contact tangential friction is the unique obvious **first-order direct axial-torque path** in the exact aligned RQ2C4 apparatus.

**Not proven:** the measured `Delta omega_A` budget has not been numerically decomposed across contact friction, normal/twist contact response, ParallelJoint warm-start/solve/relax and gyroscopic/integration coupling.

The existing scenario/post-step telemetry cannot close that exact budget. In particular, the current `Rh0ContactSample` records total normal impulse and contact identity but not a per-substep/per-subsystem angular-velocity contribution ledger. Sampling only after one outer `b3World_Step(dt, 4)` would also miss the internal four-substep warm-start/solve/relax sequence.

Classification:

`RQ2C4F_SOURCE_OWNERSHIP_PARTIAL_CONTACT_FRICTION_DIRECT`

This is deliberately **PARTIAL**, not a solver-causality PASS.

## 5. Why no new solver instrumentation is opened now

A transient solver-level accumulator could close the remaining numerical budget by measuring current-axle spin change around integration, contact and joint phases without altering equations or ordering.

That experiment is technically possible, but it no longer changes the immediate JV-Web decision:

- the 0-degree actual-support gate is already failed by `17.0469x`;
- the intended `+3.5/-3.5 degree` yaw pair is therefore still unauthorized;
- no wheel-mode5 result is product acceptance;
- no candidate wheel-mode5 integration into `main` is currently being decided;
- the Owner is intentionally moving toward closing routine micro-forensics rather than extending them for completeness.

Per `AGENTS.md`, microscopic research should stop when it can no longer change the next project decision. Creating engine-level instrumentation only to assign the last few tens of microradians-per-second more precisely would violate that routing principle at this point.

Therefore **do not build the solver-level ownership diagnostic by default**.

## 6. Closure state and reopen trigger

The orientation branch closes this routine line at a truthful HOLD:

- RH0 foundation: **CLOSED / trusted**;
- RQ2C4 direct-guide heading control: **qualified as apparatus behavior**;
- 0-degree actual-support rolling-slip gate: **FAIL**;
- RQ2C4F kinematic localization: **TRUSTED_DIAGNOSTIC**;
- source ownership: **PARTIAL — contact friction is the direct first-order owner, exact numerical budget not closed**;
- `+3.5/-3.5 degree` yaw equivalence: **NOT EXECUTED / NOT VALIDATED**;
- product integration: **NOT AUTHORIZED**.

Reopen the solver-level ownership budget only if a later decision specifically depends on salvaging this direct-guide 0-degree qualification, or representative vehicle evidence shows that this residual materially affects grip, energy, handling or Owner-observable behavior.

Do not reopen merely to make the forensic story complete.
