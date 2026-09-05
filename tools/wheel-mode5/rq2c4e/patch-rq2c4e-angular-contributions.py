from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c4e/patch-rq2c4e-angular-contributions.py <rq2c3-suite.hpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

if 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION' in text:
    raise SystemExit('RQ2C4E telemetry already present')
if 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT' not in text:
    raise SystemExit('RQ2C4E requires RQ2C4D telemetry to be composed first')

header_anchor = '// RQ2C4D transient composition adds read-only orientation-aware support-witness telemetry.\n'
if text.count(header_anchor) != 1:
    raise SystemExit(f'RQ2C4E header anchor drifted: expected 1, got {text.count(header_anchor)}')
text = text.replace(
    header_anchor,
    header_anchor + '// RQ2C4E transient composition decomposes authoritative support-witness velocity read-only.\n',
)

decl_anchor = '    float settledMaxFirstOrderAxialTiltMagnitude = 0.0f;\n'
if text.count(decl_anchor) != 1:
    raise SystemExit(f'RQ2C4E declaration anchor drifted: expected 1, got {text.count(decl_anchor)}')
text = text.replace(
    decl_anchor,
    decl_anchor +
    '    double settledTranslationTangentSum = 0.0;\n'
    '    double settledAbsTranslationTangentSum = 0.0;\n'
    '    double settledSpinTangentSum = 0.0;\n'
    '    double settledAbsSpinTangentSum = 0.0;\n'
    '    double settledRollingPairTangentSum = 0.0;\n'
    '    double settledAbsRollingPairTangentSum = 0.0;\n'
    '    double settledNonSpinTangentSum = 0.0;\n'
    '    double settledAbsNonSpinTangentSum = 0.0;\n'
    '    float settledMaxAbsTranslationTangent = 0.0f;\n'
    '    float settledMaxAbsSpinTangent = 0.0f;\n'
    '    float settledMaxAbsRollingPairTangent = 0.0f;\n'
    '    float settledMaxAbsNonSpinTangent = 0.0f;\n'
    '    float settledMaxNonSpinOmega = 0.0f;\n'
    '    double settledAbsScalarReconstructionErrorSum = 0.0;\n'
    '    float settledMaxAbsScalarReconstructionError = 0.0f;\n'
    '    float settledMaxVectorReconstructionError = 0.0f;\n'
    '    float settledPeakWitnessAbs = -1.0f;\n'
    '    float settledPeakWitnessSlip = NAN;\n'
    '    float settledPeakWitnessTranslationTangent = NAN;\n'
    '    float settledPeakWitnessSpinTangent = NAN;\n'
    '    float settledPeakWitnessRollingPairTangent = NAN;\n'
    '    float settledPeakWitnessNonSpinTangent = NAN;\n'
    '    float settledPeakWitnessReconstructedSlip = NAN;\n'
    '    float settledPeakWitnessScalarReconstructionError = NAN;\n',
)

sample_anchor = '        float firstOrderAxialTiltMagnitude = fabsf( supportAxial ) * axisError * fabsf( actualAxleOmega );\n'
if text.count(sample_anchor) != 1:
    raise SystemExit(f'RQ2C4E sample anchor drifted: expected 1, got {text.count(sample_anchor)}')
text = text.replace(
    sample_anchor,
    sample_anchor +
    '        b3Vec3 localCenterOfMass = b3Body_GetLocalCenterOfMass( wheelBody );\n'
    '        b3Vec3 supportFromComLocal = rq2cSub( supportLocal, localCenterOfMass );\n'
    '        b3Vec3 supportFromComWorld = b3RotateVector( q, supportFromComLocal );\n'
    '        float spinRate = rq2cDot( w, actualAxle );\n'
    '        b3Vec3 spinOmega = rq2cScale( spinRate, actualAxle );\n'
    '        b3Vec3 nonSpinOmega = rq2cSub( w, spinOmega );\n'
    '        b3Vec3 spinPointVelocity = rq2cCross( spinOmega, supportFromComWorld );\n'
    '        b3Vec3 nonSpinPointVelocity = rq2cCross( nonSpinOmega, supportFromComWorld );\n'
    '        b3Vec3 reconstructedSupportVelocity = rq2cAdd( v, rq2cAdd( spinPointVelocity, nonSpinPointVelocity ) );\n'
    '        float translationTangent = rq2cDot( v, targetHeading );\n'
    '        float spinTangent = rq2cDot( spinPointVelocity, targetHeading );\n'
    '        float rollingPairTangent = translationTangent + spinTangent;\n'
    '        float nonSpinTangent = rq2cDot( nonSpinPointVelocity, targetHeading );\n'
    '        float reconstructedWitnessSlip = rollingPairTangent + nonSpinTangent;\n'
    '        float scalarReconstructionError = reconstructedWitnessSlip - witnessSlip;\n'
    '        float vectorReconstructionError = rq2cLength( rq2cSub( reconstructedSupportVelocity, supportVelocity ) );\n'
    '        float nonSpinOmegaMagnitude = rq2cLength( nonSpinOmega );\n',
)

