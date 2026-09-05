from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c4f/patch-rq2c4f-rolling-pair-closure.py <rq2c3-suite.hpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

if 'RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION' in text:
    raise SystemExit('RQ2C4F telemetry already present')
if 'RQ2C4E_ANGULAR_CONTRIBUTION_LOCALIZATION' not in text:
    raise SystemExit('RQ2C4F requires RQ2C4E telemetry to be composed first')

header_anchor = '// RQ2C4E transient composition decomposes authoritative support-witness velocity read-only.\n'
if text.count(header_anchor) != 1:
    raise SystemExit(f'RQ2C4F header anchor drifted: expected 1, got {text.count(header_anchor)}')
text = text.replace(
    header_anchor,
    header_anchor + '// RQ2C4F transient composition localizes rolling-pair closure evolution read-only.\n',
)

baseline_anchor = '    int firstContactStep = -1;\n'
if text.count(baseline_anchor) != 1:
    raise SystemExit(f'RQ2C4F baseline anchor drifted: expected 1, got {text.count(baseline_anchor)}')
baseline_code = '''    b3Quat rq2c4fBaselineRotation = b3Body_GetRotation( wheelBody );
    b3Vec3 rq2c4fBaselineVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 rq2c4fBaselineAngular = b3Body_GetAngularVelocity( wheelBody );
    b3Vec3 rq2c4fBaselineAxle = b3RotateVector( rq2c4fBaselineRotation, b3Vec3_axisZ );
    b3Vec3 rq2c4fBaselineLocalDown = b3InvRotateVector( rq2c4fBaselineRotation, e1Vec( 0.0f, -1.0f, 0.0f ) );
    b3Vec3 rq2c4fBaselineSupportLocal = b3ComputeWheelSupport( &wheel, rq2c4fBaselineLocalDown );
    b3Vec3 rq2c4fBaselineLocalCenterOfMass = b3Body_GetLocalCenterOfMass( wheelBody );
    b3Vec3 rq2c4fBaselineSupportFromComWorld = b3RotateVector(
        rq2c4fBaselineRotation,
        rq2cSub( rq2c4fBaselineSupportLocal, rq2c4fBaselineLocalCenterOfMass ) );
    float rq2c4fBaselineTranslationTangent = rq2cDot( rq2c4fBaselineVelocity, targetHeading );
    float rq2c4fBaselineSpinRate = rq2cDot( rq2c4fBaselineAngular, rq2c4fBaselineAxle );
    float rq2c4fBaselineSpinLever = rq2cDot(
        rq2cCross( rq2c4fBaselineAxle, rq2c4fBaselineSupportFromComWorld ), targetHeading );
    float rq2c4fBaselineSpinTangent = rq2c4fBaselineSpinRate * rq2c4fBaselineSpinLever;
    float rq2c4fBaselineRollingPair = rq2c4fBaselineTranslationTangent + rq2c4fBaselineSpinTangent;

'''
text = text.replace(baseline_anchor, baseline_code + baseline_anchor)

decl_anchor = '    float settledPeakWitnessScalarReconstructionError = NAN;\n'
if text.count(decl_anchor) != 1:
    raise SystemExit(f'RQ2C4F declaration anchor drifted: expected 1, got {text.count(decl_anchor)}')
