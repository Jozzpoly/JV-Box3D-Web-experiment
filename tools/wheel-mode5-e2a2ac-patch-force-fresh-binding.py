from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ac-patch-force-fresh-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2zRunStaticGroundRateSweep( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2ac could not locate E2a2z runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2ac could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2acRunForceFreshRecyclerAblation( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed, bool forceFreshOnRecycleEligible )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2ac function rename failed')

setup_anchor = '    const float angularSpeed = crossingAngularSpeed;\n'
setup_replacement = (
    setup_anchor
    + '    b3E2a2ac_ResetRecycleEligibleCount();\n'
    + '    b3E2a2ac_SetForceFreshOnRecycleEligible( forceFreshOnRecycleEligible );\n'
)
if clone.count(setup_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one setup anchor, found {clone.count(setup_anchor)}')
clone = clone.replace(setup_anchor, setup_replacement, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "forceFreshOnRecycleEligible", forceFreshOnRecycleEligible );\n'
    + '    result.set( "recycleEligibleCount", b3E2a2ac_GetRecycleEligibleCount() );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

return_anchor = '    return result;\n'
if clone.count(return_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one return anchor, found {clone.count(return_anchor)}')
clone = clone.replace(
    return_anchor,
    '    b3E2a2ac_SetForceFreshOnRecycleEligible( false );\n' + return_anchor,
    1,
)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2zRunStaticGroundRateSweep", &e2a2zRunStaticGroundRateSweep );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2acRunForceFreshRecyclerAblation", &e2a2acRunForceFreshRecyclerAblation );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AC_FORCE_FRESH_BINDING_PATCH_OK')