settled_anchor = '            settledMaxFirstOrderAxialTiltMagnitude = b3MaxFloat( settledMaxFirstOrderAxialTiltMagnitude, firstOrderAxialTiltMagnitude );\n'
if text.count(settled_anchor) != 1:
    raise SystemExit(f'RQ2C4E settled anchor drifted: expected 1, got {text.count(settled_anchor)}')
text = text.replace(
    settled_anchor,
    settled_anchor +
    '            settledTranslationTangentSum += translationTangent;\n'
    '            settledAbsTranslationTangentSum += fabsf( translationTangent );\n'
    '            settledSpinTangentSum += spinTangent;\n'
    '            settledAbsSpinTangentSum += fabsf( spinTangent );\n'
    '            settledRollingPairTangentSum += rollingPairTangent;\n'
    '            settledAbsRollingPairTangentSum += fabsf( rollingPairTangent );\n'
    '            settledNonSpinTangentSum += nonSpinTangent;\n'
    '            settledAbsNonSpinTangentSum += fabsf( nonSpinTangent );\n'
    '            settledMaxAbsTranslationTangent = b3MaxFloat( settledMaxAbsTranslationTangent, fabsf( translationTangent ) );\n'
    '            settledMaxAbsSpinTangent = b3MaxFloat( settledMaxAbsSpinTangent, fabsf( spinTangent ) );\n'
    '            settledMaxAbsRollingPairTangent = b3MaxFloat( settledMaxAbsRollingPairTangent, fabsf( rollingPairTangent ) );\n'
    '            settledMaxAbsNonSpinTangent = b3MaxFloat( settledMaxAbsNonSpinTangent, fabsf( nonSpinTangent ) );\n'
    '            settledMaxNonSpinOmega = b3MaxFloat( settledMaxNonSpinOmega, nonSpinOmegaMagnitude );\n'
    '            settledAbsScalarReconstructionErrorSum += fabsf( scalarReconstructionError );\n'
    '            settledMaxAbsScalarReconstructionError = b3MaxFloat( settledMaxAbsScalarReconstructionError, fabsf( scalarReconstructionError ) );\n'
    '            settledMaxVectorReconstructionError = b3MaxFloat( settledMaxVectorReconstructionError, vectorReconstructionError );\n'
    '            if ( fabsf( witnessSlip ) > settledPeakWitnessAbs )\n'
    '            {\n'
    '                settledPeakWitnessAbs = fabsf( witnessSlip );\n'
    '                settledPeakWitnessSlip = witnessSlip;\n'
    '                settledPeakWitnessTranslationTangent = translationTangent;\n'
    '                settledPeakWitnessSpinTangent = spinTangent;\n'
    '                settledPeakWitnessRollingPairTangent = rollingPairTangent;\n'
    '                settledPeakWitnessNonSpinTangent = nonSpinTangent;\n'
    '                settledPeakWitnessReconstructedSlip = reconstructedWitnessSlip;\n'
    '                settledPeakWitnessScalarReconstructionError = scalarReconstructionError;\n'
    '            }\n',
)

final_anchor = '    float finalSupportRadial = rq2cLength( finalSupportRadialVector );\n'
if text.count(final_anchor) != 1:
    raise SystemExit(f'RQ2C4E final anchor drifted: expected 1, got {text.count(final_anchor)}')
text = text.replace(
    final_anchor,
    final_anchor +
    '    b3Vec3 finalLocalCenterOfMass = b3Body_GetLocalCenterOfMass( wheelBody );\n'
    '    b3Vec3 finalSupportFromComLocal = rq2cSub( finalSupportLocal, finalLocalCenterOfMass );\n'
    '    b3Vec3 finalSupportFromComWorld = b3RotateVector( finalRotation, finalSupportFromComLocal );\n'
    '    float finalSpinRate = rq2cDot( finalAngular, finalAxle );\n'
    '    b3Vec3 finalSpinOmega = rq2cScale( finalSpinRate, finalAxle );\n'
    '    b3Vec3 finalNonSpinOmega = rq2cSub( finalAngular, finalSpinOmega );\n'
    '    b3Vec3 finalSpinPointVelocity = rq2cCross( finalSpinOmega, finalSupportFromComWorld );\n'
    '    b3Vec3 finalNonSpinPointVelocity = rq2cCross( finalNonSpinOmega, finalSupportFromComWorld );\n'
    '    b3Vec3 finalReconstructedSupportVelocity = rq2cAdd( finalVelocity, rq2cAdd( finalSpinPointVelocity, finalNonSpinPointVelocity ) );\n'
    '    float finalTranslationTangent = rq2cDot( finalVelocity, targetHeading );\n'
    '    float finalSpinTangent = rq2cDot( finalSpinPointVelocity, targetHeading );\n'
    '    float finalRollingPairTangent = finalTranslationTangent + finalSpinTangent;\n'
    '    float finalNonSpinTangent = rq2cDot( finalNonSpinPointVelocity, targetHeading );\n'
    '    float finalReconstructedWitnessSlip = finalRollingPairTangent + finalNonSpinTangent;\n'
    '    float finalScalarReconstructionError = finalReconstructedWitnessSlip - finalWitnessSlip;\n'
    '    float finalVectorReconstructionError = rq2cLength( rq2cSub( finalReconstructedSupportVelocity, finalSupportVelocity ) );\n'
    '    float finalNonSpinOmegaMagnitude = rq2cLength( finalNonSpinOmega );\n',
)