text = text.replace(
    decl_anchor,
    decl_anchor +
    '    double rq2c4fSettledDeltaTranslationSum = 0.0;\n'
    '    double rq2c4fSettledAbsDeltaTranslationSum = 0.0;\n'
    '    double rq2c4fSettledSpinRateContributionSum = 0.0;\n'
    '    double rq2c4fSettledAbsSpinRateContributionSum = 0.0;\n'
    '    double rq2c4fSettledLeverContributionSum = 0.0;\n'
    '    double rq2c4fSettledAbsLeverContributionSum = 0.0;\n'
    '    double rq2c4fSettledReconstructedRollingPairSum = 0.0;\n'
    '    double rq2c4fSettledAbsReconstructedRollingPairSum = 0.0;\n'
    '    double rq2c4fSettledAbsClosureReconstructionErrorSum = 0.0;\n'
    '    double rq2c4fSettledAbsDeltaSpinRateSum = 0.0;\n'
    '    double rq2c4fSettledAbsDeltaSpinLeverSum = 0.0;\n'
    '    float rq2c4fSettledMaxAbsDeltaTranslation = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsSpinRateContribution = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsLeverContribution = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsReconstructedRollingPair = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsClosureReconstructionError = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsDeltaSpinRate = 0.0f;\n'
    '    float rq2c4fSettledMaxAbsDeltaSpinLever = 0.0f;\n'
    '    float rq2c4fPeakWitnessDeltaTranslation = NAN;\n'
    '    float rq2c4fPeakWitnessDeltaSpinRate = NAN;\n'
    '    float rq2c4fPeakWitnessDeltaSpinLever = NAN;\n'
    '    float rq2c4fPeakWitnessSpinRateContribution = NAN;\n'
    '    float rq2c4fPeakWitnessLeverContribution = NAN;\n'
    '    float rq2c4fPeakWitnessReconstructedRollingPair = NAN;\n'
    '    float rq2c4fPeakWitnessClosureReconstructionError = NAN;\n'
    '    float rq2c4fPeakRollingPairAbs = -1.0f;\n'
    '    float rq2c4fPeakRollingPairValue = NAN;\n'
    '    float rq2c4fPeakRollingPairDeltaTranslation = NAN;\n'
    '    float rq2c4fPeakRollingPairDeltaSpinRate = NAN;\n'
    '    float rq2c4fPeakRollingPairDeltaSpinLever = NAN;\n'
    '    float rq2c4fPeakRollingPairSpinRateContribution = NAN;\n'
    '    float rq2c4fPeakRollingPairLeverContribution = NAN;\n'
    '    float rq2c4fPeakRollingPairReconstructed = NAN;\n'
    '    float rq2c4fPeakRollingPairClosureReconstructionError = NAN;\n',
)

sample_anchor = '        float nonSpinOmegaMagnitude = rq2cLength( nonSpinOmega );\n'
if text.count(sample_anchor) != 1:
    raise SystemExit(f'RQ2C4F sample anchor drifted: expected 1, got {text.count(sample_anchor)}')
text = text.replace(
    sample_anchor,
    sample_anchor +
    '        float rq2c4fSpinLever = rq2cDot( rq2cCross( actualAxle, supportFromComWorld ), targetHeading );\n'
    '        float rq2c4fDeltaTranslation = translationTangent - rq2c4fBaselineTranslationTangent;\n'
    '        float rq2c4fDeltaSpinRate = spinRate - rq2c4fBaselineSpinRate;\n'
    '        float rq2c4fDeltaSpinLever = rq2c4fSpinLever - rq2c4fBaselineSpinLever;\n'
    '        float rq2c4fSpinRateContribution = rq2c4fDeltaSpinRate * 0.5f * ( rq2c4fSpinLever + rq2c4fBaselineSpinLever );\n'
    '        float rq2c4fLeverContribution = rq2c4fDeltaSpinLever * 0.5f * ( spinRate + rq2c4fBaselineSpinRate );\n'
    '        float rq2c4fReconstructedRollingPair = rq2c4fBaselineRollingPair + rq2c4fDeltaTranslation + rq2c4fSpinRateContribution + rq2c4fLeverContribution;\n'
    '        float rq2c4fClosureReconstructionError = rq2c4fReconstructedRollingPair - rollingPairTangent;\n',
)

settled_anchor = '            settledMaxVectorReconstructionError = b3MaxFloat( settledMaxVectorReconstructionError, vectorReconstructionError );\n'
if text.count(settled_anchor) != 1:
    raise SystemExit(f'RQ2C4F settled anchor drifted: expected 1, got {text.count(settled_anchor)}')
