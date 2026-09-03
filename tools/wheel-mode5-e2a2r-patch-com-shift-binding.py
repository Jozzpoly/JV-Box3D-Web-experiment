from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2r-patch-com-shift-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

runner_sig = 'static val e2a2RunFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
runner_start = text.find(runner_sig)
if runner_start < 0:
    raise SystemExit('E2a2r could not locate E2a2 base runner')

next_runner = text.find('\nstatic val ', runner_start + len(runner_sig))
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', runner_start)
if namespace_end < 0:
    raise SystemExit('E2a2r could not locate namespace end')
runner_end = next_runner if 0 <= next_runner < namespace_end else namespace_end
runner = text[runner_start:runner_end]

asym_sig = 'static val e2a2rRunFlatP75GroundCarrierComShifted( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float comShiftZ )\n'
asym = runner.replace(runner_sig, asym_sig, 1)
if asym == runner:
    raise SystemExit('E2a2r function rename failed')

validation_anchor = '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false )\n'
validation_replacement = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( comShiftZ ) == false || fabsf( comShiftZ ) > 0.10f )\n'
)
if asym.count(validation_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one validation anchor, found {asym.count(validation_anchor)}')
asym = asym.replace(validation_anchor, validation_replacement, 1)

shape_anchor = '    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );\n\n'
shape_insert = shape_anchor + (
    '    // E2a2r diagnostic-only dynamic asymmetry: preserve mass and inertia but\n'
    '    // translate the body COM along the wheel axis relative to the unchanged\n'
    '    // symmetric flat support geometry. +50 mm remains well inside the\n'
    '    // +/-126.465 mm support interval, so a two-point static load split is\n'
    '    // physically possible without changing manifold geometry.\n'
    '    b3MassData massDataBeforeShift = b3Body_GetMassData( wheelBody );\n'
    '    b3MassData massDataAfterShift = massDataBeforeShift;\n'
    '    massDataAfterShift.center.z += comShiftZ;\n'
    '    b3Body_SetMassData( wheelBody, massDataAfterShift );\n'
    '    massDataAfterShift = b3Body_GetMassData( wheelBody );\n\n'
)
if asym.count(shape_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one wheel-shape anchor, found {asym.count(shape_anchor)}')
asym = asym.replace(shape_anchor, shape_insert, 1)

settled_anchor = '    float settledImpulseMax = -FLT_MAX;\n\n'
settled_insert = settled_anchor + (
    '    // E2a2r load-split proof. Sort the two support impulses by stable featureId\n'
    '    // so point-order reversal cannot change which accumulator receives a point.\n'
    '    int settledPairLoadSamples = 0;\n'
    '    uint32_t settledLowFeatureId = 0xFFFFFFFFu;\n'
    '    uint32_t settledHighFeatureId = 0xFFFFFFFFu;\n'
    '    bool settledFeaturePairStable = true;\n'
    '    double settledLowFeatureNormalImpulseSum = 0.0;\n'
    '    double settledHighFeatureNormalImpulseSum = 0.0;\n\n'
)
if asym.count(settled_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one settled accumulator anchor, found {asym.count(settled_anchor)}')
asym = asym.replace(settled_anchor, settled_insert, 1)

step_anchor = '        float finalNormalImpulse = 0.0f;\n'
step_insert = step_anchor + (
    '        uint32_t stepFeatureIds[2] = { 0xFFFFFFFFu, 0xFFFFFFFFu };\n'
    '        float stepFeatureNormalImpulses[2] = { 0.0f, 0.0f };\n'
    '        int stepFeatureImpulseCount = 0;\n'
)
if asym.count(step_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one per-step impulse anchor, found {asym.count(step_anchor)}')
asym = asym.replace(step_anchor, step_insert, 1)

point_anchor = '                    finalNormalImpulse += point.normalImpulse;\n'
point_insert = point_anchor + (
    '                    if ( stepFeatureImpulseCount < 2 )\n'
    '                    {\n'
    '                        stepFeatureIds[stepFeatureImpulseCount] = point.featureId;\n'
    '                        stepFeatureNormalImpulses[stepFeatureImpulseCount] = point.normalImpulse;\n'
    '                        stepFeatureImpulseCount += 1;\n'
    '                    }\n'
)
if asym.count(point_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one point impulse anchor, found {asym.count(point_anchor)}')
asym = asym.replace(point_anchor, point_insert, 1)

sample_anchor = '            settledSamples += 1;\n'
load_split_insert = (
    '            if ( stepFeatureImpulseCount == 2 )\n'
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
    '                settledLowFeatureNormalImpulseSum += stepFeatureNormalImpulses[lowIndex];\n'
    '                settledHighFeatureNormalImpulseSum += stepFeatureNormalImpulses[highIndex];\n'
    '                settledPairLoadSamples += 1;\n'
    '            }\n'
    + sample_anchor
)
if asym.count(sample_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one settled sample anchor, found {asym.count(sample_anchor)}')
asym = asym.replace(sample_anchor, load_split_insert, 1)

result_anchor = '    result.set( "mass", mass );\n'
result_insert = result_anchor + (
    '    result.set( "requestedComShiftZ", comShiftZ );\n'
    '    result.set( "originalLocalCenterZ", massDataBeforeShift.center.z );\n'
    '    result.set( "appliedLocalCenterZ", massDataAfterShift.center.z );\n'
)
if asym.count(result_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one mass result anchor, found {asym.count(result_anchor)}')
asym = asym.replace(result_anchor, result_insert, 1)

impulse_result_anchor = '    result.set( "settledTotalImpulseMax", settledSamples > 0 ? settledImpulseMax : NAN );\n'
impulse_result_insert = impulse_result_anchor + (
    '    result.set( "settledPairLoadSamples", settledPairLoadSamples );\n'
    '    result.set( "settledFeaturePairStable", settledFeaturePairStable );\n'
    '    result.set( "settledLowFeatureId", settledLowFeatureId == 0xFFFFFFFFu ? 0u : settledLowFeatureId );\n'
    '    result.set( "settledHighFeatureId", settledHighFeatureId == 0xFFFFFFFFu ? 0u : settledHighFeatureId );\n'
    '    result.set( "settledLowFeatureNormalImpulseMean", settledPairLoadSamples > 0 ? settledLowFeatureNormalImpulseSum / (double)settledPairLoadSamples : NAN );\n'
    '    result.set( "settledHighFeatureNormalImpulseMean", settledPairLoadSamples > 0 ? settledHighFeatureNormalImpulseSum / (double)settledPairLoadSamples : NAN );\n'
)
if asym.count(impulse_result_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one settled impulse result anchor, found {asym.count(impulse_result_anchor)}')
asym = asym.replace(impulse_result_anchor, impulse_result_insert, 1)

text = text[:runner_end] + '\n\n' + asym + text[runner_end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one E2a2 binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2rRunFlatP75GroundCarrierComShifted", &e2a2rRunFlatP75GroundCarrierComShifted );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2R_COM_SHIFT_BINDING_PATCH_OK')
