# JV Web — implementer task

Updated: 2026-08-12
Status: **ACTIVE**
Task: **R1-DRIVE-01 — real driving baseline and next rig-independent product slice**
Mode: **IN-GAME EVIDENCE / RIG-SENSITIVE GEOMETRY FROZEN**

## Write scope

```text
repository: Jozzpoly/JV-Box3D-Web-experiment
active branch: work/front-corner-golden-rebuild-r2
control main: 97055331a2eef8bdbf8411db243417591731e664
committed base before this checkpoint record: 8e79e69aa4912088bab453a0fb9b9b26afe9d6b0
public R0: immutable until a later publication decision
native JV: read only
```

Resolve live refs before every write. Do not create geometry fixes merely to improve the present rig appearance.

## One objective

Use the normal JV-Web Offroad runtime to identify the **single highest-value next improvement that does not depend on solving the deferred front rig/mating problem**.

This is a discovery/selection slice first. Do not start from an assumed steering, suspension or M6 solution.

## Protected controls

Preserve:

- S1 FL-upper accepted static/live behavior;
- S2-N source/DOF facts;
- S2-GAME-01 accepted broad in-game regression state;
- S2-K direct in-game #6/#8 relative-motion checkpoint.

Do not repeat those gates unless new evidence contradicts them.

## Deferred / frozen for this task

Treat as `RIG-SENSITIVE / DEFERRED`:

- FL lower wishbone placement;
- wishbone↔knuckle visual mating/joint references;
- ad-hoc offsets intended to keep those parts visually joined;
- damper/cardan endpoint polish whose correctness depends on the unresolved mating geometry;
- physical hardpoint changes made only to match the current visuals.

A future dedicated rig/workbench must establish explicit owner-authored mating points/frames and motion-valid relationships.

## Driving evidence priority

Use the ordinary wheel-visible product and distinguish observations by cause. Prefer a small set of representative maneuvers rather than broad tuning:

1. straight launch / acceleration / braking;
2. low-speed steering and release;
3. moderate turn/slalom or direction reversal;
4. rough-terrain suspension/contact event.

Capture only telemetry already available or minimal instrumentation required to identify a cause. Do not build a new telemetry framework unless a concrete question requires it.

## Selection rule for the next implementation

A candidate fix is eligible only if it is both:

- visibly/physically important in real play; and
- substantially independent of the deferred rig geometry.

Examples of potentially safe domains: input/control response, camera/reset UX, runtime/browser stability/performance, clearly isolated drive/brake/contact defects, or diagnostic observability. Steering/suspension tuning that depends on current hardpoints is not automatically safe.

Return with one of:

`NEXT_SLICE_SELECTED` — one bounded rig-independent improvement is supported by in-game evidence;

`RIG_SENSITIVE_BLOCKER` — the dominant problem cannot be separated from deferred rigging, so do not compensate for it;

`NO_MAJOR_DRIVING_BLOCKER` — current driving is sufficient to shift R1 effort toward browser/demo/product polish.
