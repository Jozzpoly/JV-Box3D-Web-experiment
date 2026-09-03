from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2h-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2gRunMatchedSphereLockControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2h could not locate E2a2g matched-sphere runner')
runner = text[start:end]

controlled = runner.replace(
    'e2a2gRunMatchedSphereLockControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode )',
    'e2a2hRunMatchedSphereRefreshControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount, float startGap, bool allowFastRotation, int lockMode, int refreshMode )',
    1,
)

validation_anchor = (
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f || lockMode < 0 || lockMode > 2 )\n'
)
if controlled.count(validation_anchor) != 1:
    raise SystemExit('E2a2h validation anchor drifted')
controlled = controlled.replace(validation_anchor,
    '         b3IsValidFloat( startGap ) == false || startGap < 0.0f || startGap > 0.05f || lockMode < 0 || lockMode > 2 ||\n'
    '         refreshMode < 0 || refreshMode > 1 )\n')

step_anchor = '        b3World_Step( worldId, dt, subStepCount );\n'
if controlled.count(step_anchor) != 1:
    raise SystemExit(f'E2a2h world-step anchor drifted: found {controlled.count(step_anchor)}')
controlled = controlled.replace(step_anchor,
    '        if ( refreshMode == 0 )\n'
    '        {\n'
    '            // Baseline: one narrow phase, then requestedSubStepCount solver substeps.\n'
    '            b3World_Step( worldId, dt, subStepCount );\n'
    '        }\n'
    '        else\n'
    '        {\n'
    '            // Refresh control: same physical outer interval and same number of solve slices,\n'
    '            // but each slice is a separate World_Step so narrow phase/contact anchors are rebuilt.\n'
    '            float microDt = dt / (float)subStepCount;\n'
    '            for ( int refreshIndex = 0; refreshIndex < subStepCount; ++refreshIndex )\n'
    '            {\n'
    '                b3World_Step( worldId, microDt, 1 );\n'
    '            }\n'
    '        }\n')

result_anchor = '    result.set( "motionLockMode", lockMode );\n'
if controlled.count(result_anchor) != 1:
    raise SystemExit('E2a2h result anchor drifted')
controlled = controlled.replace(result_anchor, result_anchor +
    '    result.set( "refreshMode", refreshMode );\n'
    '    result.set( "narrowPhaseRefreshesPerOuterStep", refreshMode == 0 ? 1 : subStepCount );\n'
    '    result.set( "solverSlicesPerOuterStep", subStepCount );\n')

text = text[:end] + '\n' + controlled + text[end:]

binding_anchor = '\tfunction( "e2a2gRunMatchedSphereLockControl", &e2a2gRunMatchedSphereLockControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2h binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2hRunMatchedSphereRefreshControl", &e2a2hRunMatchedSphereRefreshControl );\n')

path.write_text(text, encoding='utf-8')
print('E2A2H_BINDINGS_PATCH_OK')
