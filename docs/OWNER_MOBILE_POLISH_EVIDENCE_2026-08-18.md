# JV Web — Owner mobile polish evidence — 2026-08-18

Purpose: compact current-slice evidence only. Consolidate the durable verdict into the normal project state at CLOSE; do not turn this file into a new process layer.

## Exact anchors

- private product source tested by Owner: `bf3dc8ae9ae9c146787a87daf4263e4f248d3f14`
- public polish preview tested by Owner: `d185da414fa40e08c2ac7bf597575a842496f8e3`
- device/browser: Samsung Galaxy A53 / Chrome
- evidence supplied in project conversation: portrait + landscape/fullscreen screenshots and a short driving video
- preview remains non-canonical and still requires a clean canonical rebuild before product acceptance/promotion.

## Owner verdict — direction accepted, stage still open

The wider P1 mobile surface-polish direction is materially better and worth preserving, but this is not final visual acceptance.

Accepted direction:

- larger visible steering wheel improves steering feel;
- compact Camera / Reset / Debug controls materially clean the world view;
- all three actions still work;
- current steering still feels good and the larger control direction appears beneficial;
- no important new steering/pedal overlap was observed in the tested states;
- fast public preview -> real A53 judgement is now the preferred iteration loop when the preview faithfully represents source changes.

Open polishing required:

- steering visual design regressed while size/feel improved;
- remove the visible `STEER` label;
- steering must return toward the intended physical-wheel metaphor: cleaner rim, mechanically coherent spokes/hub, better perspective/material continuity;
- the blue acquisition/background plate must become optional in utility settings and should not be the visual authority;
- acquisition geometry should be revisited together with the larger wheel for easier grabbing and finer control, without changing X-only POSITION semantics, dead-zone policy or vehicle physics;
- Camera / Reset / Debug should move to the top edge, become slightly smaller/more compact and receive optical icon-centering cleanup;
- momentary Camera/Reset actions must not retain a selected-looking state after release; only Debug is a persistent on/off state.

## Technical grounding

- `PointerSteeringJoystickAdapter` captures the steering target `getBoundingClientRect().width` on pointer-down and maps X position across that frozen width to `[-1,+1]`.
- Therefore increasing acquisition width improves pixels-per-command precision but is an effective geometric sensitivity change; it must be evaluated on device even though steering semantics, dead-zone and vehicle physics remain unchanged.
- Do not blindly make the acquisition rectangle as wide as the overflowing visible wheel in portrait: it can affect layout, pedal separation and camera gesture ownership. Keep acquisition geometry, wheel artwork and optional plate independently tunable.
- The persistent post-tap highlight on momentary action buttons is consistent with the existing global `.scene-action:hover` presentation on touch/sticky-hover browsers. Debug already has an explicit persistent `aria-expanded` state and should remain the only latched visual state.

## Next polishing boundary

Remain in ITERATE mode. Do not canonical-build or consolidate yet.

Next work should stay inside mobile UI/input presentation and settings:

1. top-edge compact action row + transient press feedback / sticky-hover correction + icon optical cleanup;
2. steering visual cleanup (remove `STEER`, refine rim/spokes/hub/perspective, reduce plate authority);
3. add a lightweight utility setting for steering plate visibility;
4. cautiously enlarge/tune steering acquisition geometry and validate camera/pedal non-interference on A53;
5. one faithful public preview and Owner portrait + landscape/fullscreen driving judgement.

Protected: pedals and D/R semantics, X-only POSITION mapping, multitouch/lifecycle behavior, vehicle physics/drivetrain, camera rig semantics, P1.2 composition foundation and public `main`.
