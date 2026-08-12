# JV Web — implementer task

Updated: 2026-08-12
Status: **ACTIVE**
Task: **R1-STEER-01 — coherent front steering + hands-off contact stability**
Mode: **CAUSAL PHYSICS RESEARCH / DISPOSABLE EXPERIMENTS BEFORE PRODUCT CODE**

## Write scope

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
active branch: work/front-corner-golden-rebuild-r2
control main: 97055331a2eef8bdbf8411db243417591731e664
R1-DRIVE-01 discovery parent: af71a419dcaab0037a6e4278f42e4449d15c0a31
public R0: immutable
native JV: read only
```

Resolve live refs before every write. Keep physics experiments disposable until a bounded candidate passes the research gates.

## Why this task exists

R1-DRIVE-01 showed that the largest current driving defect must not be skipped merely because it is fundamental or rig-adjacent.

The current S2 product candidate mixes incompatible steering mechanisms across the front axle. That produces roughly ~14° FL vs ~29–30° FR at similar rack lock in either direction and large left/right vehicle asymmetry.

Disposable equalized steering proved this mismatch is causal. A disposable symmetric centered + physical-link implementation then recovered active left/right symmetry and inner/outer angle swapping, but still showed hands-off straight instability.

## One objective

Determine a physically defensible coherent front steering/contact mechanism that is good enough to become the next owner-playable candidate, or prove that the current legacy contact backend blocks that goal.

Do **not** optimize for an easy `rig-independent` fix. Follow the dominant evidence.

## Protected controls

Preserve in every experiment:

- accepted WheelCenter steering center;
- #6 suspension-side / #8 steerable role separation;
- separate wheel spin;
- accepted S1 upper behavior as a control;
- no fake wishbone↔knuckle visual mating fix.

## Current strongest hypothesis — not authority

A symmetric solver-native bilateral linkage can be viable **if** both front corners share a coherent WheelCenter-centered steering DOF. Evidence so far:

- active left/right vehicle response becomes nearly mirrored;
- the larger steering angle swaps to the inner wheel with direction;
- contact/knuckle forces retain a physical path to the rack.

Still provisional:

- mirrored FR carrier/body topology;
- rack-side tie-rod anchor;
- final steering-axis direction;
- mass split and all handling values.

## Hands-off causal findings already established

Do not repeat without contradiction:

- drive torque is not required for divergence — it persists in coast after release;
- front suspension travel is not required — it persists with front suspension experimentally constrained near settled length;
- positive vs negative mechanical trail has the expected opposite effect on stability;
- increasing positive trail improves straight stability monotonically in sensitivity runs, but no tested angle/value is accepted;
- rack-side width affects stability less strongly in the tested range and remains open.

## Next research steps

1. Express steering-axis tests in physical contact terms: mechanical trail / scrub at the ground from an axis constrained to pass through WheelCenter. Avoid treating historical caster/KPI degrees as targets.
2. Characterize straight-state stability over speed, not one final yaw number. Record onset speed / rack growth / steering-angle growth.
3. Check whether a plausible positive-trail region also preserves steering release/back-drive instead of merely resisting motion.
4. Keep rack-side anchor as an independent hypothesis and test only enough sensitivity to determine whether it changes the mechanism class; do not tune it to a green result.
5. If the legacy rolling-sphere backend needs extreme mechanical trail or artificial damping to stay stable, classify `CONTACT_BACKEND_LIMIT` and evaluate the already-allowed bounded `b3Wheel`/contact research lane instead of adding hidden steering assist.
6. Only when one mechanism passes headless active-symmetry + hands-off gates, package an owner-playable A/B build. Product branch physics remains unchanged until then.

## Required falsifiers

Reject a candidate if any of these occur:

- larger steering angle stays on one physical side instead of swapping inner/outer;
- mirrored commands produce materially asymmetric speed/yaw without a demonstrated physical cause;
- release requires servo-to-zero, hidden centering spring or arbitrary large friction;
- contact loads cannot back-drive rack;
- straight instability remains a growing mode in the representative driving range;
- stability depends on the deferred visual rig mating or guessed wishbone offsets;
- a parameter is justified only because M5/M6/latest native used it.

## Return states

`OWNER_AB_READY` — one coherent steering candidate passes causal headless gates and is ready for owner A/B driving.

`CONTACT_BACKEND_LIMIT` — the legacy split-sphere contact model is the dominant blocker; route to bounded contact/b3Wheel research instead of compensating steering.

`MECHANISM_REPLAN` — neither physical linkage nor another defensible mechanism can pass without unresolved rig-authoring information.
