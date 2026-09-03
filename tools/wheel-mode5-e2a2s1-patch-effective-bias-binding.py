from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2s1-patch-effective-bias-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2sRunBiasedFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float supportBias )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2s1 could not locate E2a2s runner')
next_runner = text.find('\nstatic val ', start + len(sig))
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2s1 could not locate namespace end')
end = next_runner if 0 <= next_runner < namespace_end else namespace_end
runner = text[start:end]

support_anchor = '    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );\n'
support_insert = (
    '    b3Vec2 e2a2s1EffectiveProfile[B3_MAX_WHEEL_PROFILE_POINTS];\n'
    '    int e2a2s1EffectiveCount = b3GetWheelProfile( &wheel, e2a2s1EffectiveProfile );\n'
    '    float e2a2s1EffectiveSupportBias = e2a2s1EffectiveCount == 2\n'
    '        ? fabsf( e2a2s1EffectiveProfile[0].y - e2a2s1EffectiveProfile[1].y )\n'
    '        : NAN;\n'
    + support_anchor
)
if runner.count(support_anchor) != 1:
    raise SystemExit(f'E2a2s1 expected exactly one support anchor, found {runner.count(support_anchor)}')
runner = runner.replace(support_anchor, support_insert, 1)

result_anchor = '    result.set( "requestedSupportBias", supportBias );\n'
result_insert = result_anchor + (
    '    result.set( "effectiveSupportBias", e2a2s1EffectiveSupportBias );\n'
    '    result.set( "effectiveProfileCountForBias", e2a2s1EffectiveCount );\n'
)
if runner.count(result_anchor) != 1:
    raise SystemExit(f'E2a2s1 expected exactly one bias result anchor, found {runner.count(result_anchor)}')
runner = runner.replace(result_anchor, result_insert, 1)

text = text[:start] + runner + text[end:]
path.write_text(text, encoding='utf-8')
print('E2A2S1_EFFECTIVE_BIAS_BINDING_PATCH_OK')
