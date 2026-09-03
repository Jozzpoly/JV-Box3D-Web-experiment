from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2d-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2cRunFlatP75GroundCarrierLockedConfig( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2d could not locate E2a2c configurable runner')
runner = text[start:end]

configured = runner.replace(
    'e2a2cRunFlatP75GroundCarrierLockedConfig( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount )',
    'e2a2dRunFlatP75GroundCarrierLockedSubsteps( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )',
    1,
)

validation_anchor = (
    '         b3IsValidFloat( timeStep ) == false || timeStep <= 0.0f || requestedStepCount < 240 || requestedStepCount > 2400 )\n'
)
if configured.count(validation_anchor) != 1:
    raise SystemExit('E2a2d validation anchor drifted')
configured = configured.replace(validation_anchor,
    '         b3IsValidFloat( timeStep ) == false || timeStep <= 0.0f || requestedStepCount < 240 || requestedStepCount > 2400 ||\n'
    '         requestedSubStepCount < 1 || requestedSubStepCount > 16 )\n')

substep_anchor = '    const int subStepCount = 4;\n'
if configured.count(substep_anchor) != 1:
    raise SystemExit('E2a2d substep anchor drifted')
configured = configured.replace(substep_anchor, '    const int subStepCount = requestedSubStepCount;\n')

text = text[:end] + '\n' + configured + text[end:]

binding_anchor = '\tfunction( "e2a2cRunFlatP75GroundCarrierLockedConfig", &e2a2cRunFlatP75GroundCarrierLockedConfig );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2d binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2dRunFlatP75GroundCarrierLockedSubsteps", &e2a2dRunFlatP75GroundCarrierLockedSubsteps );\n')

path.write_text(text, encoding='utf-8')
print('E2A2D_BINDINGS_PATCH_OK')
