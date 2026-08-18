# JV Web — current project state

Updated: 2026-08-19
Owner: Jozz
Status: `P1.2/P1.3/P1.3.1 OWNER-ACCEPTED / CANONICAL + PUBLIC STEADY-STATE CLOSED / HANDOFF CANDIDATE / NO ACTIVE PRODUCT SLICE / JURE PAUSED`

Git/current source, executed evidence and direct Owner observation outrank this document. This file is the compact current-state authority, not project archaeology.

## 1. Current authority and exact anchors

Private source/product authority is live `main` of `Jozzpoly/JV-Box3D-Web-experiment`.

Exact executable/release anchors for the accepted mobile-polish boundary:

```text
owner-approved product source before test-only close fix:
  23fe49c608da2aaecdf5cf28f3954d55bb364db9

canonical private executable source:
  cd7f5f89e8cfb872ff6bddc619e3fb78f2124af4

canonical source tree:
  cc2afeb7902f05d12edd98961b2a43f0706603c8

clean canonical preview artifact:
  fe5ba2c772dbb530848df5bcd55163171b5847bc

public executable steady-state promotion:
  7efe864a337349f4bbdb9e690c2209a0ee781ba2

current public main after Owner-acceptance provenance closure:
  086e25c9bd22bddca6462f0d585de6d0fd424012

previous accepted public steady-state:
  f512551dc41196bc8ca053357408c93b4b3725be

approved JSPREV2 preservation source:
  a325c279cfe63a0607dba33c3c635a1716e09f8f

historical public R0:
  c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
```

Current private `main` is a documentation-only descendant of `cd7f5f89...`; do not transfer canonical execution claims to later docs-only commits. `cd7f5f89...` remains the executable-source anchor.

Public `main@086e25c9...` is provenance-only after executable promotion `7efe864a...`; runtime/artifact bytes remain those of the accepted canonical promotion.

## 2. Product/release acceptance — CLOSED

Canonical Windows close on exact `cd7f5f89...` used Node 24.16.0 / npm 11.17.0, `npm ci`, the normal repository `npm run build`, typecheck/docs/third-party/build checks and the full repository suite **462/462 PASS**.

The `cd7f5f89...` commit is test-only relative to Owner-approved product source `23fe49c...`; it added coverage for the already-existing steering-plate setting and did not change product runtime source.

The clean public artifact was composed onto public `main` without the preview overlay. Release provenance records exact private source `cd7f5f89...`, preserved approved JSPREV2 bytes and no public runtime overlay carry-forward.

Owner final steady-state smoke on Samsung Galaxy A53 / Chrome confirmed on the normal public surface:

- world and vehicle boot;
- steering;
- throttle + brake;
- utility drawer open/close;
- steering background/plate default OFF and OFF -> ON -> OFF;
- landscape/browser and fullscreen with no obvious regression;
- JSPREV2 loading.

This closes the P1.2/P1.3/P1.3.1 product/release boundary. Do not restart canonical-close/publication-helper work without new contradictory evidence.

GitHub Pages configuration was not independently re-read through a Pages-settings API during the final close because the available connector did not expose that endpoint. The Owner nevertheless exercised the normal public surface after promotion and observed the newly promoted behavior. Do not claim a fresh Pages-settings API verification that did not occur.

## 3. Accepted product foundation

Preserve unless a later focused slice explicitly changes it:

- Plac E2R, Offroad and approved JSPREV2;
- current owner vehicle;
- Camera Manual Rig V1;
- Fullscreen V1;
- P1.2 short-landscape/lower-driving composition foundation;
- P1.3 minimal persistent driving HUD + transient utility drawer;
- P1.3.1 compact top actions, larger physical-wheel presentation and steering plate default OFF/optional ON;
- current X-only analog steering `POSITION` interaction;
- analog throttle/brake foundation;
- independent multitouch ownership;
- fail-closed lifecycle behavior and current D/R semantics;
- accepted Samsung Galaxy A53 / Chrome render-1x performance boundary.

