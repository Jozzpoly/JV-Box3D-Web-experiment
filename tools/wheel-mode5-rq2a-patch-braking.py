from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq2a-patch-braking.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// RQ2a representative braking demand.
// Inherit the qualified RQ0 flat-road rolling apparatus and change exactly one
// mechanical dimension: apply a bounded world-Z torque opposite the initial
// negative wheel spin for a finite pulse after the wheel has settled.
//
// brakeFraction scales the simple Coulomb torque scale mu*m*g*R. This is NOT a
// claim that mu*m*g*R is the exact wheel torque limit; it is only a transparent
// sub-limit demand scale that follows mass, friction and wheel size.
static val rq2aRunOuterP75Braking( float brakeFraction )
{
    val result = val::object();
    if ( b3IsValidFloat( brakeFraction ) == false || brakeFraction < 0.0f || brakeFraction > 1.0f )
    {
        result.set( "valid", false );
        return result;
    }

    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float gravityMagnitude = 9.81f;

    b3Wheel wheel = {};
    int rawHullCount = 0;
    int effectiveProfileCount = 0;
    if ( e2aMakeOuterCarrier( &wheel, &rawHullCount, &effectiveProfileCount ) == false )
    {
        result.set( "valid", false );
        return result;
    }

    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    float supportRadius = -supportDown.y;
    if ( supportRadius <= 0.0f )
    {
        result.set( "valid", false );
        return result;
    }

    const float initialOmegaZ = -speedMetersPerSecond / supportRadius;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -gravityMagnitude, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, true );

    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    groundBodyDef.position = e1Vec( 0.0f, -0.10f, 0.0f );
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );
    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = friction;
    groundShapeDef.baseMaterial.restitution = 0.0f;
    b3BoxHull groundHull = b3MakeBoxHull( 10.0f, 0.10f, 2.0f );
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( -3.0f, supportRadius + 0.001f, 0.0f );
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

    const float mass = b3Body_GetMass( wheelBody );
    if ( b3IsValidFloat( mass ) == false || mass <= 0.0f )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }

    const float coulombTorqueScale = friction * mass * gravityMagnitude * supportRadius;
    const float brakeTorque = brakeFraction * coulombTorqueScale;

    const int stepCount = 840;
    const int settleStep = 240;
    const int brakeStartStep = 360;
    const int brakeEndStep = 480; // exclusive; 0.5 s at 240 Hz
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

    int brakeSamples = 0;
    int brakeContactDropouts = 0;
    int brakeFeatureSetChanges = 0;
    int brakeMinPointCount = INT_MAX;
    int brakeMaxPointCount = 0;
    float brakeYMin = FLT_MAX;
    float brakeYMax = -FLT_MAX;
    float brakeMaxAbsVy = 0.0f;
    float brakeMaxAbsVz = 0.0f;
    float brakeMaxAbsSlip = 0.0f;
    double brakeAbsSlipSum = 0.0;
    float brakeMaxNormalImpulse = 0.0f;
    double brakeNormalImpulseSum = 0.0;
    double brakeNormalImpulseSqSum = 0.0;

    std::vector<uint32_t> previousFeatures;
    std::vector<uint32_t> previousBrakeFeatures;

    b3Vec3 preBrakePosition = b3Body_GetPosition( wheelBody );
    b3Vec3 preBrakeVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 preBrakeAngular = b3Body_GetAngularVelocity( wheelBody );
    b3Vec3 postBrakePosition = preBrakePosition;
    b3Vec3 postBrakeVelocity = preBrakeVelocity;
    b3Vec3 postBrakeAngular = preBrakeAngular;

    for ( int step = 0; step < stepCount; ++step )
    {
        if ( step == brakeStartStep )
        {
            preBrakePosition = b3Body_GetPosition( wheelBody );
            preBrakeVelocity = b3Body_GetLinearVelocity( wheelBody );
            preBrakeAngular = b3Body_GetAngularVelocity( wheelBody );
        }

        if ( step >= brakeStartStep && step < brakeEndStep && brakeTorque > 0.0f )
        {
            // Initial omegaZ is negative, so +Z torque is a braking torque.
            b3Body_ApplyTorque( wheelBody, e1Vec( 0.0f, 0.0f, brakeTorque ), true );
        }

        b3World_Step( worldId, dt, subStepCount );

        int capacity = b3Shape_GetContactCapacity( wheelShape );
        std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
        int contactCount = capacity > 0 ? b3Shape_GetContactData( wheelShape, contacts.data(), capacity ) : 0;
        int pointCount = 0;
        float totalNormalImpulse = 0.0f;
        std::vector<uint32_t> features;

        for ( int ci = 0; ci < contactCount; ++ci )
        {
            const b3ContactData& contact = contacts[ci];
            for ( int mi = 0; mi < contact.manifoldCount; ++mi )
            {
                const b3Manifold& manifold = contact.manifolds[mi];
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

        b3Vec3 p = b3Body_GetPosition( wheelBody );
        b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
        b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
        float slip = v.x + w.z * supportRadius;

        if ( step >= settleStep )
        {
            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, p.y );
            settledYMax = b3MaxFloat( settledYMax, p.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
            if ( contactCount == 0 ) settledContactDropouts += 1;
            if ( previousFeatures.empty() == false && features != previousFeatures ) settledFeatureSetChanges += 1;
            settledMinPointCount = b3MinInt( settledMinPointCount, pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, pointCount );
            previousFeatures = features;
        }

        if ( step >= brakeStartStep && step < brakeEndStep )
        {
            brakeSamples += 1;
            brakeYMin = b3MinFloat( brakeYMin, p.y );
            brakeYMax = b3MaxFloat( brakeYMax, p.y );
            brakeMaxAbsVy = b3MaxFloat( brakeMaxAbsVy, fabsf( v.y ) );
            brakeMaxAbsVz = b3MaxFloat( brakeMaxAbsVz, fabsf( v.z ) );
            brakeMaxAbsSlip = b3MaxFloat( brakeMaxAbsSlip, fabsf( slip ) );
            brakeAbsSlipSum += fabsf( slip );
            brakeMaxNormalImpulse = b3MaxFloat( brakeMaxNormalImpulse, totalNormalImpulse );
            brakeNormalImpulseSum += totalNormalImpulse;
            brakeNormalImpulseSqSum += (double)totalNormalImpulse * (double)totalNormalImpulse;
            if ( contactCount == 0 ) brakeContactDropouts += 1;
            if ( previousBrakeFeatures.empty() == false && features != previousBrakeFeatures ) brakeFeatureSetChanges += 1;
            brakeMinPointCount = b3MinInt( brakeMinPointCount, pointCount );
            brakeMaxPointCount = b3MaxInt( brakeMaxPointCount, pointCount );
            previousBrakeFeatures = features;
        }

        if ( step == brakeEndStep - 1 )
        {
            postBrakePosition = p;
            postBrakeVelocity = v;
            postBrakeAngular = w;
        }
    }

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    float finalSlip = finalVelocity.x + finalAngular.z * supportRadius;

    double brakeImpulseMean = brakeSamples > 0 ? brakeNormalImpulseSum / brakeSamples : 0.0;
    double brakeImpulseVariance = brakeSamples > 0 ? brakeNormalImpulseSqSum / brakeSamples - brakeImpulseMean * brakeImpulseMean : 0.0;
    if ( brakeImpulseVariance < 0.0 ) brakeImpulseVariance = 0.0;

    result.set( "valid", true );
    result.set( "scope", "RQ2a RQ0-derived fixed flat road; donor outer P75 wheel; planar axle locks; bounded brake torque; no recycler manipulation; no bore/inner/side validation" );
    result.set( "speedMetersPerSecond", speedMetersPerSecond );
    result.set( "friction", friction );
    result.set( "supportRadius", supportRadius );
    result.set( "mass", mass );
    result.set( "initialOmegaZ", initialOmegaZ );
    result.set( "brakeFraction", brakeFraction );
    result.set( "coulombTorqueScale", coulombTorqueScale );
    result.set( "brakeTorque", brakeTorque );
    result.set( "brakeStartStep", brakeStartStep );
    result.set( "brakeEndStep", brakeEndStep );
    result.set( "brakeDurationSeconds", ( brakeEndStep - brakeStartStep ) * dt );
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
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );

    result.set( "brakeSamples", brakeSamples );
    result.set( "brakeContactDropouts", brakeContactDropouts );
    result.set( "brakeFeatureSetChanges", brakeFeatureSetChanges );
    result.set( "brakeMinPointCount", brakeMinPointCount == INT_MAX ? 0 : brakeMinPointCount );
    result.set( "brakeMaxPointCount", brakeMaxPointCount );
    result.set( "brakeYRange", brakeSamples > 0 ? brakeYMax - brakeYMin : NAN );
    result.set( "brakeMaxAbsVy", brakeMaxAbsVy );
    result.set( "brakeMaxAbsVz", brakeMaxAbsVz );
    result.set( "brakeMeanAbsSlip", brakeSamples > 0 ? brakeAbsSlipSum / brakeSamples : NAN );
    result.set( "brakeMaxAbsSlip", brakeMaxAbsSlip );
    result.set( "brakeNormalImpulseMean", brakeImpulseMean );
    result.set( "brakeNormalImpulseStd", sqrt( brakeImpulseVariance ) );
    result.set( "brakeMaxNormalImpulse", brakeMaxNormalImpulse );

    result.set( "preBrakeX", preBrakePosition.x );
    result.set( "preBrakeVx", preBrakeVelocity.x );
    result.set( "preBrakeVy", preBrakeVelocity.y );
    result.set( "preBrakeOmegaZ", preBrakeAngular.z );
    result.set( "postBrakeX", postBrakePosition.x );
    result.set( "postBrakeVx", postBrakeVelocity.x );
    result.set( "postBrakeVy", postBrakeVelocity.y );
    result.set( "postBrakeOmegaZ", postBrakeAngular.z );
    result.set( "brakeDisplacementX", postBrakePosition.x - preBrakePosition.x );
    result.set( "brakeVxDelta", postBrakeVelocity.x - preBrakeVelocity.x );
    result.set( "brakeOmegaDelta", postBrakeAngular.z - preBrakeAngular.z );

    result.set( "finalX", finalPosition.x );
    result.set( "finalY", finalPosition.y );
    result.set( "finalVx", finalVelocity.x );
    result.set( "finalVy", finalVelocity.y );
    result.set( "finalVz", finalVelocity.z );
    result.set( "finalOmegaZ", finalAngular.z );
    result.set( "finalSlip", finalSlip );

    b3DestroyWorld( worldId );
    return result;
}
'''

if text.count(namespace_end) != 1:
    raise SystemExit('RQ2a namespace-end anchor drifted; apply after RQ0 patches')
text = text.replace(namespace_end, helper + '\n' + namespace_end)

binding_anchor = '\tfunction( "rq0RunOuterP75SteadyRolling", &rq0RunOuterP75SteadyRolling );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ2a RQ0 binding anchor drifted; apply after RQ0 binding patch')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "rq2aRunOuterP75Braking", &rq2aRunOuterP75Braking );\n')

path.write_text(text, encoding='utf-8')
print('RQ2A_BRAKING_PATCH_OK')
