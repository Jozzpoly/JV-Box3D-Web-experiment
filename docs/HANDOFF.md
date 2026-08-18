# JV Web — takeover handoff

Updated: 2026-08-19
Status: `HANDOFF READY / MOBILE POLISH P1.2-P1.3.1 ACCEPTED / CANONICAL + PUBLIC STEADY-STATE CLOSED / NO ACTIVE PRODUCT SLICE / JURE PAUSED`

Snapshot only. Live Git and `docs/PROJECT_STATE.md` outrank this file.

## Fresh entry — do this first

1. Resolve live private `main` and public `main`.
2. Read `AGENTS.md`.
3. Read `docs/PROJECT_STATE.md`.
4. Read this handoff.
5. Inspect only source/tests relevant to the selected next need.
6. Read mobile/JURE contracts only if that boundary is actually selected.

Do not implement immediately merely because an old roadmap names a next numbered stage. First verify current Owner intent and choose the smallest useful product slice.

## Exact accepted boundary

```text
canonical private executable source:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

owner-approved product source before the test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

public executable steady-state promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

Owner-acceptance provenance anchor:
  086e25c9bd22bddca6462f0d585de6d0fd424012

current public main after public handoff/control-plane closure:
  1b64b45b0d3c1d5cb7ccc469e98e300568580f60

previous accepted public steady-state:
  f512551dc41196bc8ca053357408c93b4b3725be

approved JSPREV2 preservation source:
  a325c279cfe63a0607dba33c3c635a1716e09f8f
```

Private `main` is a docs-only descendant of `cd7f5f89...`; resolve its live SHA rather than treating the executable anchor as the documentation head.

The canonical close at `cd7f5f89...` passed the normal Node 24.16.0 / npm 11.17.0 install/build path and full repository tests **462/462**. The final commit after Owner product approval was test-only and did not alter product runtime source.

Owner tested the final public steady-state on Samsung Galaxy A53 / Chrome and confirmed: world/vehicle boot, steering, throttle+brake, utility drawer, steering plate default OFF plus ON/OFF toggle, landscape/browser/fullscreen sanity and JSPREV2 loading.

This closes the P1.2/P1.3/P1.3.1 source/build/publication boundary.

## Accepted product baseline

Protect unless a later focused slice explicitly changes it:

- Plac E2R, Offroad, approved JSPREV2 and owner vehicle;
- Camera Manual Rig V1 and Fullscreen V1;
- P1.2 short-landscape/lower-driving composition foundation;
- P1.3 minimal persistent driving HUD + transient utility drawer;
- P1.3.1 compact top actions, larger physical-wheel presentation and optional steering plate default OFF;
- X-only analog steering `POSITION` as the current working reference;
- analog throttle/brake foundation;
- independent multitouch, fail-closed lifecycle and current D/R semantics;
- accepted A53/Chrome render-1x performance boundary.

This does not make pedal mapping/mechanics/design, steering gesture/design, portrait-specific layout, final rig geometry or handling final truth.

## Open product intent — not a scheduler

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` preserves still-useful Owner intent for future control polish. Candidate directions include absolute-position pedal mapping, mechanical pedal depression, further wheel/pedal industrial design, an isolated direct-rotation steering experiment and intentional portrait composition.

These are **not** a mandatory P1.4 -> P2 -> P3 execution order. The next conversation should reselect the next need from live product state and Owner feedback.

## Evidence and debt boundaries

Scoped Owner acceptance is in `docs/OWNER_CHECKPOINTS.md`.

The final canonical install reported one high-severity dependency finding. Earlier V5 evidence attributed the then-current finding to a transitive dev-only `nanoid` advisory and found 0 production-only vulnerabilities, but that exact attribution was not independently re-run for `cd7f5f89...`. Do not present the historical attribution as freshly proven and do not run blind `npm audit fix`.

Other non-blocking debt: JavaScript gap in portable network-policy proof, no branch protection, existing Vite browser-externalization/large-chunk warnings and redundant historical branch names.

## Ref discipline

Only private `main` and public `main` are current authorities. Older work/checkpoint/preview refs may remain visible because the current connector lacks branch-ref deletion. They are historical navigation only, not active work lanes. Do not infer authority from their names and do not build owner-side cleanup tooling solely to remove them.

## Closed work not to restart

Without new contradictory evidence, do not reopen:

- old recovery/publication campaigns;
- neutral-foundation validation machinery;
- Camera/Fullscreen reconstruction;
- old P1 CSS/overlay repair;
- P1.2/P1.3/P1.3.1 canonical-close/publication runners;
- accepted A53 1x micro-optimization;
- speculative JURE runtime substitution.

## Fresh-agent validation

Fresh-agent reconstruction was performed after consolidation. The first pass found one stale public `AGENTS.md` statement that Owner validation was still pending; public control-plane commit `1b64b45b...` corrected it. The resulting live-ref + `AGENTS -> PROJECT_STATE -> HANDOFF` path is internally consistent and sufficient to reconstruct current authority, acceptance, open intent and closed campaigns without this conversation.

**Takeover status: PASS / HANDOFF READY.**
