from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2c-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2bRunFlatP75GroundCarrierLocked( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2c could not locate E2a2b locked runner')
runner = text[start:end]

configured = runner.replace(
    'e2a2bRunFlatP75GroundCarrierLocked( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )',
    'e2a2cRunFlatP75GroundCarrierLockedConfig( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount )',
    1,
)

validation_anchor = '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false )\n'
validation_replacement = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( timeStep ) == false || timeStep <= 0.0f || requestedStepCount < 240 || requestedStepCount > 2400 )\n'
)
if configured.count(validation_anchor) != 1:
    raise SystemExit('E2a2c validation anchor drifted')
configured = configured.replace(validation_anchor, validation_replacement)

warm_anchor = '    b3World_EnableWarmStarting( worldId, warmStarting );\n'
if configured.count(warm_anchor) != 1:
    raise SystemExit('E2a2c world-control anchor drifted')
configured = configured.replace(warm_anchor, warm_anchor +
    '    if ( contactRecycling == false )\n'
    '    {\n'
    '        b3World_SetContactRecycleDistance( worldId, 0.0f );\n'
    '    }\n')

step_anchor = '    const int stepCount = 480;\n    const float dt = 1.0f / 240.0f;\n'
if configured.count(step_anchor) != 1:
    raise SystemExit('E2a2c time-step anchor drifted')
configured = configured.replace(step_anchor,
    '    const int stepCount = requestedStepCount;\n'
    '    const float dt = timeStep;\n')

result_anchor = '    result.set( "attitudeLocked", true );\n'
if configured.count(result_anchor) != 1:
    raise SystemExit('E2a2c result anchor drifted')
configured = configured.replace(result_anchor, result_anchor +
    '    result.set( "contactRecycling", contactRecycling );\n')

text = text[:end] + '\n' + configured + text[end:]

binding_anchor = '\tfunction( "e2a2bRunFlatP75GroundCarrierLocked", &e2a2bRunFlatP75GroundCarrierLocked );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2c binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2cRunFlatP75GroundCarrierLockedConfig", &e2a2cRunFlatP75GroundCarrierLockedConfig );\n')

path.write_text(text, encoding='utf-8')
print('E2A2C_BINDINGS_PATCH_OK')
