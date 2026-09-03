from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2x-patch-ground-extent-control-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2vRunDynamicSupportTransitionRecycleControl( float spinRadiansPerSecond, int direction, float recycleDistance )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2x could not locate E2a2v runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2x could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2xRunDynamicSupportTransitionGroundExtentControl( float spinRadiansPerSecond, int direction, float recycleDistance, float groundHalfX )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2x function rename failed')

wheel_anchor = '    b3Wheel wheel = {};\n'
wheel_replacement = (
    '    if ( b3IsValidFloat( groundHalfX ) == false || groundHalfX < 0.75f || groundHalfX > 5.0f )\n'
    '    {\n'
    '        result.set( "valid", false );\n'
    '        return result;\n'
    '    }\n\n'
    + wheel_anchor
)
if clone.count(wheel_anchor) != 1:
    raise SystemExit(f'E2a2x expected one wheel anchor, found {clone.count(wheel_anchor)}')
clone = clone.replace(wheel_anchor, wheel_replacement, 1)

ground_anchor = '    b3BoxHull groundHull = b3MakeBoxHull( 5.0f, 0.10f, 5.0f );\n'
ground_replacement = '    b3BoxHull groundHull = b3MakeBoxHull( groundHalfX, 0.10f, 5.0f );\n'
if clone.count(ground_anchor) != 1:
    raise SystemExit(f'E2a2x expected one ground hull anchor, found {clone.count(ground_anchor)}')
clone = clone.replace(ground_anchor, ground_replacement, 1)

result_anchor = '    result.set( "requestedRecycleDistance", recycleDistance );\n'
result_replacement = result_anchor + '    result.set( "groundHalfX", groundHalfX );\n'
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2x expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2vRunDynamicSupportTransitionRecycleControl", &e2a2vRunDynamicSupportTransitionRecycleControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2x expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2xRunDynamicSupportTransitionGroundExtentControl", &e2a2xRunDynamicSupportTransitionGroundExtentControl );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2X_GROUND_EXTENT_CONTROL_BINDING_PATCH_OK')
