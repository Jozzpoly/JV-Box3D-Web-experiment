from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2i-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2gRunMatchedSphereLockControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2i could not locate E2a2g matched-sphere runner')
runner = text[start:end]

controlled = runner.replace(
    'e2a2gRunMatchedSphereLockControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode )',
    'e2a2iRunMatchedSphereSpinAxisControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode, int spinAxis )',
    1,
)

validation_anchor = (
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f || lockMode < 0 || lockMode > 2 )\n'
)
if controlled.count(validation_anchor) != 1:
    raise SystemExit('E2a2i validation anchor drifted')
controlled = controlled.replace(validation_anchor,
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f || lockMode < 0 || lockMode > 2 ||\n'
    '         spinAxis < 0 || spinAxis > 2 )\n')

spin_anchor = '    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );\n'
if controlled.count(spin_anchor) != 1:
    raise SystemExit(f'E2a2i angular-velocity anchor drifted: found {controlled.count(spin_anchor)}')
controlled = controlled.replace(spin_anchor,
    '    if ( spinAxis == 0 )\n'
    '    {\n'
    '        wheelBodyDef.angularVelocity = e1Vec( spinRadiansPerSecond, 0.0f, 0.0f );\n'
    '    }\n'
    '    else if ( spinAxis == 1 )\n'
    '    {\n'
    '        wheelBodyDef.angularVelocity = e1Vec( 0.0f, spinRadiansPerSecond, 0.0f );\n'
    '    }\n'
    '    else\n'
    '    {\n'
    '        wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );\n'
    '    }\n')

result_anchor = '    result.set( "motionLockMode", lockMode );\n'
if controlled.count(result_anchor) != 1:
    raise SystemExit('E2a2i result anchor drifted')
controlled = controlled.replace(result_anchor, result_anchor +
    '    result.set( "spinAxis", spinAxis );\n')

text = text[:end] + '\n' + controlled + text[end:]

binding_anchor = '\tfunction( "e2a2gRunMatchedSphereLockControl", &e2a2gRunMatchedSphereLockControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2i binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2iRunMatchedSphereSpinAxisControl", &e2a2iRunMatchedSphereSpinAxisControl );\n')

path.write_text(text, encoding='utf-8')
print('E2A2I_BINDINGS_PATCH_OK')
