from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c4d/patch-rq2c4d-slip-instrument.py <rq2c3-suite.hpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

if 'settledMaxAbsWitnessSlip' in text or 'RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT' in text:
    raise SystemExit('RQ2C4D telemetry already present')

header_anchor = '// helper bodies and no world-axis motion locks.\n'
if text.count(header_anchor) != 1:
    raise SystemExit(f'RQ2C4D header anchor drifted: expected 1, got {text.count(header_anchor)}')
text = text.replace(
    header_anchor,
    header_anchor + '// RQ2C4D transient composition adds read-only orientation-aware support-witness telemetry.\n',
)

decl_anchor = '    double settledAbsSlipSum = 0.0;\n'
if text.count(decl_anchor) != 1:
    raise SystemExit(f'RQ2C4D declaration anchor drifted: expected 1, got {text.count(decl_anchor)}')
text = text.replace(
    decl_anchor,
    decl_anchor +
    '    float settledMaxAbsWitnessSlip = 0.0f;\n'
    '    double settledAbsWitnessSlipSum = 0.0;\n'
    '    float settledMaxAbsLegacyMinusWitness = 0.0f;\n'
    '    double settledAbsLegacyMinusWitnessSum = 0.0;\n'
    '    float settledLegacyMinusWitnessMin = FLT_MAX;\n'
    '    float settledLegacyMinusWitnessMax = -FLT_MAX;\n'
    '    float settledSupportAxialMin = FLT_MAX;\n'
    '    float settledSupportAxialMax = -FLT_MAX;\n'
    '    float settledSupportRadialMin = FLT_MAX;\n'
    '    float settledSupportRadialMax = -FLT_MAX;\n'
    '    float settledMaxFirstOrderAxialTiltMagnitude = 0.0f;\n',
)

sample_anchor = (
    '        float slip = rq2cDot( v, targetHeading ) + supportRadius * rq2cDot( w, targetAxle );\n'
    '        float axisError = rq2cAngleBetween( actualAxle, targetAxle );\n'
)
if text.count(sample_anchor) != 1:
    raise SystemExit(f'RQ2C4D sample anchor drifted: expected 1, got {text.count(sample_anchor)}')
text = text.replace(
    sample_anchor,
    '        float slip = rq2cDot( v, targetHeading ) + supportRadius * rq2cDot( w, targetAxle );\n'
    '        float axisError = rq2cAngleBetween( actualAxle, targetAxle );\n'
    '        b3Vec3 localDown = b3InvRotateVector( q, e1Vec( 0.0f, -1.0f, 0.0f ) );\n'
    '        b3Vec3 supportLocal = b3ComputeWheelSupport( &wheel, localDown );\n'
    '        b3Vec3 supportVelocity = b3Body_GetLocalPointVelocity( wheelBody, supportLocal );\n'
    '        float witnessSlip = rq2cDot( supportVelocity, targetHeading );\n'
    '        float legacyMinusWitness = slip - witnessSlip;\n'
    '        b3Vec3 supportOffset = rq2cSub( supportLocal, wheel.center );\n'
    '        float supportAxial = rq2cDot( supportOffset, wheel.axis );\n'
    '        b3Vec3 supportRadialVector = rq2cSub( supportOffset, rq2cScale( supportAxial, wheel.axis ) );\n'
    '        float supportRadial = rq2cLength( supportRadialVector );\n'
    '        float actualAxleOmega = rq2cDot( w, actualAxle );\n'
    '        float firstOrderAxialTiltMagnitude = fabsf( supportAxial ) * axisError * fabsf( actualAxleOmega );\n',
)

settled_anchor = (
    '            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );\n'
    '            settledAbsSlipSum += fabsf( slip );\n'
)
if text.count(settled_anchor) != 1:
    raise SystemExit(f'RQ2C4D settled anchor drifted: expected 1, got {text.count(settled_anchor)}')
text = text.replace(
    settled_anchor,
    settled_anchor +
    '            settledMaxAbsWitnessSlip = b3MaxFloat( settledMaxAbsWitnessSlip, fabsf( witnessSlip ) );\n'
    '            settledAbsWitnessSlipSum += fabsf( witnessSlip );\n'
    '            settledMaxAbsLegacyMinusWitness = b3MaxFloat( settledMaxAbsLegacyMinusWitness, fabsf( legacyMinusWitness ) );\n'
    '            settledAbsLegacyMinusWitnessSum += fabsf( legacyMinusWitness );\n'
    '            settledLegacyMinusWitnessMin = b3MinFloat( settledLegacyMinusWitnessMin, legacyMinusWitness );\n'
    '            settledLegacyMinusWitnessMax = b3MaxFloat( settledLegacyMinusWitnessMax, legacyMinusWitness );\n'
    '            settledSupportAxialMin = b3MinFloat( settledSupportAxialMin, supportAxial );\n'
    '            settledSupportAxialMax = b3MaxFloat( settledSupportAxialMax, supportAxial );\n'
    '            settledSupportRadialMin = b3MinFloat( settledSupportRadialMin, supportRadial );\n'
    '            settledSupportRadialMax = b3MaxFloat( settledSupportRadialMax, supportRadial );\n'
    '            settledMaxFirstOrderAxialTiltMagnitude = b3MaxFloat( settledMaxFirstOrderAxialTiltMagnitude, firstOrderAxialTiltMagnitude );\n',
)

