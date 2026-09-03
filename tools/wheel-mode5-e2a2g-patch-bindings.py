from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2g-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2fRunMatchedSphereStartControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2g could not locate E2a2f sphere runner')
runner = text[start:end]

controlled = runner.replace(
    'e2a2fRunMatchedSphereStartControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation )',
    'e2a2gRunMatchedSphereLockControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode )',
    1,
)

validation_anchor = (
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f )\n'
)
if controlled.count(validation_anchor) != 1:
    raise SystemExit('E2a2g validation anchor drifted')
controlled = controlled.replace(validation_anchor,
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f || lockMode < 0 || lockMode > 2 )\n')

lock_block = '''    wheelBodyDef.motionLocks.linearX = true;
    wheelBodyDef.motionLocks.linearZ = true;
    wheelBodyDef.motionLocks.angularX = true;
    wheelBodyDef.motionLocks.angularY = true;
'''
lock_control = '''    // lockMode 0 = original E2a2b locks, 1 = translation-only locks,
    // lockMode 2 = completely free body. For the matched sphere with zero
    // friction, a centered normal force should create neither lateral motion
    // nor torque, so modes 1/2 are clean controls for lock-path coupling.
    if ( lockMode <= 1 )
    {
        wheelBodyDef.motionLocks.linearX = true;
        wheelBodyDef.motionLocks.linearZ = true;
    }
    if ( lockMode == 0 )
    {
        wheelBodyDef.motionLocks.angularX = true;
        wheelBodyDef.motionLocks.angularY = true;
    }
'''
if controlled.count(lock_block) != 1:
    raise SystemExit('E2a2g lock block drifted')
controlled = controlled.replace(lock_block, lock_control)

attitude_anchor = '    result.set( "attitudeLocked", true );\n'
if controlled.count(attitude_anchor) != 1:
    raise SystemExit('E2a2g attitude result anchor drifted')
controlled = controlled.replace(attitude_anchor,
    '    result.set( "attitudeLocked", lockMode == 0 );\n'
    '    result.set( "motionLockMode", lockMode );\n')

text = text[:end] + '\n' + controlled + text[end:]

binding_anchor = '\tfunction( "e2a2fRunMatchedSphereStartControl", &e2a2fRunMatchedSphereStartControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2g binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2gRunMatchedSphereLockControl", &e2a2gRunMatchedSphereLockControl );\n')

path.write_text(text, encoding='utf-8')
print('E2A2G_BINDINGS_PATCH_OK')
