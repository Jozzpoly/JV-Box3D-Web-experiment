from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq1d-patch-cross-slope.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// RQ1d representative relative-normal challenge.
// Keep the qualified RQ0 wheel, rolling direction, planar axle locks and box-road
// contact family unchanged. Rotate only the STATIC flat road around world X so
// the road normal gains a signed component along the wheel's local/world Z axle.
// This is deliberately not free camber dynamics: angular X/Y remain locked and
// the wheel spins only about Z, exactly as in RQ0.
static val rq1dRunOuterP75CrossSlope( float bankMicroradians )
{
    val result = val::object();
    if ( b3IsValidFloat( bankMicroradians ) == false || fabsf( bankMicroradians ) > 1000.0f )
    {
        result.set( "valid", false );
        return result;
    }

    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float bankRadians = bankMicroradians * 1.0e-6f;

    b3Wheel wheel = {};
    int rawHullCount = 0;
    int effectiveProfileCount = 0;
    if ( e2aMakeOuterCarrier( &wheel, &rawHullCount, &effectiveProfileCount ) == false )
    {
        result.set( "valid", false );
        return result;
    }

    b3Quat roadRotation = b3MakeQuatFromAxisAngle( b3Vec3_axisX, bankRadians );
    b3Vec3 roadNormal = b3RotateVector( roadRotation, b3Vec3_axisY );
    b3Vec3 supportDirection = b3Neg( roadNormal );
    b3Vec3 supportPoint = b3ComputeWheelSupport( &wheel, supportDirection );
    float supportDistance = b3Dot( supportDirection, supportPoint );
    float rollingRadiusX = -supportPoint.y;
    if ( supportDistance <= 0.0f || rollingRadiusX <= 0.0f || roadNormal.y <= 0.99f )
    {
        result.set( "valid", false );
        return result;
    }

    // Reproduce the donor profile support-feature decision read-only. This is
    // not a second collision implementation: it only predicts which normalized
    // profile endpoint(s) maximize the exact support function used by b3Wheel.
    b3Vec2 profile[B3_MAX_WHEEL_PROFILE_POINTS];
    int profileCount = b3GetWheelProfile( &wheel, profile );
    float axial = b3Dot( supportDirection, wheel.axis );
    b3Vec3 radial = b3MulSub( supportDirection, axial, wheel.axis );
    float radialLength = b3Length( radial );
    float supportValues[B3_MAX_WHEEL_PROFILE_POINTS];
    int best = 0;
    float bestValue = -FLT_MAX;
    for ( int i = 0; i < profileCount; ++i )
    {
        float value = profile[i].x * axial + profile[i].y * radialLength;
        supportValues[i] = value;
        if ( value > bestValue )
        {
            bestValue = value;
            best = i;
        }
    }
    float supportTolerance = b3MaxFloat( 1.0e-6f, 8.0f * FLT_EPSILON * ( 1.0f + fabsf( bestValue ) ) );
    int supportFirst = best;
    int supportLast = best;
    while ( supportFirst > 0 && fabsf( supportValues[supportFirst - 1] - bestValue ) <= supportTolerance )
    {
        supportFirst -= 1;
    }
    while ( supportLast + 1 < profileCount && fabsf( supportValues[supportLast + 1] - bestValue ) <= supportTolerance )
    {
        supportLast += 1;
    }

    const float initialOmegaZ = -speedMetersPerSecond / rollingRadiusX;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -9.81f, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, true );

    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    groundBodyDef.position = e1Vec( 0.0f, -0.10f, 0.0f );
    groundBodyDef.rotation = roadRotation;
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );
    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = friction;
    groundShapeDef.baseMaterial.restitution = 0.0f;
    b3BoxHull groundHull = b3MakeBoxHull( 10.0f, 0.10f, 2.0f );
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );

    // The rotated top face passes through this transformed local top-center.
    b3Vec3 groundTopPoint = e1Vec( 0.0f, -0.10f + 0.10f * roadNormal.y, 0.10f * roadNormal.z );
    float roadPlaneOffset = b3Dot( roadNormal, groundTopPoint );
    float initialY = ( roadPlaneOffset + supportDistance + 0.001f ) / roadNormal.y;

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( -3.0f, initialY, 0.0f );
    wheelBodyDef.linearVelocity = e1Vec( speedMetersPerSecond, 0.0f, 0.0f );
    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, initialOmegaZ );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    wheelBodyDef.motionLocks.linearZ = true;
    wheelBodyDef.motionLocks.angularX = true;
    wheelBodyDef.motionLocks.angularY = true;
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );

    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = friction;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;
    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );

    if ( b3Shape_IsValid( groundShape ) == false || b3Shape_IsValid( wheelShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }

    const int stepCount = 960;
    const int settleStep = 240;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;

    int firstContactStep = -1;
    int firstImpulseStep = -1;
    int settledSamples = 0;
    int settledContactDropouts = 0;
    int settledFeatureSetChanges = 0;
    int settledMinPointCount = INT_MAX;
    int settledMaxPointCount = 0;
    float settledYMin = FLT_MAX;
    float settledYMax = -FLT_MAX;
    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsVz = 0.0f;
    float settledMaxAbsSlip = 0.0f;
    double settledAbsSlipSum = 0.0;
    double settledNormalXSum = 0.0;
    double settledNormalYSum = 0.0;
    double settledNormalZSum = 0.0;
    int settledNormalSamples = 0;
    double settledNormalImpulseSum = 0.0;
    double settledNormalImpulseSqSum = 0.0;
    int settledImpulseSamples = 0;
    std::vector<uint32_t> previousFeatures;

    b3Vec3 positionAtSettle = b3Body_GetPosition( wheelBody );
    b3Vec3 velocityAtSettle = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 angularAtSettle = b3Body_GetAngularVelocity( wheelBody );

    for ( int step = 0; step < stepCount; ++step )
    {
        b3World_Step( worldId, dt, subStepCount );

        int capacity = b3Shape_GetContactCapacity( wheelShape );
        std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
        int contactCount = capacity > 0 ? b3Shape_GetContactData( wheelShape, contacts.data(), capacity ) : 0;
        int pointCount = 0;
        float totalNormalImpulse = 0.0f;
        std::vector<uint32_t> features;
        b3Vec3 normalSum = b3Vec3_zero;
        int normalCount = 0;
        for ( int ci = 0; ci < contactCount; ++ci )
        {
            const b3ContactData& contact = contacts[ci];
            for ( int mi = 0; mi < contact.manifoldCount; ++mi )
            {
                const b3Manifold& manifold = contact.manifolds[mi];
                if ( manifold.pointCount > 0 )
                {
                    normalSum = b3Add( normalSum, manifold.normal );
                    normalCount += 1;
                }
                for ( int pi = 0; pi < manifold.pointCount; ++pi )
                {
                    const b3ManifoldPoint& point = manifold.points[pi];
                    pointCount += 1;
                    totalNormalImpulse += point.totalNormalImpulse;
                    features.push_back( point.featureId );
                }
            }
        }
        std::sort( features.begin(), features.end() );
        features.erase( std::unique( features.begin(), features.end() ), features.end() );

        if ( contactCount > 0 && firstContactStep < 0 ) firstContactStep = step;
        if ( totalNormalImpulse > 1.0e-9f && firstImpulseStep < 0 ) firstImpulseStep = step;

        if ( step == settleStep )
        {
            positionAtSettle = b3Body_GetPosition( wheelBody );
            velocityAtSettle = b3Body_GetLinearVelocity( wheelBody );
            angularAtSettle = b3Body_GetAngularVelocity( wheelBody );
            previousFeatures = features;
        }

        if ( step >= settleStep )
        {
            b3Vec3 p = b3Body_GetPosition( wheelBody );
            b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
            b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
            float slip = v.x + w.z * rollingRadiusX;

            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, p.y );
            settledYMax = b3MaxFloat( settledYMax, p.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
            settledAbsSlipSum += fabsf( slip );

            if ( contactCount == 0 ) settledContactDropouts += 1;
            if ( previousFeatures.empty() == false && features != previousFeatures ) settledFeatureSetChanges += 1;
            settledMinPointCount = b3MinInt( settledMinPointCount, pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, pointCount );
            previousFeatures = features;

            if ( normalCount > 0 )
            {
                b3Vec3 meanNormal = b3MulSV( 1.0f / normalCount, normalSum );
                settledNormalXSum += meanNormal.x;
                settledNormalYSum += meanNormal.y;
                settledNormalZSum += meanNormal.z;
                settledNormalSamples += 1;
            }

            settledNormalImpulseSum += totalNormalImpulse;
            settledNormalImpulseSqSum += (double)totalNormalImpulse * (double)totalNormalImpulse;
            settledImpulseSamples += 1;
        }
    }

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    float finalSlip = finalVelocity.x + finalAngular.z * rollingRadiusX;

    double impulseMean = settledImpulseSamples > 0 ? settledNormalImpulseSum / settledImpulseSamples : 0.0;
    double impulseVariance = settledImpulseSamples > 0 ? settledNormalImpulseSqSum / settledImpulseSamples - impulseMean * impulseMean : 0.0;
    if ( impulseVariance < 0.0 ) impulseVariance = 0.0;

    result.set( "valid", true );
    result.set( "scope", "RQ1d RQ0-derived fixed cross-slope box road; donor outer P75 wheel; planar axle locks; no recycler manipulation; no bore/inner/side validation" );
    result.set( "bankMicroradians", bankMicroradians );
    result.set( "bankRadians", bankRadians );
    result.set( "roadNormalX", roadNormal.x );
    result.set( "roadNormalY", roadNormal.y );
    result.set( "roadNormalZ", roadNormal.z );
    result.set( "supportDistance", supportDistance );
    result.set( "rollingRadiusX", rollingRadiusX );
    result.set( "profileCount", profileCount );
    result.set( "predictedSupportFirst", supportFirst );
    result.set( "predictedSupportLast", supportLast );
    result.set( "predictedSupportPointCount", supportLast - supportFirst + 1 );
    result.set( "predictedSupportTolerance", supportTolerance );
    result.set( "initialOmegaZ", initialOmegaZ );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "settledSamples", settledSamples );
    result.set( "settledContactDropouts", settledContactDropouts );
    result.set( "settledFeatureSetChanges", settledFeatureSetChanges );
    result.set( "settledMinPointCount", settledMinPointCount == INT_MAX ? 0 : settledMinPointCount );
    result.set( "settledMaxPointCount", settledMaxPointCount );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsVz", settledMaxAbsVz );
    result.set( "settledMeanAbsSlip", settledSamples > 0 ? settledAbsSlipSum / settledSamples : NAN );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
    result.set( "settledMeanNormalX", settledNormalSamples > 0 ? settledNormalXSum / settledNormalSamples : NAN );
    result.set( "settledMeanNormalY", settledNormalSamples > 0 ? settledNormalYSum / settledNormalSamples : NAN );
    result.set( "settledMeanNormalZ", settledNormalSamples > 0 ? settledNormalZSum / settledNormalSamples : NAN );
    result.set( "settledNormalImpulseMean", impulseMean );
    result.set( "settledNormalImpulseStd", sqrt( impulseVariance ) );
    result.set( "settleX", positionAtSettle.x );
    result.set( "settleVx", velocityAtSettle.x );
    result.set( "settleOmegaZ", angularAtSettle.z );
    result.set( "finalX", finalPosition.x );
    result.set( "finalY", finalPosition.y );
    result.set( "finalVx", finalVelocity.x );
    result.set( "finalVy", finalVelocity.y );
    result.set( "finalVz", finalVelocity.z );
    result.set( "finalOmegaZ", finalAngular.z );
    result.set( "finalSlip", finalSlip );
    result.set( "measurementDisplacementX", finalPosition.x - positionAtSettle.x );
    result.set( "measurementVxDelta", finalVelocity.x - velocityAtSettle.x );
    result.set( "measurementOmegaDelta", finalAngular.z - angularAtSettle.z );

    b3DestroyWorld( worldId );
    return result;
}
'''

if text.count(namespace_end) != 1:
    raise SystemExit('RQ1d namespace-end anchor drifted; apply after RQ0 patches')
text = text.replace(namespace_end, helper + '\n' + namespace_end)

binding_anchor = '\tfunction( "rq0RunOuterP75SteadyRolling", &rq0RunOuterP75SteadyRolling );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ1d RQ0 binding anchor drifted; apply after RQ0 binding patch')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "rq1dRunOuterP75CrossSlope", &rq1dRunOuterP75CrossSlope );\n')

path.write_text(text, encoding='utf-8')
print('RQ1D_CROSS_SLOPE_PATCH_OK')
