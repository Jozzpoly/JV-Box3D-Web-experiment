from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2z-patch-static-ground-rate-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2yRunStaticGroundTransformTransition( float spinRadiansPerSecond, int direction, float recycleDistance )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2z could not locate E2a2y runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2z could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2zRunStaticGroundRateSweep( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2z function rename failed')

old_validation = (
    '    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || ( direction != 1 && direction != -1 ) ||\n'
    '         b3IsValidFloat( recycleDistance ) == false || recycleDistance < 0.0f || recycleDistance > 0.05f )\n'
)
new_validation = (
    '    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || ( direction != 1 && direction != -1 ) ||\n'
    '         b3IsValidFloat( recycleDistance ) == false || recycleDistance < 0.0f || recycleDistance > 0.05f ||\n'
    '         b3IsValidFloat( crossingAngularSpeed ) == false || crossingAngularSpeed <= 0.0f || crossingAngularSpeed > 2.0e-4f )\n'
)
if clone.count(old_validation) != 1:
    raise SystemExit(f'E2a2z expected one validation block, found {clone.count(old_validation)}')
clone = clone.replace(old_validation, new_validation, 1)

old_speed = '    const float angularSpeed = 2.0e-5f;\n'
new_speed = '    const float angularSpeed = crossingAngularSpeed;\n'
if clone.count(old_speed) != 1:
    raise SystemExit(f'E2a2z expected one angularSpeed constant, found {clone.count(old_speed)}')
clone = clone.replace(old_speed, new_speed, 1)

result_anchor = '    result.set( "groundTransformSetCount", motionSteps );\n'
result_replacement = result_anchor + '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2z expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2yRunStaticGroundTransformTransition", &e2a2yRunStaticGroundTransformTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2z expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2zRunStaticGroundRateSweep", &e2a2zRunStaticGroundRateSweep );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2Z_STATIC_GROUND_RATE_BINDING_PATCH_OK')
