# JV Web — operating contract

Updated: 2026-09-04
Owner: Jozz

JV Web is the browser product line for Jozz Vehicle: a real desktop/mobile driving product and a practical R&D surface. It is **not NextGen JV Lite** and it is not automatically the implementation home of the next JV generation.

## 1. Authority

Use this order when claims conflict:

1. live Git and current files;
2. executed evidence from the exact source under discussion;
3. direct scoped Owner/device evidence;
4. current documentation;
5. conversation history, donor history and cross-project memory.

`Jozzpoly/JV-Box3D-Web-experiment/main` is accepted source/product authority after an accepted slice is consolidated there.

An **explicitly active research branch** may own the latest executed evidence for its scoped research question. That does not make the branch accepted product truth and does not supersede `main` for product claims.

`Jozzpoly/JV-Box3D-Web-Public/main` is Friends/public artifact authority, not source authority.

`preview/owner-control` is operational Owner Preview infrastructure. It composes an exact source commit with explicitly pinned static layers; it is not source authority.

Historical `work/*`, checkpoints, donor branches and accidental/noop refs are evidence/history, not authority and not a cleanup campaign. A work branch is current research evidence only when current routing explicitly identifies it as active.

## 2. Current working mode

The strategic cold-takeover campaign from 2026-08-26 is closed. Do **not** restart it merely because a new chat or executor exists.

JV-Web uses bounded iteration for both product work and research:

**real need or uncertainty -> smallest informative change/experiment -> validation matching causal blast radius -> faithful evidence -> Owner judgement when experiential -> next iteration**

Full canonical validation, documentation consolidation and promotion to `main` are expected when closing an accepted product stage or changing foundations. They are not mandatory ceremony for every tiny polish edit or every research probe.

Before any write, verify repo, ref/branch and current source. Protect the accepted baseline and do not expand scope without evidence that the larger change is needed.

## 3. Product identity and relation to NextGen JV

JV-Web and NextGen JV answer different questions.

JV-Web optimizes for a practical browser experience: link -> load -> drive, on desktop and phone, with good controls, camera, presentation, performance and useful worlds/scans. It can also serve as a reality-check surface for browser/mobile constraints and bounded R&D experiments.

NextGen JV is a separate, deeper 3D-first construction/platform research direction. Discoveries can transfer between projects when useful, but architecture does not synchronize automatically.

Do not turn JV-Web into a poorer copy of NextGen JV, and do not preserve JV-Web architecture merely from sunk cost.

## 4. Current accepted steering baseline

The scoped current-best is recorded in:

`docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md`

Key accepted product truth:

- Direct Rotation and Relative-X remain explicit alternatives;
- ordinary pointer release relinquishes touch ownership with semantic `RELEASE`;
- hidden artificial return-to-zero is not the product default;
- while hands-off, the graphical wheel follows the live physical rack;
- a new grab starts from the live physical rack position, avoiding UI/physics offset;
- 900 degrees total wheel travel is the current default and Owner-used current-best tuning;
- 360/540/720/1080 remain configurable candidates, not Owner-approved final ratios;
- wheel-range choice is session-scoped;
- artificial centering is not exposed as an Owner product setting; any retained artificial-centering adapter path is a control specimen only;
- useful natural physical self-return is still unresolved and must not be faked by silently reintroducing automatic centering.

Do not claim the steering system is mechanically finished.

## 5. Evidence discipline

Always distinguish:

- **CURRENT ACCEPTED / FACT** — directly true in accepted current product source/configuration;
- **TRUSTED EXECUTED** — actually built/tested/measured on identified source or research commit;
- **OWNER-OBSERVED** — direct qualitative or device evidence from the Owner;
- **HYPOTHESIS / OPEN** — plausible explanation or proposed direction still needing evidence;
- **NOT VALIDATED / UNKNOWN** — not yet demonstrated;
- **HISTORICAL-ONLY** — provenance, rejected/superseded work, or failed apparatus that must not be promoted into current evidence.