result_anchor = '    result.set( "settledMaxFirstOrderAxialTiltMagnitude", settledMaxFirstOrderAxialTiltMagnitude );\n'
if text.count(result_anchor) != 1:
    raise SystemExit(f'RQ2C4E result anchor drifted: expected 1, got {text.count(result_anchor)}')
text = text.replace(
    result_anchor,
    result_anchor +
    '    result.set( "rq2c4eInstrument", "RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION" );\n'
    '    result.set( "settledMeanTranslationTangent", settledSamples > 0 ? settledTranslationTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMeanAbsTranslationTangent", settledSamples > 0 ? settledAbsTranslationTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsTranslationTangent", settledMaxAbsTranslationTangent );\n'
    '    result.set( "settledMeanSpinTangent", settledSamples > 0 ? settledSpinTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMeanAbsSpinTangent", settledSamples > 0 ? settledAbsSpinTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsSpinTangent", settledMaxAbsSpinTangent );\n'
    '    result.set( "settledMeanRollingPairTangent", settledSamples > 0 ? settledRollingPairTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMeanAbsRollingPairTangent", settledSamples > 0 ? settledAbsRollingPairTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsRollingPairTangent", settledMaxAbsRollingPairTangent );\n'
    '    result.set( "settledMeanNonSpinTangent", settledSamples > 0 ? settledNonSpinTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMeanAbsNonSpinTangent", settledSamples > 0 ? settledAbsNonSpinTangentSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsNonSpinTangent", settledMaxAbsNonSpinTangent );\n'
    '    result.set( "settledMaxNonSpinOmega", settledMaxNonSpinOmega );\n'
    '    result.set( "settledMeanAbsScalarReconstructionError", settledSamples > 0 ? settledAbsScalarReconstructionErrorSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsScalarReconstructionError", settledMaxAbsScalarReconstructionError );\n'
    '    result.set( "settledMaxVectorReconstructionError", settledMaxVectorReconstructionError );\n'
    '    result.set( "settledPeakWitnessSlip", settledPeakWitnessSlip );\n'
    '    result.set( "settledPeakWitnessTranslationTangent", settledPeakWitnessTranslationTangent );\n'
    '    result.set( "settledPeakWitnessSpinTangent", settledPeakWitnessSpinTangent );\n'
    '    result.set( "settledPeakWitnessRollingPairTangent", settledPeakWitnessRollingPairTangent );\n'
    '    result.set( "settledPeakWitnessNonSpinTangent", settledPeakWitnessNonSpinTangent );\n'
    '    result.set( "settledPeakWitnessReconstructedSlip", settledPeakWitnessReconstructedSlip );\n'
    '    result.set( "settledPeakWitnessScalarReconstructionError", settledPeakWitnessScalarReconstructionError );\n',
)

final_result_anchor = '    result.set( "finalSupportRadial", finalSupportRadial );\n'
if text.count(final_result_anchor) != 1:
    raise SystemExit(f'RQ2C4E final-result anchor drifted: expected 1, got {text.count(final_result_anchor)}')
text = text.replace(
    final_result_anchor,
    final_result_anchor +
    '    result.set( "finalTranslationTangent", finalTranslationTangent );\n'
    '    result.set( "finalSpinTangent", finalSpinTangent );\n'
    '    result.set( "finalRollingPairTangent", finalRollingPairTangent );\n'
    '    result.set( "finalNonSpinTangent", finalNonSpinTangent );\n'
    '    result.set( "finalNonSpinOmega", finalNonSpinOmegaMagnitude );\n'
    '    result.set( "finalReconstructedWitnessSlip", finalReconstructedWitnessSlip );\n'
    '    result.set( "finalScalarReconstructionError", finalScalarReconstructionError );\n'
    '    result.set( "finalVectorReconstructionError", finalVectorReconstructionError );\n',
)

path.write_text(text, encoding='utf-8')
print('RQ2C4E_ANGULAR_CONTRIBUTION_PATCH_OK')