text = text.replace(
    settled_anchor,
    settled_anchor +
    '            rq2c4fSettledDeltaTranslationSum += rq2c4fDeltaTranslation;\n'
    '            rq2c4fSettledAbsDeltaTranslationSum += fabsf( rq2c4fDeltaTranslation );\n'
    '            rq2c4fSettledSpinRateContributionSum += rq2c4fSpinRateContribution;\n'
    '            rq2c4fSettledAbsSpinRateContributionSum += fabsf( rq2c4fSpinRateContribution );\n'
    '            rq2c4fSettledLeverContributionSum += rq2c4fLeverContribution;\n'
    '            rq2c4fSettledAbsLeverContributionSum += fabsf( rq2c4fLeverContribution );\n'
    '            rq2c4fSettledReconstructedRollingPairSum += rq2c4fReconstructedRollingPair;\n'
    '            rq2c4fSettledAbsReconstructedRollingPairSum += fabsf( rq2c4fReconstructedRollingPair );\n'
    '            rq2c4fSettledAbsClosureReconstructionErrorSum += fabsf( rq2c4fClosureReconstructionError );\n'
    '            rq2c4fSettledAbsDeltaSpinRateSum += fabsf( rq2c4fDeltaSpinRate );\n'
    '            rq2c4fSettledAbsDeltaSpinLeverSum += fabsf( rq2c4fDeltaSpinLever );\n'
    '            rq2c4fSettledMaxAbsDeltaTranslation = b3MaxFloat( rq2c4fSettledMaxAbsDeltaTranslation, fabsf( rq2c4fDeltaTranslation ) );\n'
    '            rq2c4fSettledMaxAbsSpinRateContribution = b3MaxFloat( rq2c4fSettledMaxAbsSpinRateContribution, fabsf( rq2c4fSpinRateContribution ) );\n'
    '            rq2c4fSettledMaxAbsLeverContribution = b3MaxFloat( rq2c4fSettledMaxAbsLeverContribution, fabsf( rq2c4fLeverContribution ) );\n'
    '            rq2c4fSettledMaxAbsReconstructedRollingPair = b3MaxFloat( rq2c4fSettledMaxAbsReconstructedRollingPair, fabsf( rq2c4fReconstructedRollingPair ) );\n'
    '            rq2c4fSettledMaxAbsClosureReconstructionError = b3MaxFloat( rq2c4fSettledMaxAbsClosureReconstructionError, fabsf( rq2c4fClosureReconstructionError ) );\n'
    '            rq2c4fSettledMaxAbsDeltaSpinRate = b3MaxFloat( rq2c4fSettledMaxAbsDeltaSpinRate, fabsf( rq2c4fDeltaSpinRate ) );\n'
    '            rq2c4fSettledMaxAbsDeltaSpinLever = b3MaxFloat( rq2c4fSettledMaxAbsDeltaSpinLever, fabsf( rq2c4fDeltaSpinLever ) );\n'
    '            if ( fabsf( rollingPairTangent ) > rq2c4fPeakRollingPairAbs )\n'
    '            {\n'
    '                rq2c4fPeakRollingPairAbs = fabsf( rollingPairTangent );\n'
    '                rq2c4fPeakRollingPairValue = rollingPairTangent;\n'
    '                rq2c4fPeakRollingPairDeltaTranslation = rq2c4fDeltaTranslation;\n'
    '                rq2c4fPeakRollingPairDeltaSpinRate = rq2c4fDeltaSpinRate;\n'
    '                rq2c4fPeakRollingPairDeltaSpinLever = rq2c4fDeltaSpinLever;\n'
    '                rq2c4fPeakRollingPairSpinRateContribution = rq2c4fSpinRateContribution;\n'
    '                rq2c4fPeakRollingPairLeverContribution = rq2c4fLeverContribution;\n'
    '                rq2c4fPeakRollingPairReconstructed = rq2c4fReconstructedRollingPair;\n'
    '                rq2c4fPeakRollingPairClosureReconstructionError = rq2c4fClosureReconstructionError;\n'
    '            }\n',
)

peak_witness_anchor = '                settledPeakWitnessScalarReconstructionError = scalarReconstructionError;\n'
if text.count(peak_witness_anchor) != 1:
    raise SystemExit(f'RQ2C4F peak-witness anchor drifted: expected 1, got {text.count(peak_witness_anchor)}')
text = text.replace(
    peak_witness_anchor,
    peak_witness_anchor +
    '                rq2c4fPeakWitnessDeltaTranslation = rq2c4fDeltaTranslation;\n'
    '                rq2c4fPeakWitnessDeltaSpinRate = rq2c4fDeltaSpinRate;\n'
    '                rq2c4fPeakWitnessDeltaSpinLever = rq2c4fDeltaSpinLever;\n'
    '                rq2c4fPeakWitnessSpinRateContribution = rq2c4fSpinRateContribution;\n'
    '                rq2c4fPeakWitnessLeverContribution = rq2c4fLeverContribution;\n'
    '                rq2c4fPeakWitnessReconstructedRollingPair = rq2c4fReconstructedRollingPair;\n'
    '                rq2c4fPeakWitnessClosureReconstructionError = rq2c4fClosureReconstructionError;\n',
)