This is not final authority for pedal mapping/mechanics/industrial design, steering gesture/industrial design, portrait-specific composition, final rig geometry or handling.

Scoped historical Owner acceptance is summarized in `docs/OWNER_CHECKPOINTS.md`.

## 4. No active product slice

Do **not** continue an old numbered roadmap mechanically. Real P1.2 -> P1.3 -> P1.3.1 work already crossed and reshaped several earlier roadmap boundaries.

The next product conversation should first resolve live state and current Owner intent, then choose the smallest useful product need. Durable open directions include, without implying an order:

- absolute-position pedal mapping inside frozen acquisition geometry;
- mechanical pedal depression/feedback and later joint wheel+pedal industrial design;
- further steering visual refinement if new Owner feedback calls for it;
- isolated direct-rotation steering experiment against the still-working X-only reference;
- intentional portrait-specific composition;
- later rig/handling work only within the established JV/JURE authority boundary.

`docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` preserves these interaction targets/falsifiers. It is intent authority when relevant, not a mandatory scheduler.

## 5. Repository/ref state

Only `main` is current private authority and only public `main` is current artifact authority.

Redundant historical/private refs may still be visible (`work/p1-2-hud-composition`, `work/p1-3-utility-drawer`, `work/p1-3-1-drawer-polish`, `checkpoint/p1-3-1-handoff-2026-08-18`) and public `preview/p1-2-owner` may still exist. They are not active work or competing truth.

The available GitHub connector in this session does not expose branch-ref deletion. Do not create another owner-side helper campaign merely to remove redundant names. Physical ref deletion is hygiene debt only; resolve ancestry before any later deletion.

## 6. Security/dependency and non-blocking debt

The latest canonical `npm ci` reported one high-severity dependency finding. Earlier exact V5 evidence classified the then-current finding as a transitive dev-only `nanoid` advisory with production-only audit at 0 vulnerabilities; exact attribution was **not independently re-run for the final `cd7f5f89...` close**. Treat the old attribution as historical evidence, not a freshly re-proven current fact.

Do not run blind `npm audit fix`. Dependency maintenance should be a deliberate future slice with lockfile/toolchain revalidation.

Other known non-blocking debt:

- portable network-policy proof does not formally cover arbitrary JavaScript network behavior;
- branch protection is not enabled;
- existing Vite `box3d.js` browser-externalization warning;
- existing >500 kB main-chunk warning;
- redundant historical branch names noted above.

Do not convert these into an open-ended cleanup campaign unless they impede a selected product goal.

## 7. JURE boundary

JURE remains future Owner-authored rig authority; JV Web remains browser/runtime physics, controls, rendering and public product authority. Current procedural M6 geometry must not be silently upgraded into authored neutral truth.

Never splice exact/JURE-authored hardpoints into an incompatible procedural mechanism. Use `docs/contracts/JURE_CONSUMER_BOUNDARY.md` when JURE work becomes active.

JURE is paused for the current handoff.

## 8. Fresh-agent takeover

Normal takeover route:

1. resolve live private `main` and public `main`;
2. read `AGENTS.md`;
3. read this file;
4. read `docs/HANDOFF.md`;
5. inspect only source/tests needed for the selected next need;
6. read `docs/contracts/MOBILE_DRIVING_POLISH_GROUNDING.md` only when mobile-control/polish intent is relevant.

Do not restart recovery archaeology, neutral-foundation validation, old Camera/Fullscreen reconstruction, old public-overlay repair, P1.2/P1.3/P1.3.1 publication machinery, accepted-A53 micro-optimization or speculative JURE runtime substitution without new contradictory evidence.

Dated technical/roadmap audits are historical evidence. They do not override this current state.

## 9. Handoff-readiness boundary

Product, canonical build, public steady-state and final Owner smoke are closed. The current remaining task is documentation/takeover validation only: make the primary authority docs mutually consistent and perform a fresh-agent simulation. No product implementation is authorized by this handoff-consolidation step.
