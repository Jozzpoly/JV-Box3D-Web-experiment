from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq0-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// RQ0 representative steady-rolling baseline.
// This deliberately reuses the E2a donor b3Wheel outer P75 profile because it
// is the real dynamic wheel shape available in the recovered donor composition.
// Scope is flat-road OUTER rolling only: no bore/inner/side semantics, no
// recycler modification, no forced topology crossing, no drive/brake torque.
static val rq0RunOuterP75SteadyRolling( float speedMetersPerSecond, float friction, bool matchedSpin )
{
    val result = val::object();
    if ( b3IsValidFloat( speedMetersPerSecond ) == false || speedMetersPerSecond <= 0.0f ||
         b3IsValidFloat( friction ) == false || friction < 0.0f )
    {
        result.set( "valid", false );
        return result;
    }

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

    const float initialOmegaZ = matchedSpin ? -speedMetersPerSecond / supportRadius : 0.0f;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -9.81f, 0.0f );
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
    float settledVxMin = FLT_MAX;
    float settledVxMax = -FLT_MAX;
    float settledOmegaMin = FLT_MAX;
    float settledOmegaMax = -FLT_MAX;
    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsVz = 0.0f;
    float settledMaxAbsSlip = 0.0f;
    double settledAbsSlipSum = 0.0;
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

        if ( contactCount > 0 && firstContactStep < 0 )
        {
            firstContactStep = step;
        }
        if ( totalNormalImpulse > 1.0e-9f && firstImpulseStep < 0 )
        {
            firstImpulseStep = step;
        }

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
            float slip = v.x + w.z * supportRadius;

            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, p.y );
            settledYMax = b3MaxFloat( settledYMax, p.y );
            settledVxMin = b3MinFloat( settledVxMin, v.x );
            settledVxMax = b3MaxFloat( settledVxMax, v.x );
            settledOmegaMin = b3MinFloat( settledOmegaMin, w.z );
            settledOmegaMax = b3MaxFloat( settledOmegaMax, w.z );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
            settledAbsSlipSum += fabsf( slip );

            if ( contactCount == 0 )
            {
                settledContactDropouts += 1;
            }
            if ( previousFeatures.empty() == false && features != previousFeatures )
            {
                settledFeatureSetChanges += 1;
            }
            settledMinPointCount = b3MinInt( settledMinPointCount, pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, pointCount );
            previousFeatures = features;

            settledNormalImpulseSum += totalNormalImpulse;
            settledNormalImpulseSqSum += (double)totalNormalImpulse * (double)totalNormalImpulse;
            settledImpulseSamples += 1;
        }
    }

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    float finalSlip = finalVelocity.x + finalAngular.z * supportRadius;

    double impulseMean = settledImpulseSamples > 0 ? settledNormalImpulseSum / settledImpulseSamples : 0.0;
    double impulseVariance = settledImpulseSamples > 0 ? settledNormalImpulseSqSum / settledImpulseSamples - impulseMean * impulseMean : 0.0;
    if ( impulseVariance < 0.0 ) impulseVariance = 0.0;

    result.set( "valid", true );
    result.set( "scope", "RQ0 fixed flat road; donor dynamic outer P75 wheel profile; no bore/inner/side validation" );
    result.set( "speedMetersPerSecond", speedMetersPerSecond );
    result.set( "friction", friction );
    result.set( "matchedSpin", matchedSpin );
    result.set( "supportRadius", supportRadius );
    result.set( "initialOmegaZ", initialOmegaZ );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "settledSamples", settledSamples );
    result.set( "settledContactDropouts", settledContactDropouts );
    result.set( "settledFeatureSetChanges", settledFeatureSetChanges );
    result.set( "settledMinPointCount", settledMinPointCount == INT_MAX ? 0 : settledMinPointCount );
    result.set( "settledMaxPointCount", settledMaxPointCount );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledVxMin", settledVxMin );
    result.set( "settledVxMax", settledVxMax );
    result.set( "settledOmegaMin", settledOmegaMin );
    result.set( "settledOmegaMax", settledOmegaMax );
    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsVz", settledMaxAbsVz );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
    result.set( "settledMeanAbsSlip", settledSamples > 0 ? settledAbsSlipSum / settledSamples : NAN );
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
    raise SystemExit('RQ0 namespace-end anchor drifted; apply after E2a patch')
text = text.replace(namespace_end, helper + '\n' + namespace_end)

binding_anchor = '\tfunction( "e2aRunOuterP75GroundCarrier", &e2aRunOuterP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ0 binding anchor drifted; apply after E2a patch')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "rq0RunOuterP75SteadyRolling", &rq0RunOuterP75SteadyRolling );\n')

path.write_text(text, encoding='utf-8')
print('RQ0_BINDINGS_PATCH_OK')
