# Steering return probe — 2026-10-10

Status: `EXECUTED EVIDENCE / NOT PROMOTED / OWNER DECISION NEEDED FOR RIG WORK`

Question: can useful natural steering self-return emerge from the physical
system (no centering spring), as the Owner prefers?

All numbers come from the headless harness `tests/helpers/headless-vehicle.mjs`
(exact product rig on Box3D, flat ground, 60 Hz x 4 substeps). Scenario:
drive, steer to `POSITION 0.6`, then `RELEASE`, sample the rack over 3 s.

## Why the current product cannot self-return

The R1 bridge drives both front wheels kinematically from the rack (hard joint
limits re-set every step). Tyre moments about the steering axes are absorbed by
those constraints and never reach the rack, so the released rack only feels its
own friction. This is structural, not a tuning problem.

## Probe A — virtual tie rods by explicit force (rejected)

Measured steering-constraint reaction torque, returned to the rack by virtual
work (`F = -tau * dTheta/dRack`). Both sign conventions oscillated lock-to-lock
within 0.5 s. The measured reaction is dominated by the kinematic snap of the
wheel, not by the tyre moment; a 5 kg rack against reflected wheel inertia is
unstable with one-step-lagged explicit forces. Negative knowledge: do not
pursue explicit-force feedback on the kinematic bridge.

## Probe B — physical tie rods in the solver

Distance joints from rack ends to knuckle steering arms, front steering left
free within limits. Patch: `steering-physical-tie-rod-probe-2026-10-10.patch`.

B1, current asymmetric front (FL source geometry, FR generic wishbone):

- self-alignment **does emerge**: at 21 km/h the released rack returned from
  0.045 m to ~0.007 m within ~1 s;
- but suspension sag back-drives the rack: rest settles at -0.0705 m
  (FL -12 deg, FR -27 deg) and straight-line drift is 45 m over 8 s. Unusable.

B2, FR mirrored from the accepted FL source geometry:

- rest centered (rack -0.0008 m, toe about +/-1.6 deg);
- partial return at 9 km/h (0.045 -> ~0.03 m), little at 23 km/h;
- full lock only ~15 deg vs 33 deg on the bridge; turning radius 11.7 m vs 4.1 m.
  The source steering-arm lever is too long for the native rack travel.

## Conclusion

Physical self-return is reachable, but only with deliberate steering-rig
geometry: steering-arm length for the wanted lock, Ackermann, zero rest toe and
low bump-steer, symmetric on both sides. That is rig authoring (JURE / R0
territory) requiring Owner judgement, not a polish slice. The product keeps the
accepted kinematic bridge.

## Shipped from this probe

The probe exposed a real bridge defect: a released rack slid to full lock in
corners because nothing carried its 5 kg mass with the chassis except friction
(at 21 km/h: 0.045 -> 0.0755 m within 0.5 s, the car tightened its own turn).
`M6VehicleController` now supplies the missing frame force
(`m_rack * a_chassis` along the rack axis, opposite force on chassis). This is
not centering: the rack stays where it was released (0.045 -> 0.048 m over 3 s).
Covered by `released steering does not wind itself to full lock in a corner`.
