# AI project memory — JV Web

Updated: 2026-08-16
Status: `MOBILE DRIVING V3.1 DEVICE GATE PUBLISHED / OWNER VALIDATION PENDING`

This file is a router only. Current Git, reproducible execution evidence and direct owner observation outrank it.

## Authority

- accepted private source: `main@f8eb0908f5934aed2d504f34ce483a02754039ec`;
- single active product lane: `work/friends-r1-usability`;
- exact V3.1 code candidate: `c0b3ed2223a451cdacfd79f179efd2b88be7434f`;
- current public V3.1 owner-device candidate: `release/friends-r1@0baba295e3f8a9df8f8445731f043839cb55396f`;
- superseded failed public V3 harness: `e94ab696d05b4a976a2673a69e40d5ddffea94d7`;
- public Steering V2 owner proof: `2acd652f68d57497c8ce8886b2875789a70f4be3`;
- temporary 35-degree bridge source: `d6c646b65a0d57306e138175209c0f652bdbfbda`;
- Camera Manual Rig V1 absorption: `997c9a34ea429220dbdb4f5408a0ac37200bd712`;
- fullscreen owner proof: `checkpoint/pages-fullscreen-v1-owner-validated-2026-08-15@8fe52a73554273fa710d2be2fdaf3a144d9056ba`;
- performance/A53 proof: `checkpoint/pages-perf-foundation-a53-scan-validated-2026-08-15@a31ba267ae44705d477a8fdfae9ca23d1d65d4d0`;
- public known-good Friends rollback: `checkpoint/pages-friends-r1-known-good-2026-08-15@7161215e47f00573b8c1b5c31e5931c89f9d709a`;
- immutable R0 fallback: `release/r0@c3e33e3dcd343a6d3b5f60df6e07a4a78a64dd44`.

Only the lane named in `docs/PROJECT_STATE.md` is active ahead of `main`. Other work/candidate/repair/checkpoint refs are historical/evidence unless explicitly reactivated.

## Current product truth

Performance foundation v1, Camera Manual Rig V1 and Fullscreen V1 are owner-accepted foundations. Steering Control V2 is owner-accepted as the mobile steering foundation with visual design still open. Preserve its one-thumb X-only `POSITION [-1,+1]`, neutral/release behavior, temporary +/-35-degree product range and recoverable mobile Debug.

Mobile Driving V3.1 is the current experiment. It is present in normal typed source on the active work lane as:

- `db61b6610428032e17676583dc36cf84d44e84d1` — analog throttle/brake integrated into the deterministic longitudinal timeline + live D/R switching;
- `e651209f3e67439ed1ffeafedeb1c0f919208020` — stable-hitbox V3 UI, panoramic rotating steering-wheel feedback and animated analog pedals;
- `c0b3ed2223a451cdacfd79f179efd2b88be7434f` — short-landscape authority over legacy three-button geometry.

This is source candidate work, not owner acceptance and not promotion to `main`.

The old public V3 gate `e94ab696...` failed before pedal runtime because it text-patched compiled `main.js` and could not find an expected reset fragment. That is a **harness failure**, not evidence against the control concept. Do not repair it with more compiled-main `replaceOnce()` surgery.

The replacement device gate `0baba295...` is isolated under `driving-v31-test/*`. Its diff from `e94...` is one commit containing only 11 added gate files; normal Friends root/V2/Camera/fullscreen are untouched. Pages built exact `0baba295...` successfully. The gate uses a SHA-verified gzip of one offline-derived static runtime plus separately SHA-verified source-derived V3.1 modules/CSS. It does not runtime-patch another loader and adds no V3 pedal/reset/UI text surgery to compiled `main.js`. It deliberately retains the already owner-tested Steering V1 harness as inherited support.

Current V3.1 interaction intent:

- steering gesture remains X-only `POSITION`; shallow panoramic wheel rotates only as feedback;
- throttle and brake are independent analog pedals driven by relative upward thumb travel from pointer-down;
- pedal gesture geometry is frozen at pointer-down; active growth / neighbor shrink are presentation only;
- throttle and brake may coexist;
- D/R is a state selector and may switch while throttle is held and regardless of speed. **Owner explicitly wants this permissive behavior for now**; add neutral/release/speed locks only if device evidence later justifies them.

Recovered noncanonical evidence for exact V3.1 input code: focused analog/pointer tests `22/22 PASS`, TypeScript 5.8 scoped compile PASS, exact local/Git source blob identity PASS, all published JS syntax checks PASS. This is not the canonical Node24/npm11/TS7/Vite/real-box3d gate.

Rendered agent-side Chromium proof is environment-blocked: two attempts timed out before DOM. Direct HTTP retrieval from the container is also DNS-blocked. Do not classify either as product failure and do not spend repeated iterations repairing the container. GitHub Pages exact-SHA build and post-publication Git blob identity are PASS; real rendered/runtime/feel proof is now an owner-device gate.

Final rig geometry, Ackermann/tie-rod authority, steering feedback/back-drive and final handling remain open; JURE owns rig authoring. The 35-degree bridge is only a JV-Web product range.

## Next direction

1. owner drives `driving-v31-test` in normal mobile Chrome, Offroad first;
2. judge steering, throttle, brake and D/R independently: precision/recapture, low-medium-high pedal modulation, simultaneous steer+pedal, D/R under throttle, portrait/landscape ergonomics and visual feedback;
3. if boot fails, use the exact visible error as evidence — do not rebuild the whole system blindly;
4. absorb only owner-accepted behavior into durable checkpoints and iterate failed parts separately;
5. once the mobile driving-control language is stable, polish response curves/haptics and later return to additive dynamic camera assists;
6. before promotion to `main` / ordinary Friends, run canonical Node 24.16.0 + npm 11.13.x + TS7/Vite/real Box3D checks and canonical artifact smoke.

Do not reopen current JSPREV2 micro-optimization by default. Do not turn the temporary 35-degree bridge into final rig truth. Do not sacrifice proven input semantics for animation.

## Read order

1. `AGENTS.md`
2. `docs/PROJECT_STATE.md`
3. current slice source/tests
4. `docs/ARCHITECTURE.md` for stable boundaries
5. `docs/OWNER_CHECKPOINTS.md` only for owner acceptance
