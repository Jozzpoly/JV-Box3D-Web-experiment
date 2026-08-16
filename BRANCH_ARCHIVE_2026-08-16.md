# JV-Web branch archive — 2026-08-16

Purpose: preserve exact branch-tip archaeology before repository branch cleanup. This file lives only on the archive branch and is not current project documentation.

## Authority after cleanup

- `main` — accepted private authority (`f8eb0908f5934aed2d504f34ce483a02754039ec` at inventory time)
- `work/mobile-driving-foundation` — clean active Mobile Driving line, created from exact V3.1 candidate `c0b3ed2223a451cdacfd79f179efd2b88be7434f`
- `checkpoint/mobile-driving-v31-recovery-2026-08-16` — exact pre-revert V3.1 recovery point
- durable closed-foundation checkpoints may remain where they add obvious rollback value

## Full private branch inventory before cleanup

```text
archive/pre-cleanup-2026-08-10                          ee77c4760a08a739a712fec5418e3489746ad63d
candidate/jv-web-owner-vehicle-visual-r1                796b050b4b90a2383803cab13f9dcd3aeca5f97f
candidate/jv-web-render-host-r1                         e263e3e05ea21e74585d74829136e3defbd67813
checkpoint/camera-manual-rig-v1-closed-2026-08-15       9e375824bb67224783208e0fcd99dc141db3f832
checkpoint/fullscreen-v1-owner-validated-2026-08-15     db55501342feacfb0f82099d7f47afe3a9756143
checkpoint/mobile-driving-v31-recovery-2026-08-16       c0b3ed2223a451cdacfd79f179efd2b88be7434f
checkpoint/perf-foundation-a53-validated-2026-08-15     f42e16321d9edb26e10f44ab7c9eeda3c646291c
checkpoint/perf-foundation-s3-2026-08-15                20eca0451c81581649e061c8bc61d45001e32601
checkpoint/perf-foundation-v1-closed-2026-08-15         c8d4fe6f7623f2605fe7df07c1f8ccdc353f1221
checkpoint/perf-interruption-recovery-2026-08-15        d013c6e964048a88d91d8ce4b00c5ba54f94cc04
checkpoint/perf-lowlevel-preexec-2026-08-15             05b0a6cbc275a9ac0f044c547fb90a277c06cecb
checkpoint/perf-lowlevel-repaired-validated-2026-08-15  1ad19c67449fe8c87603b40d8e7c6e9c5cbcd422
checkpoint/perf-lowlevel-source-candidate-2026-08-15    5eeb7437604817d13f5c08ae959ebf1d745da482
checkpoint/perf-lowlevel-validated-runtime-hardening-2026-08-15 ba366beeb0fc7ff1c51ae31ab52bf5992bfbf20f
checkpoint/perf-shadow-staged-hardening-recovery-2026-08-15 e022cdfa4aeec25abc07e47e43304eb856c94832
checkpoint/perf-validation-session-2026-08-15           d013c6e964048a88d91d8ce4b00c5ba54f94cc04
checkpoint/r1-drive-bridge-01-audited                    dabf8c3df0cf801517ddbd267ea4e5d3435e0abd
main                                                     f8eb0908f5934aed2d504f34ce483a02754039ec
noop-do-not-create                                       733b8a04586212f36d6f009f17d068cc7d03d56a
noop-should-not-create                                   67d66ed412342fee5445b2901d85a663a084bf4e
noop-should-not-create-2                                 67d66ed412342fee5445b2901d85a663a084bf4e
product/jv-web-car-map-scan                              c8e0bf24748b0a790a1c0039b1be801eef266580
repair/jv-web-release-r0                                 6e132a61f1ae0e81b15d954b32ed92ad1f60ec4e
work/friends-pages-r1                                    8a216a9eb52bbfdb5c553addd7cad0f9fe7b4060
work/friends-r1-live-perf                                c8d4fe6f7623f2605fe7df07c1f8ccdc353f1221
work/friends-r1-live-perf-hardening                      1ad19c67449fe8c87603b40d8e7c6e9c5cbcd422
work/friends-r1-usability                                8736a2b63441cebf9a735f5c302ffaee2b7858bf
work/front-corner-golden-rebuild-r1                      f69ad7d346ab7bc830c893a340f8ed2c46b57ed1
work/front-corner-golden-rebuild-r2                      4ad9de6fd0ff3b6b9193fa2fb17b7f77e0a67785
work/owner-rig-s1-attachment-authority                   393ef4600be5c83ef42bced4a8a451446e372c32
work/owner-rig-s1-clean-integration                      67d66ed412342fee5445b2901d85a663a084bf4e
```

## Cleanup classification

### Keep as ordinary refs
- `main`
- `work/mobile-driving-foundation`
- `checkpoint/mobile-driving-v31-recovery-2026-08-16`
- `checkpoint/perf-foundation-v1-closed-2026-08-15`
- `checkpoint/camera-manual-rig-v1-closed-2026-08-15`
- `checkpoint/fullscreen-v1-owner-validated-2026-08-15`
- this archive branch

### Delete after archive capture
All `noop-*`; old `candidate/*`; `repair/jv-web-release-r0`; superseded `product/*` and old `work/*` campaigns; duplicate/intermediate performance checkpoints; old drive-bridge ref. Their exact tips are preserved above and their meaningful content is already ancestral to later retained product/checkpoint history or explicitly historical.

### Temporary donor
`work/friends-r1-usability@8736a2b...` is retained only until useful post-revert hardening has been selectively transplanted into `work/mobile-driving-foundation`; then it should be deleted as an ordinary active branch.

## Public repository policy

Keep public refs conservative because they are deployment/rollback evidence. `release/r0` remains immutable; `release/friends-r1` remains the moving Pages line. Redundant intermediate public performance checkpoints may be removed only after confirming the retained known-good and owner-validated checkpoints cover rollback needs.