final_anchor = '    float finalNonSpinOmegaMagnitude = rq2cLength( finalNonSpinOmega );\n'
if text.count(final_anchor) != 1:
    raise SystemExit(f'RQ2C4F final anchor drifted: expected 1, got {text.count(final_anchor)}')
text = text.replace(
    final_anchor,
    final_anchor +
    '    float rq2c4fFinalSpinLever = rq2cDot( rq2cCross( finalAxle, finalSupportFromComWorld ), targetHeading );\n'
    '    float rq2c4fFinalDeltaTranslation = finalTranslationTangent - rq2c4fBaselineTranslationTangent;\n'
    '    float rq2c4fFinalDeltaSpinRate = finalSpinRate - rq2c4fBaselineSpinRate;\n'
    '    float rq2c4fFinalDeltaSpinLever = rq2c4fFinalSpinLever - rq2c4fBaselineSpinLever;\n'
    '    float rq2c4fFinalSpinRateContribution = rq2c4fFinalDeltaSpinRate * 0.5f * ( rq2c4fFinalSpinLever + rq2c4fBaselineSpinLever );\n'
    '    float rq2c4fFinalLeverContribution = rq2c4fFinalDeltaSpinLever * 0.5f * ( finalSpinRate + rq2c4fBaselineSpinRate );\n'
    '    float rq2c4fFinalReconstructedRollingPair = rq2c4fBaselineRollingPair + rq2c4fFinalDeltaTranslation + rq2c4fFinalSpinRateContribution + rq2c4fFinalLeverContribution;\n'
    '    float rq2c4fFinalClosureReconstructionError = rq2c4fFinalReconstructedRollingPair - finalRollingPairTangent;\n',
)

result_anchor = '    result.set( "finalVectorReconstructionError", finalVectorReconstructionError );\n'
if text.count(result_anchor) != 1:
    raise SystemExit(f'RQ2C4F result anchor drifted: expected 1, got {text.count(result_anchor)}')
