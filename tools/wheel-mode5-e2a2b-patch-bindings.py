from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2b-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2RunFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2b could not locate E2a2 runner')
runner = text[start:end]
locked = runner.replace('e2a2RunFlatP75GroundCarrier', 'e2a2bRunFlatP75GroundCarrierLocked', 1)

lock_anchor = '    wheelBodyDef.allowFastRotation = true;\n'
lock_insert = lock_anchor + (
    '    // E2a2b isolates circumferential spin phase from attitude/camber.\n'
    '    // The flat-support carrier has no shoulder authority once the wheel tilts.\n'
    '    wheelBodyDef.motionLocks.linearX = true;\n'
    '    wheelBodyDef.motionLocks.linearZ = true;\n'
    '    wheelBodyDef.motionLocks.angularX = true;\n'
    '    wheelBodyDef.motionLocks.angularY = true;\n'
)
if locked.count(lock_anchor) != 1:
    raise SystemExit('E2a2b body-def lock anchor drifted')
locked = locked.replace(lock_anchor, lock_insert)

result_anchor = '    result.set( "warmStarting", warmStarting );\n'
if locked.count(result_anchor) != 1:
    raise SystemExit('E2a2b result anchor drifted')
locked = locked.replace(result_anchor, result_anchor + '    result.set( "attitudeLocked", true );\n')

text = text[:end] + '\n' + locked + text[end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2b binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2bRunFlatP75GroundCarrierLocked", &e2a2bRunFlatP75GroundCarrierLocked );\n')

path.write_text(text, encoding='utf-8')
print('E2A2B_BINDINGS_PATCH_OK')
