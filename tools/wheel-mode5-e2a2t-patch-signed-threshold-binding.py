from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2t-patch-signed-threshold-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2sRunBiasedFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float supportBias )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2t could not locate E2a2s runner')
next_runner = text.find('\nstatic val ', start + len(sig))
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2t could not locate namespace end')
end = next_runner if 0 <= next_runner < namespace_end else namespace_end
runner = text[start:end]

helper = r'''

// E2a2t diagnostic-only carrier. Same two support endpoints as E2a2s, but the
// caller chooses which axial endpoint is retracted. This tests whether the
// source-predicted support-feature tolerance is symmetric under endpoint sign.
static bool e2a2tMakeSignedBiasedFlatCarrier( b3Wheel* wheelOut, int* rawProfileCountOut, int* effectiveProfileCountOut,
                                               float supportBias, int loweredSide )
{
    if ( b3IsValidFloat( supportBias ) == false || supportBias < 0.0f || supportBias > 0.00001f ||
         ( loweredSide != -1 && loweredSide != 1 ) )
    {
        return false;
    }

    float leftRadius = E2A2_FLAT_RADIUS - ( loweredSide == -1 ? supportBias : 0.0f );
    float rightRadius = E2A2_FLAT_RADIUS - ( loweredSide == 1 ? supportBias : 0.0f );
    b3Vec2 profile[2] = {
        { E2A2_FLAT_AXIAL_MIN, leftRadius },
        { E2A2_FLAT_AXIAL_MAX, rightRadius },
    };
    if ( rawProfileCountOut != nullptr )
    {
        *rawProfileCountOut = 2;
    }

    b3Wheel wheel = b3MakeWheelProfile( e1Vec( 0.0f, 0.0f, 0.0f ), b3Vec3_axisZ, profile, 2, 0.0f );
    b3Vec2 effective[B3_MAX_WHEEL_PROFILE_POINTS];
    int effectiveCount = b3GetWheelProfile( &wheel, effective );
    if ( effectiveProfileCountOut != nullptr )
    {
        *effectiveProfileCountOut = effectiveCount;
    }
    if ( effectiveCount != 2 )
    {
        return false;
    }
    *wheelOut = wheel;
    return true;
}
'''

new_sig = 'static val e2a2tRunSignedBiasFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float supportBias, int loweredSide )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2t function rename failed')

validation = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( supportBias ) == false || supportBias < 0.0f || supportBias > 0.015f )\n'
)
replacement = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( supportBias ) == false || supportBias < 0.0f || supportBias > 0.00001f ||\n'
    '         ( loweredSide != -1 && loweredSide != 1 ) )\n'
)
if clone.count(validation) != 1:
    raise SystemExit(f'E2a2t expected one validation anchor, found {clone.count(validation)}')
clone = clone.replace(validation, replacement, 1)

make_call = 'e2a2sMakeBiasedFlatCarrier( &wheel, &rawHullCount, &effectiveProfileCount, supportBias )'
if clone.count(make_call) != 1:
    raise SystemExit(f'E2a2t expected one E2a2s carrier call, found {clone.count(make_call)}')
clone = clone.replace(
    make_call,
    'e2a2tMakeSignedBiasedFlatCarrier( &wheel, &rawHullCount, &effectiveProfileCount, supportBias, loweredSide )',
    1,
)

result_anchor = '    result.set( "requestedSupportBias", supportBias );\n'
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2t expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_anchor + '    result.set( "loweredSide", loweredSide );\n', 1)

text = text[:end] + helper + '\n' + clone + text[end:]

binding_anchor = '\tfunction( "e2a2sRunBiasedFlatP75GroundCarrier", &e2a2sRunBiasedFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2t expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2tRunSignedBiasFlatP75GroundCarrier", &e2a2tRunSignedBiasFlatP75GroundCarrier );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2T_SIGNED_THRESHOLD_BINDING_PATCH_OK')