text = text.replace(
    result_anchor,
    result_anchor +
    '    result.set( "rq2c4fInstrument", "RQ2C4F_ROLLING_PAIR_CLOSURE_LOCALIZATION" );\n'
    '    result.set( "rq2c4fBaselineTranslationTangent", rq2c4fBaselineTranslationTangent );\n'
    '    result.set( "rq2c4fBaselineSpinRate", rq2c4fBaselineSpinRate );\n'
    '    result.set( "rq2c4fBaselineSpinLever", rq2c4fBaselineSpinLever );\n'
    '    result.set( "rq2c4fBaselineSpinTangent", rq2c4fBaselineSpinTangent );\n'
    '    result.set( "rq2c4fBaselineRollingPair", rq2c4fBaselineRollingPair );\n'
    '    result.set( "rq2c4fSettledMeanDeltaTranslation", settledSamples > 0 ? rq2c4fSettledDeltaTranslationSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMeanAbsDeltaTranslation", settledSamples > 0 ? rq2c4fSettledAbsDeltaTranslationSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsDeltaTranslation", rq2c4fSettledMaxAbsDeltaTranslation );\n'
    '    result.set( "rq2c4fSettledMeanSpinRateContribution", settledSamples > 0 ? rq2c4fSettledSpinRateContributionSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMeanAbsSpinRateContribution", settledSamples > 0 ? rq2c4fSettledAbsSpinRateContributionSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsSpinRateContribution", rq2c4fSettledMaxAbsSpinRateContribution );\n'
    '    result.set( "rq2c4fSettledMeanLeverContribution", settledSamples > 0 ? rq2c4fSettledLeverContributionSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMeanAbsLeverContribution", settledSamples > 0 ? rq2c4fSettledAbsLeverContributionSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsLeverContribution", rq2c4fSettledMaxAbsLeverContribution );\n'
    '    result.set( "rq2c4fSettledMeanReconstructedRollingPair", settledSamples > 0 ? rq2c4fSettledReconstructedRollingPairSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMeanAbsReconstructedRollingPair", settledSamples > 0 ? rq2c4fSettledAbsReconstructedRollingPairSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsReconstructedRollingPair", rq2c4fSettledMaxAbsReconstructedRollingPair );\n'
    '    result.set( "rq2c4fSettledMeanAbsClosureReconstructionError", settledSamples > 0 ? rq2c4fSettledAbsClosureReconstructionErrorSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsClosureReconstructionError", rq2c4fSettledMaxAbsClosureReconstructionError );\n'
    '    result.set( "rq2c4fSettledMeanAbsDeltaSpinRate", settledSamples > 0 ? rq2c4fSettledAbsDeltaSpinRateSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsDeltaSpinRate", rq2c4fSettledMaxAbsDeltaSpinRate );\n'
    '    result.set( "rq2c4fSettledMeanAbsDeltaSpinLever", settledSamples > 0 ? rq2c4fSettledAbsDeltaSpinLeverSum / settledSamples : NAN );\n'
    '    result.set( "rq2c4fSettledMaxAbsDeltaSpinLever", rq2c4fSettledMaxAbsDeltaSpinLever );\n'
    '    result.set( "rq2c4fPeakWitnessDeltaTranslation", rq2c4fPeakWitnessDeltaTranslation );\n'
    '    result.set( "rq2c4fPeakWitnessDeltaSpinRate", rq2c4fPeakWitnessDeltaSpinRate );\n'
    '    result.set( "rq2c4fPeakWitnessDeltaSpinLever", rq2c4fPeakWitnessDeltaSpinLever );\n'
    '    result.set( "rq2c4fPeakWitnessSpinRateContribution", rq2c4fPeakWitnessSpinRateContribution );\n'
    '    result.set( "rq2c4fPeakWitnessLeverContribution", rq2c4fPeakWitnessLeverContribution );\n'
    '    result.set( "rq2c4fPeakWitnessReconstructedRollingPair", rq2c4fPeakWitnessReconstructedRollingPair );\n'
    '    result.set( "rq2c4fPeakWitnessClosureReconstructionError", rq2c4fPeakWitnessClosureReconstructionError );\n'
    '    result.set( "rq2c4fPeakRollingPairValue", rq2c4fPeakRollingPairValue );\n'
    '    result.set( "rq2c4fPeakRollingPairDeltaTranslation", rq2c4fPeakRollingPairDeltaTranslation );\n'
    '    result.set( "rq2c4fPeakRollingPairDeltaSpinRate", rq2c4fPeakRollingPairDeltaSpinRate );\n'
    '    result.set( "rq2c4fPeakRollingPairDeltaSpinLever", rq2c4fPeakRollingPairDeltaSpinLever );\n'
    '    result.set( "rq2c4fPeakRollingPairSpinRateContribution", rq2c4fPeakRollingPairSpinRateContribution );\n'
    '    result.set( "rq2c4fPeakRollingPairLeverContribution", rq2c4fPeakRollingPairLeverContribution );\n'
    '    result.set( "rq2c4fPeakRollingPairReconstructed", rq2c4fPeakRollingPairReconstructed );\n'
    '    result.set( "rq2c4fPeakRollingPairClosureReconstructionError", rq2c4fPeakRollingPairClosureReconstructionError );\n'
    '    result.set( "rq2c4fFinalSpinLever", rq2c4fFinalSpinLever );\n'
    '    result.set( "rq2c4fFinalDeltaTranslation", rq2c4fFinalDeltaTranslation );\n'
    '    result.set( "rq2c4fFinalDeltaSpinRate", rq2c4fFinalDeltaSpinRate );\n'
    '    result.set( "rq2c4fFinalDeltaSpinLever", rq2c4fFinalDeltaSpinLever );\n'
    '    result.set( "rq2c4fFinalSpinRateContribution", rq2c4fFinalSpinRateContribution );\n'
    '    result.set( "rq2c4fFinalLeverContribution", rq2c4fFinalLeverContribution );\n'
    '    result.set( "rq2c4fFinalReconstructedRollingPair", rq2c4fFinalReconstructedRollingPair );\n'
    '    result.set( "rq2c4fFinalClosureReconstructionError", rq2c4fFinalClosureReconstructionError );\n',
)

path.write_text(text, encoding='utf-8')
print('RQ2C4F_ROLLING_PAIR_CLOSURE_PATCH_OK')