A helper failure is not automatically a product or physics failure. Repair tooling only if doing so can change the current decision.

Quick previews are acceptable only when they faithfully represent the changed DOM/CSS/interaction semantics. Otherwise use clean source render or the normal canonical build/Preview path.

For research diagnostics, establish non-perturbation when the measurement itself could alter the mechanism being studied.

## 6. Scope protection

UI/input polish is not authorization to change vehicle physics, drivetrain, rig topology, wheel/contact representation or world semantics.

Likewise, a mechanics/contact research slice must not opportunistically redesign UI or product architecture.

When a problem can be answered by a smaller causal experiment, prefer that experiment over a broad refactor or archaeology campaign. When microscopic research can no longer change the next project decision, move upward to the smallest representative qualification instead of continuing for completeness.

Native/JV_CORE, JURE, JES, NextGen JV and other projects may supply hypotheses, techniques or donor evidence. They do not prove current JV-Web state.

## 7. Responsibility

### Agent / repo-native executor

Owns:

- repo/ref/source verification;
- implementation and technical diagnosis;
- tests/builds and evidence collection available to the environment;
- bounded comparisons and falsification;
- documentation updates when a meaningful stage or research frontier changes;
- catching collateral changes before product promotion.

### Owner

Primarily owns:

- look/feel judgement;
- real-device evidence unavailable to the agent;
- product priorities and acceptance;
- decisions where multiple valid experiential directions remain.

Routine Git/build/debugging should not be pushed onto the Owner. Do not ask the Owner to judge laboratory metrics that have no demonstrated experiential consequence.

## 8. Publication and Git discipline

Owner Preview should point to an exact accepted/candidate source commit and explicit static-layer provenance. Do not mutate accepted static layers to make an unrelated source experiment work.

Before promoting an accepted work branch to `main`:

1. re-fetch current `main` and candidate heads;
2. verify the candidate is still the intended descendant/fast-forward unless a different merge is explicitly justified;
3. run validation appropriate to milestone closure;
4. ensure docs describe what is accepted and what remains open;
5. move `main` without force when a clean fast-forward exists.

A research branch does **not** become a product candidate merely because its laboratory CI is green. Product integration requires a separate decision and appropriate representative/Owner evidence.

Do not create new branches, wrappers, gates, schemas or checkpoints merely for process aesthetics.

## 9. Reading order

For a fresh continuation of normal JV-Web product work:

1. `AGENTS.md`;
2. `docs/PROJECT_STATE.md`;
3. current live `main` source/tests/build config relevant to the requested slice;
4. `docs/baselines/STEERING_I1_CURRENT_BEST_2026-09-01.md` when steering is relevant;
5. `docs/HANDOFF.md` only when a handoff/takeover is actually needed;
6. older evidence/prior-analysis documents only as required.

For the explicitly active wheel-mode5 research lane:

1. verify live `main` and the active research branch separately;
2. `AGENTS.md`;
3. `docs/PROJECT_STATE.md`;
4. `docs/WHEEL_MODE5_CURRENT_STATE_AND_ROADMAP_2026-09-04.md`;
5. the current forensic/experiment boundary named by that roadmap;
6. older wheel-mode5 experiment documents only when a specific claim or apparatus dependency requires them.

`docs/FIRST_FALSIFIER.md`, architecture hypotheses and old takeover material remain historical/prior analysis unless current routing explicitly reactivates them.

## 10. Stop and re-ground when

- live repo/ref differs from the assumed source;
- documentation/history is being promoted above newer Git/evidence;
- accepted product truth and active research evidence are being conflated;
- an accepted behavior is about to be changed outside the current scope;
- unresolved mechanical truth is being guessed;
- an experimental/control behavior is being silently promoted to product truth;
- a diagnostic perturbs the dynamics it claims to observe;
- a broad recovery/refactor would add more work than information;
- a closed forensic microstage is being restarted without a plausible path to changing the next decision;
- Owner evidence is being generalized beyond what was actually tested;
- a new chat is causing a closed campaign to restart without a product or research reason.
