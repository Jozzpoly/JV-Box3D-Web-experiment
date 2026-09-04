from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ad-patch-recycled-normal-impulse-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2zRunStaticGroundRateSweep( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2ad could not locate E2a2z runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2ad could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2adRunRecycledNormalImpulseAblation( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed, bool zeroRecycledNormalImpulse )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2ad function rename failed')

setup_anchor = '    const float angularSpeed = crossingAngularSpeed;\n'
setup_replacement = (
    setup_anchor
    + '    b3E2a2ad_ResetZeroedPointCount();\n'
    + '    b3E2a2ad_SetZeroRecycledNormalImpulse( zeroRecycledNormalImpulse );\n'
)
if clone.count(setup_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one setup anchor, found {clone.count(setup_anchor)}')
clone = clone.replace(setup_anchor, setup_replacement, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "zeroRecycledNormalImpulse", zeroRecycledNormalImpulse );\n'
    + '    result.set( "zeroedRecycledPointCount", b3E2a2ad_GetZeroedPointCount() );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

return_anchor = '    return result;\n'
return_pos = clone.rfind(return_anchor)
if return_pos < 0:
    raise SystemExit('E2a2ad could not locate final function return')
clone = (
    clone[:return_pos]
    + '    b3E2a2ad_SetZeroRecycledNormalImpulse( false );\n'
    + clone[return_pos:]
)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2zRunStaticGroundRateSweep", &e2a2zRunStaticGroundRateSweep );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2adRunRecycledNormalImpulseAblation", &e2a2adRunRecycledNormalImpulseAblation );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AD_RECYCLED_NORMAL_IMPULSE_BINDING_PATCH_OK')
