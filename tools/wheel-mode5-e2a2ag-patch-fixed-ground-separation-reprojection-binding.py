from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ag-patch-fixed-ground-separation-reprojection-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2afRunFixedGroundWheelMotionTransition( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2ag could not locate E2a2af fixed-ground runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2ag could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2agRunFixedGroundSeparationReprojectionAblation( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed, bool freezeRecycledSeparation )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2ag function rename failed')

setup_anchor = '    const float angularSpeed = crossingAngularSpeed;\n'
setup_replacement = (
    setup_anchor
    + '    b3E2a2ae_ResetFrozenPointCount();\n'
    + '    b3E2a2ae_SetFreezeRecycledSeparation( freezeRecycledSeparation );\n'
)
if clone.count(setup_anchor) != 1:
    raise SystemExit(f'E2a2ag expected one setup anchor, found {clone.count(setup_anchor)}')
clone = clone.replace(setup_anchor, setup_replacement, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "freezeRecycledSeparation", freezeRecycledSeparation );\n'
    + '    result.set( "frozenRecycledPointCount", b3E2a2ae_GetFrozenPointCount() );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2ag expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

return_anchor = '    return result;\n'
return_pos = clone.rfind(return_anchor)
if return_pos < 0:
    raise SystemExit('E2a2ag could not locate final return')
clone = clone[:return_pos] + '    b3E2a2ae_SetFreezeRecycledSeparation( false );\n' + clone[return_pos:]

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2afRunFixedGroundWheelMotionTransition", &e2a2afRunFixedGroundWheelMotionTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2ag expected one E2a2af binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2agRunFixedGroundSeparationReprojectionAblation", &e2a2agRunFixedGroundSeparationReprojectionAblation );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AG_FIXED_GROUND_SEPARATION_REPROJECTION_BINDING_PATCH_OK')
