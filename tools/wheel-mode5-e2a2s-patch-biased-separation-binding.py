from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2s-patch-biased-separation-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

runner_sig = 'static val e2a2mRunFlatP75GroundCarrierTiltLocked( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
runner_start = text.find(runner_sig)
if runner_start < 0:
    raise SystemExit('E2a2s could not locate E2a2m tilt-locked runner')

next_runner = text.find('\nstatic val ', runner_start + len(runner_sig))
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', runner_start)
if namespace_end < 0:
    raise SystemExit('E2a2s could not locate namespace end')
runner_end = next_runner if 0 <= next_runner < namespace_end else namespace_end
runner = text[runner_start:runner_end]

helper = r'''

// E2a2s diagnostic-only carrier. It starts from the exact E2a2 broad-support
// endpoints but retracts only the +Z endpoint radially. This deliberately
// creates unequal geometric separation against a horizontal plane while
// keeping the same axle, ground normal and two-point support span.
static bool e2a2sMakeBiasedFlatCarrier( b3Wheel* wheelOut, int* rawProfileCountOut, int* effectiveProfileCountOut, float supportBias )
{
    if ( b3IsValidFloat( supportBias ) == false || supportBias < 0.0f || supportBias > 0.015f )
    {
        return false;
    }

    b3Vec2 profile[2] = {
        { E2A2_FLAT_AXIAL_MIN, E2A2_FLAT_RADIUS },
        { E2A2_FLAT_AXIAL_MAX, E2A2_FLAT_RADIUS - supportBias },
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

biased_sig = 'static val e2a2sRunBiasedFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float supportBias )\n'
biased = runner.replace(runner_sig, biased_sig, 1)
if biased == runner:
    raise SystemExit('E2a2s function rename failed')

validation_anchor = '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false )\n'
validation_replacement = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( supportBias ) == false || supportBias < 0.0f || supportBias > 0.015f )\n'
)
if biased.count(validation_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one validation anchor, found {biased.count(validation_anchor)}')
biased = biased.replace(validation_anchor, validation_replacement, 1)

make_call = 'e2a2MakeFlatCarrier( &wheel, &rawHullCount, &effectiveProfileCount )'
if biased.count(make_call) != 1:
    raise SystemExit(f'E2a2s expected exactly one flat-carrier call, found {biased.count(make_call)}')
biased = biased.replace(make_call, 'e2a2sMakeBiasedFlatCarrier( &wheel, &rawHullCount, &effectiveProfileCount, supportBias )', 1)

settled_anchor = '    float settledImpulseMax = -FLT_MAX;\n\n'
settled_insert = settled_anchor + (
    '    int settledPairGeometrySamples = 0;\n'
    '    uint32_t settledLowFeatureId = 0xFFFFFFFFu;\n'
    '    uint32_t settledHighFeatureId = 0xFFFFFFFFu;\n'
    '    bool settledFeaturePairStable = true;\n'
    '    double settledLowFeatureSeparationSum = 0.0;\n'
    '    double settledHighFeatureSeparationSum = 0.0;\n'
    '    double settledLowFeatureNormalImpulseSum = 0.0;\n'
    '    double settledHighFeatureNormalImpulseSum = 0.0;\n\n'
)
if biased.count(settled_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one settled accumulator anchor, found {biased.count(settled_anchor)}')
biased = biased.replace(settled_anchor, settled_insert, 1)

step_anchor = '        float finalNormalImpulse = 0.0f;\n'
step_insert = step_anchor + (
    '        uint32_t stepFeatureIds[2] = { 0xFFFFFFFFu, 0xFFFFFFFFu };\n'
    '        float stepFeatureSeparations[2] = { 0.0f, 0.0f };\n'
    '        float stepFeatureNormalImpulses[2] = { 0.0f, 0.0f };\n'
    '        int stepPairMetricCount = 0;\n'
)
if biased.count(step_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one per-step metric anchor, found {biased.count(step_anchor)}')
biased = biased.replace(step_anchor, step_insert, 1)

point_anchor = '                    finalNormalImpulse += point.normalImpulse;\n'
point_insert = point_anchor + (
    '                    if ( stepPairMetricCount < 2 )\n'
    '                    {\n'
    '                        stepFeatureIds[stepPairMetricCount] = point.featureId;\n'
    '                        stepFeatureSeparations[stepPairMetricCount] = point.separation;\n'
    '                        stepFeatureNormalImpulses[stepPairMetricCount] = point.normalImpulse;\n'
    '                        stepPairMetricCount += 1;\n'
    '                    }\n'
)
if biased.count(point_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one point metric anchor, found {biased.count(point_anchor)}')
biased = biased.replace(point_anchor, point_insert, 1)

sample_anchor = '            settledSamples += 1;\n'
pair_insert = (
    '            if ( stepPairMetricCount == 2 )\n'
    '            {\n'
    '                int lowIndex = stepFeatureIds[0] <= stepFeatureIds[1] ? 0 : 1;\n'
    '                int highIndex = 1 - lowIndex;\n'
    '                uint32_t lowId = stepFeatureIds[lowIndex];\n'
    '                uint32_t highId = stepFeatureIds[highIndex];\n'
    '                if ( settledLowFeatureId == 0xFFFFFFFFu )\n'
    '                {\n'
    '                    settledLowFeatureId = lowId;\n'
    '                    settledHighFeatureId = highId;\n'
    '                }\n'
    '                else if ( settledLowFeatureId != lowId || settledHighFeatureId != highId )\n'
    '                {\n'
    '                    settledFeaturePairStable = false;\n'
    '                }\n'
    '                settledLowFeatureSeparationSum += stepFeatureSeparations[lowIndex];\n'
    '                settledHighFeatureSeparationSum += stepFeatureSeparations[highIndex];\n'
    '                settledLowFeatureNormalImpulseSum += stepFeatureNormalImpulses[lowIndex];\n'
    '                settledHighFeatureNormalImpulseSum += stepFeatureNormalImpulses[highIndex];\n'
    '                settledPairGeometrySamples += 1;\n'
    '            }\n'
    + sample_anchor
)
if biased.count(sample_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one settled sample anchor, found {biased.count(sample_anchor)}')
biased = biased.replace(sample_anchor, pair_insert, 1)

result_anchor = '    result.set( "mass", mass );\n'
result_insert = result_anchor + '    result.set( "requestedSupportBias", supportBias );\n'
if biased.count(result_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one mass result anchor, found {biased.count(result_anchor)}')
biased = biased.replace(result_anchor, result_insert, 1)

impulse_result_anchor = '    result.set( "settledTotalImpulseMax", settledSamples > 0 ? settledImpulseMax : NAN );\n'
metric_results = impulse_result_anchor + (
    '    result.set( "settledPairGeometrySamples", settledPairGeometrySamples );\n'
    '    result.set( "settledFeaturePairStable", settledFeaturePairStable );\n'
    '    result.set( "settledLowFeatureId", settledLowFeatureId == 0xFFFFFFFFu ? 0u : settledLowFeatureId );\n'
    '    result.set( "settledHighFeatureId", settledHighFeatureId == 0xFFFFFFFFu ? 0u : settledHighFeatureId );\n'
    '    result.set( "settledLowFeatureSeparationMean", settledPairGeometrySamples > 0 ? settledLowFeatureSeparationSum / (double)settledPairGeometrySamples : NAN );\n'
    '    result.set( "settledHighFeatureSeparationMean", settledPairGeometrySamples > 0 ? settledHighFeatureSeparationSum / (double)settledPairGeometrySamples : NAN );\n'
    '    result.set( "settledLowFeatureNormalImpulseMean", settledPairGeometrySamples > 0 ? settledLowFeatureNormalImpulseSum / (double)settledPairGeometrySamples : NAN );\n'
    '    result.set( "settledHighFeatureNormalImpulseMean", settledPairGeometrySamples > 0 ? settledHighFeatureNormalImpulseSum / (double)settledPairGeometrySamples : NAN );\n'
)
if biased.count(impulse_result_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one settled result anchor, found {biased.count(impulse_result_anchor)}')
biased = biased.replace(impulse_result_anchor, metric_results, 1)

text = text[:runner_end] + helper + '\n' + biased + text[runner_end:]

binding_anchor = '\tfunction( "e2a2mRunFlatP75GroundCarrierTiltLocked", &e2a2mRunFlatP75GroundCarrierTiltLocked );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2s expected exactly one E2a2m binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2sRunBiasedFlatP75GroundCarrier", &e2a2sRunBiasedFlatP75GroundCarrier );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2S_BIASED_SEPARATION_BINDING_PATCH_OK')