final_anchor = (
    '    float finalSlip = rq2cDot( finalVelocity, targetHeading ) + supportRadius * rq2cDot( finalAngular, targetAxle );\n'
    '    float finalAxisError = rq2cAngleBetween( finalAxle, targetAxle );\n'
)
if text.count(final_anchor) != 1:
    raise SystemExit(f'RQ2C4D final anchor drifted: expected 1, got {text.count(final_anchor)}')
text = text.replace(
    final_anchor,
    '    float finalSlip = rq2cDot( finalVelocity, targetHeading ) + supportRadius * rq2cDot( finalAngular, targetAxle );\n'
    '    float finalAxisError = rq2cAngleBetween( finalAxle, targetAxle );\n'
    '    b3Vec3 finalLocalDown = b3InvRotateVector( finalRotation, e1Vec( 0.0f, -1.0f, 0.0f ) );\n'
    '    b3Vec3 finalSupportLocal = b3ComputeWheelSupport( &wheel, finalLocalDown );\n'
    '    b3Vec3 finalSupportVelocity = b3Body_GetLocalPointVelocity( wheelBody, finalSupportLocal );\n'
    '    float finalWitnessSlip = rq2cDot( finalSupportVelocity, targetHeading );\n'
    '    float finalLegacyMinusWitness = finalSlip - finalWitnessSlip;\n'
    '    b3Vec3 finalSupportOffset = rq2cSub( finalSupportLocal, wheel.center );\n'
    '    float finalSupportAxial = rq2cDot( finalSupportOffset, wheel.axis );\n'
    '    b3Vec3 finalSupportRadialVector = rq2cSub( finalSupportOffset, rq2cScale( finalSupportAxial, wheel.axis ) );\n'
    '    float finalSupportRadial = rq2cLength( finalSupportRadialVector );\n',
)

result_anchor = (
    '    result.set( "settledMeanAbsSlip", settledSamples > 0 ? settledAbsSlipSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );\n'
)
if text.count(result_anchor) != 1:
    raise SystemExit(f'RQ2C4D result anchor drifted: expected 1, got {text.count(result_anchor)}')
text = text.replace(
    result_anchor,
    result_anchor +
    '    result.set( "rq2c4dInstrument", "RQ2C4D_ORIENTATION_AWARE_SLIP_INSTRUMENT" );\n'
    '    result.set( "settledMeanAbsWitnessSlip", settledSamples > 0 ? settledAbsWitnessSlipSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsWitnessSlip", settledMaxAbsWitnessSlip );\n'
    '    result.set( "settledMeanAbsLegacyMinusWitness", settledSamples > 0 ? settledAbsLegacyMinusWitnessSum / settledSamples : NAN );\n'
    '    result.set( "settledMaxAbsLegacyMinusWitness", settledMaxAbsLegacyMinusWitness );\n'
    '    result.set( "settledLegacyMinusWitnessMin", settledSamples > 0 ? settledLegacyMinusWitnessMin : NAN );\n'
    '    result.set( "settledLegacyMinusWitnessMax", settledSamples > 0 ? settledLegacyMinusWitnessMax : NAN );\n'
    '    result.set( "settledSupportAxialMin", settledSamples > 0 ? settledSupportAxialMin : NAN );\n'
    '    result.set( "settledSupportAxialMax", settledSamples > 0 ? settledSupportAxialMax : NAN );\n'
    '    result.set( "settledSupportRadialMin", settledSamples > 0 ? settledSupportRadialMin : NAN );\n'
    '    result.set( "settledSupportRadialMax", settledSamples > 0 ? settledSupportRadialMax : NAN );\n'
    '    result.set( "settledMaxFirstOrderAxialTiltMagnitude", settledMaxFirstOrderAxialTiltMagnitude );\n',
)

final_result_anchor = '    result.set( "finalSlip", finalSlip );\n'
if text.count(final_result_anchor) != 1:
    raise SystemExit(f'RQ2C4D final-result anchor drifted: expected 1, got {text.count(final_result_anchor)}')
text = text.replace(
    final_result_anchor,
    final_result_anchor +
    '    result.set( "finalWitnessSlip", finalWitnessSlip );\n'
    '    result.set( "finalLegacyMinusWitness", finalLegacyMinusWitness );\n'
    '    result.set( "finalSupportAxial", finalSupportAxial );\n'
    '    result.set( "finalSupportRadial", finalSupportRadial );\n',
)

path.write_text(text, encoding='utf-8')
print('RQ2C4D_SLIP_INSTRUMENT_PATCH_OK')
