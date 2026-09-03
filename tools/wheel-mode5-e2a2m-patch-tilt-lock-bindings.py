from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2m-patch-tilt-lock-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

runner_start_marker = 'static val e2a2RunFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
runner_start = text.find(runner_start_marker)
runner_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', runner_start)
if runner_start < 0 or runner_end < 0:
    raise SystemExit('E2a2m could not locate E2a2 runner')

runner = text[runner_start:runner_end]
runner_locked = runner.replace('e2a2RunFlatP75GroundCarrier', 'e2a2mRunFlatP75GroundCarrierTiltLocked', 1)
lock_anchor = '    wheelBodyDef.allowFastRotation = true;\n'
lock_insert = (
    lock_anchor +
    '    // E2a2m causal diagnostic: suppress only off-axis tilt while preserving axial roll Z.\n'
    '    wheelBodyDef.motionLocks.angularX = true;\n'
    '    wheelBodyDef.motionLocks.angularY = true;\n'
)
if runner_locked.count(lock_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one allowFastRotation anchor, found {runner_locked.count(lock_anchor)}')
runner_locked = runner_locked.replace(lock_anchor, lock_insert)

text = text[:runner_end] + '\n\n' + runner_locked + text[runner_end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
binding_replacement = binding_anchor + (
    '\tfunction( "e2a2mRunFlatP75GroundCarrierTiltLocked", &e2a2mRunFlatP75GroundCarrierTiltLocked );\n'
)
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E2A2M_TILT_LOCK_BINDINGS_PATCH_OK')
