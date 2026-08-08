# JV Web — agent operating contract

Updated: 2026-08-08
Campaign: **friend-demo completion / R1**
Owner: Jozz

This is the first operational authority for work in this repository. It is a guardrail, not a substitute for current Git, executable evidence, the handoff resource pack or owner observation.

## 1. Campaign scope

For this campaign:

```text
Jozzpoly/JV-Box3D-Web-experiment
  = ACTIVE PRIVATE CORE / development laboratory

Jozzpoly/JV-Box3D-Web-Public
  = PUBLIC FRIEND-DEMO / GitHub Pages release surface

Jozzpoly/Box3d_FunProject
  = NATIVE JV / READ-ONLY SOURCE FOR THIS CAMPAIGN
```

Native JV is maintained by another agent and intentionally frozen while this JV-Web friend-demo is completed. Do not advance, reorganize or tune native JV unless Jozz explicitly changes scope. Reading exact native files is allowed when Web needs an already-existing asset, semantic contract or mechanism such as `b3Wheel`.

JV-Web may temporarily move ahead of native JV in presentation, browser/mobile UX, camera, configuration, QoL and demo polish. Long-term easy native→Web transfer remains desirable, but it must not stall this campaign.

## 2. Owner goal

The immediate target is a browser build that increasingly feels like a real piece of Jozz's game and is enjoyable/motivating to launch, drive, tune and show friends.

Desired friend-demo capabilities include, adaptively ordered by actual play/feel:

- Jozz's real vehicle model;
- substantially better racing-game chase camera;
- desktop orbit/zoom + phone two-finger pinch zoom;
- usable private JSPREV2 scan path and phone assessment;
- fast location/teleport switching without unnecessary world rebuilds;
- vehicle presets and a Web-native settings model;
- FWD / RWD / AWD;
- mechanically defined drivetrain/shaft locking;
- useful QoL;
- rebuilt Web/mobile UI;
- Web port of the selected newer native `b3Wheel` if feasibility is sane.

Social-media optimization is a later benefit, not a current constraint. Jozz's actual play/feel is a legitimate scheduling signal. Do not execute a stale roadmap mechanically.

## 3. Gate 0-R — remote identity

Before every connector/GitHub write, verify from current GitHub data:

```text
repository
target branch
exact 40-character tip
exact tree
intended operation
```

Create only bounded fast-forward descendants of the verified tip. Stop on ref movement, unexpected scope, permission ambiguity or identity mismatch. Never force-push or rewrite history as routine recovery.

## 4. Gate 0-L — local execution identity

A local build/test/artifact claim requires a complete clean checkout and explicit verification of:

```text
git rev-parse --show-toplevel
git remote get-url origin
git branch --show-current
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short --branch
```

Do not use an unrelated local JV/Box3D folder as a substitute for the repository named by the task. Prefer isolated/disposable workspaces when user-side Windows execution is genuinely required.

## 5. Canonical published R0 baseline

R0 is CLOSED and must remain an immutable rollback/reference point.

```text
private R0 source:
5ba6cc406b8c1541e29cd1ae59ffed78a7509284
tree 08314a0182a38bbcd106e984dde73e737a1a13e7

validated public candidate ZIP SHA-256:
f7585b8cd3233849ae9002814e2c245e51f6aeb53fbe32f41552b228f27796b2

public repo:
Jozzpoly/JV-Box3D-Web-Public

release/r0:
c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44
tree f1c5c9a971208d89da05143f10913891a58b3b70

rollback/main:
401068f5734c841d43907b71484bc03a2396c604

Pages:
https://jozzpoly.github.io/JV-Box3D-Web-Public/
source release/r0 /(root)
```

Full closure: `docs/repair/R0_PUBLISHED_BASELINE_2026-08-07.md`.

Do not rebuild, amend or silently replace R0 when beginning later work. A later public release is a new artifact with its own provenance and rollback.

## 6. Evidence vocabulary

Keep levels separate:

```text
SOURCE-PRESENT
SOURCE-GATE PASS
ARTIFACT-GATE PASS
RUNTIME OBSERVED
OWNER OBSERVED / OWNER ACCEPTED
PUBLISHED
```

A lower level never silently implies a higher one. Historical exact evidence remains valuable even when it is not proof of current R1.

When sources disagree, prefer:

```text
1 current Git/current code/live runtime
2 raw exact execution evidence + direct owner observation
3 exact recovered source snapshots/resource pack
4 historical docs/plans
5 current interpretation/provisional scheduling
```

## 7. Private scan boundary

The private scan is an active capability, not forbidden R1 work.

Current R1 still contains the local/full scan wiring: `index.html` → `product-main.ts` → `loadLocalFullProductWorld()` → `loadLocalJsprev2Scan()`, with Vite dev serving selected private scan bytes through `JOZZ_SCAN_PREVIEW_PACK`.

Therefore do **not** describe scan work as a wholesale old-branch recovery. First locate the exact pack and revalidate the current LOCAL_FULL path; only reconcile what is actually missing.

Public R0 is deliberately scan-free. The current dev Vite scan server is not a GitHub Pages publication solution. Future public scan inclusion requires an explicit packaging/hosting/size/privacy decision.

## 8. Validation model for R1

Do not recreate R0 release ceremony for ordinary private development.

### Tier 1 — ordinary private slice

Use exact branch identity, focused tests/checks for the changed subsystem and the smallest relevant browser smoke. No user action by default.

### Tier 2 — owner feel/visual checkpoint

Use when the actual question is visual quality, camera feel, driving feel, mobile interaction or product usefulness. Give Jozz a stable exact candidate and ask only for the observation that automation cannot provide.

### Tier 3 — public release candidate

Use full reproducibility/artifact/provenance/rollback discipline and live Pages smoke. Public promotion should correspond to meaningful owner-visible value, not every internal commit.

A failing harness/operator is not automatically a failing product. Classify failures before asking for reruns.

## 9. Stop conditions

Stop and investigate when:

- work would modify published `release/r0` bytes in place;
- private scan bytes accidentally enter a public artifact;
- native parity/product authority is claimed without evidence;
- desktop/mobile usability regresses without explicit scope and owner awareness;
- a release cannot be tied to exact source/artifact/rollback;
- a gate failure is being confused with a product failure;
- a historical branch is being wholesale-merged because it contains more features;
- a plan is being followed despite new evidence or owner feel showing a better order;
- validation/release/foundation machinery is expanding without proportional product value;
- Jozz is being asked to do technical work the agent can perform itself.

## 10. Fresh-agent bootstrap order

First resolve current private/public refs. Then read:

1. `AGENTS.md`
2. `AI_PROJECT_MEMORY.md`
3. `docs/PROJECT_STATE.md`
4. `docs/handoff/JV_WEB_HANDOFF_2026-08-08.md`

If the handoff resource pack is attached in the conversation, read next:

5. `00_START_HERE.md`
6. `01_CURRENT_STATE_AND_OWNER_INTENT.md`
7. `02_RESOURCE_MAP.md`
8. `03_EVIDENCE_AND_UNKNOWNS.md`
9. `08_ACTIVE_R1_ENTRY_PATHS.md`
10. `09_COLD_AGENT_TAKEOVER_CHECKLIST.md` and `10_PUBLIC_SCAN_PUBLICATION_BOUNDARY.md` if present

Then use `docs/handoff/JV_WEB_RESOURCE_INDEX_2026-08-08.md`, recovered scan evidence, R0 baseline and R1-F0 only as targeted references.

Do not begin a fresh conversation by broadly searching for resources already indexed or physically attached. Do not begin implementation until current code has been checked against the handoff claims.