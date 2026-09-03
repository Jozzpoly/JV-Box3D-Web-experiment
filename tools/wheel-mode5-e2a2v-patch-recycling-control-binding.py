from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2v-patch-recycling-control-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2uRunDynamicSupportTransition( float spinRadiansPerSecond, int direction )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2v could not locate E2a2u runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2v could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2vRunDynamicSupportTransitionRecycleControl( float spinRadiansPerSecond, int direction, float recycleDistance )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2v function rename failed')

validation = '    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || ( direction != 1 && direction != -1 ) )\n'
replacement = (
    '    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || ( direction != 1 && direction != -1 ) ||\n'
    '         b3IsValidFloat( recycleDistance ) == false || recycleDistance < 0.0f || recycleDistance > 0.05f )\n'
)
if clone.count(validation) != 1:
    raise SystemExit(f'E2a2v expected one validation anchor, found {clone.count(validation)}')
clone = clone.replace(validation, replacement, 1)

world_anchor = (
    '    b3WorldId worldId = b3CreateWorld( &worldDef );\n'
    '    b3World_EnableWarmStarting( worldId, true );\n'
)
world_replacement = world_anchor + (
    '    b3World_SetContactRecycleDistance( worldId, recycleDistance );\n'
    '    float configuredRecycleDistance = b3World_GetContactRecycleDistance( worldId );\n'
)
if clone.count(world_anchor) != 1:
    raise SystemExit(f'E2a2v expected one world anchor, found {clone.count(world_anchor)}')
clone = clone.replace(world_anchor, world_replacement, 1)

counter_anchor = '    int topologyMismatchCount = 0;\n'
counter_replacement = counter_anchor + (
    '    int recycledStepsMotion = 0;\n'
    '    int recycledContactCountSumMotion = 0;\n'
    '    int maxRecycledContactCountMotion = 0;\n'
)
if clone.count(counter_anchor) != 1:
    raise SystemExit(f'E2a2v expected one counter anchor, found {clone.count(counter_anchor)}')
clone = clone.replace(counter_anchor, counter_replacement, 1)

step_anchor = '        b3World_Step( worldId, dt, subStepCount );\n\n'
step_replacement = step_anchor + (
    '        if ( step >= settleSteps && step < settleSteps + motionSteps )\n'
    '        {\n'
    '            b3Counters counters = b3World_GetCounters( worldId );\n'
    '            if ( counters.recycledContactCount > 0 )\n'
    '            {\n'
    '                recycledStepsMotion += 1;\n'
    '            }\n'
    '            recycledContactCountSumMotion += counters.recycledContactCount;\n'
    '            maxRecycledContactCountMotion = b3MaxInt( maxRecycledContactCountMotion, counters.recycledContactCount );\n'
    '        }\n\n'
)
if clone.count(step_anchor) != 1:
    raise SystemExit(f'E2a2v expected one step anchor, found {clone.count(step_anchor)}')
clone = clone.replace(step_anchor, step_replacement, 1)

result_anchor = '    result.set( "warmStarting", true );\n'
result_replacement = result_anchor + (
    '    result.set( "requestedRecycleDistance", recycleDistance );\n'
    '    result.set( "configuredRecycleDistance", configuredRecycleDistance );\n'
    '    result.set( "recycledStepsMotion", recycledStepsMotion );\n'
    '    result.set( "recycledContactCountSumMotion", recycledContactCountSumMotion );\n'
    '    result.set( "maxRecycledContactCountMotion", maxRecycledContactCountMotion );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2v expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2uRunDynamicSupportTransition", &e2a2uRunDynamicSupportTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2v expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2vRunDynamicSupportTransitionRecycleControl", &e2a2vRunDynamicSupportTransitionRecycleControl );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2V_RECYCLING_CONTROL_BINDING_PATCH_OK')
