from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2f-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2eRunMatchedSphereGroundControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2f could not locate E2a2e sphere runner')
runner = text[start:end]

controlled = runner.replace(
    'e2a2eRunMatchedSphereGroundControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )',
    'e2a2fRunMatchedSphereStartControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation )',
    1,
)

validation_anchor = (
    '         requestedSubStepCount < 1 || requestedSubStepCount > 16 )\n'
)
if controlled.count(validation_anchor) != 1:
    raise SystemExit('E2a2f validation anchor drifted')
controlled = controlled.replace(validation_anchor,
    '         requestedSubStepCount < 1 || requestedSubStepCount > 16 ||\n'
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f )\n')

position_anchor = '    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + 0.010f, 0.0f );\n'
if controlled.count(position_anchor) != 1:
    raise SystemExit('E2a2f start-position anchor drifted')
controlled = controlled.replace(position_anchor,
    '    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + startGap, 0.0f );\n')

fast_anchor = '    wheelBodyDef.allowFastRotation = true;\n'
if controlled.count(fast_anchor) != 1:
    raise SystemExit('E2a2f fast-rotation anchor drifted')
controlled = controlled.replace(fast_anchor,
    '    wheelBodyDef.allowFastRotation = allowFastRotation;\n')

result_anchor = '    result.set( "shapeControl", "matchedSphere" );\n'
if controlled.count(result_anchor) != 1:
    raise SystemExit('E2a2f result anchor drifted')
controlled = controlled.replace(result_anchor, result_anchor +
    '    result.set( "startGap", startGap );\n'
    '    result.set( "allowFastRotation", allowFastRotation );\n')

text = text[:end] + '\n' + controlled + text[end:]

binding_anchor = '\tfunction( "e2a2eRunMatchedSphereGroundControl", &e2a2eRunMatchedSphereGroundControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2f binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2fRunMatchedSphereStartControl", &e2a2fRunMatchedSphereStartControl );\n')

path.write_text(text, encoding='utf-8')
print('E2A2F_BINDINGS_PATCH_OK')
