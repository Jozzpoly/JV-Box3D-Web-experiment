from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ab-patch-warm-start-control-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2zRunStaticGroundRateSweep( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2ab could not locate E2a2z runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2ab could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2abRunWarmStartAblation( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed, bool warmStarting )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2ab function rename failed')

world_anchor = '    b3WorldId worldId = b3CreateWorld( &worldDef );\n'
world_replacement = world_anchor + '    b3World_EnableWarmStarting( worldId, warmStarting );\n'
if clone.count(world_anchor) != 1:
    raise SystemExit(f'E2a2ab expected one world creation anchor, found {clone.count(world_anchor)}')
clone = clone.replace(world_anchor, world_replacement, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "warmStarting", warmStarting );\n'
    + '    result.set( "warmStartingEnabled", b3World_IsWarmStartingEnabled( worldId ) );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2ab expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2zRunStaticGroundRateSweep", &e2a2zRunStaticGroundRateSweep );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2ab expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2abRunWarmStartAblation", &e2a2abRunWarmStartAblation );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AB_WARM_START_CONTROL_BINDING_PATCH_OK')
