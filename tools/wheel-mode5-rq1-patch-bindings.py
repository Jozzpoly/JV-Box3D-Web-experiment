from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq1-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// RQ1 first representative topology challenge.
// Preserve the qualified RQ0 outer-P75 wheel, friction and planar axle guide.
// Change only the fixed road geometry: a single convex hull is flat for x<=0
// and descends by 20 urad for x>0. The matched control uses the same generic
// hull construction with zero descent. No recycler manipulation or shadow
// diagnostic is introduced here.
static val rq1RunOuterP75RoadNormalTransition( bool challengeRoad )
{
    val result = val::object();

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

    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float roadAngleRadians = challengeRoad ? 20.0e-6f : 0.0f;
    const float roadHalfLength = 10.0f;
    const float roadHalfWidth = 2.0f;
    const float roadBottom = -0.20f;
    const float rightTop = -tanf( roadAngleRadians ) * roadHalfLength;
    const float initialOmegaZ = -speedMetersPerSecond / supportRadius;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -9.81f, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, true );

    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );
    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = friction;
    groundShapeDef.baseMaterial.restitution = 0.0f;

    b3Vec3 roadPoints[10] = {
        e1Vec( -roadHalfLength, 0.0f, -roadHalfWidth ),
        e1Vec( -roadHalfLength, 0.0f, roadHalfWidth ),
        e1Vec( 0.0f, 0.0f, -roadHalfWidth ),
        e1Vec( 0.0f, 0.0f, roadHalfWidth ),
        e1Vec( roadHalfLength, rightTop, -roadHalfWidth ),
        e1Vec( roadHalfLength, rightTop, roadHalfWidth ),
        e1Vec( -roadHalfLength, roadBottom, -roadHalfWidth ),
        e1Vec( -roadHalfLength, roadBottom, roadHalfWidth ),
        e1Vec( roadHalfLength, roadBottom, -roadHalfWidth ),
        e1Vec( roadHalfLength, roadBottom, roadHalfWidth ),
    };

    b3HullData* roadHull = b3CreateHull( roadPoints, 10, 16 );
    if ( roadHull == NULL )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, roadHull );
    b3DestroyHull( roadHull );

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( -2.0f, supportRadius + 0.001f, 0.0f );
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

    int settledSamples = 0;
    int settledContactDropouts = 0;
    int settledFeatureSetChanges = 0;
    int nearTransitionFeatureSetChanges = 0;
    int settledMinPointCount = INT_MAX;
    int settledMaxPointCount = 0;
    int crossingStep = -1;
    float settledYMin = FLT_MAX;
    float settledYMax = -FLT_MAX;
    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsVz = 0.0f;
    float settledMaxAbsSlip = 0.0f;
    float nearYMin = FLT_MAX;
    float nearYMax = -FLT_MAX;
    float nearMaxAbsVy = 0.0f;
    float nearMaxAbsSlip = 0.0f;
    float nearMaxNormalImpulse = 0.0f;
    int nearSamples = 0;
    double preNormalXSum = 0.0;
    int preNormalXSamples = 0;
    double postNormalXSum = 0.0;
    int postNormalXSamples = 0;
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
        float manifoldNormalX = 0.0f;
        bool haveManifoldNormal = false;
        std::vector<uint32_t> features;
        for ( int ci = 0; ci < contactCount; ++ci )
        {
            const b3ContactData& contact = contacts[ci];
            for ( int mi = 0; mi < contact.manifoldCount; ++mi )
            {
                const b3Manifold& manifold = contact.manifolds[mi];
                if ( manifold.pointCount > 0 && haveManifoldNormal == false )
                {
                    manifoldNormalX = manifold.normal.x;
                    haveManifoldNormal = true;
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

            if ( crossingStep < 0 && p.x >= 0.0f )
            {
                crossingStep = step;
            }

            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, p.y );
            settledYMax = b3MaxFloat( settledYMax, p.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );

            if ( contactCount == 0 )
            {
                settledContactDropouts += 1;
            }

            bool featureChanged = previousFeatures.empty() == false && features != previousFeatures;
            if ( featureChanged )
            {
                settledFeatureSetChanges += 1;
                if ( fabsf( p.x ) <= 0.25f )
                {
                    nearTransitionFeatureSetChanges += 1;
                }
            }
            previousFeatures = features;

            settledMinPointCount = b3MinInt( settledMinPointCount, pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, pointCount );

            if ( fabsf( p.x ) <= 0.25f )
            {
                nearSamples += 1;
                nearYMin = b3MinFloat( nearYMin, p.y );
                nearYMax = b3MaxFloat( nearYMax, p.y );
                nearMaxAbsVy = b3MaxFloat( nearMaxAbsVy, fabsf( v.y ) );
                nearMaxAbsSlip = b3MaxFloat( nearMaxAbsSlip, fabsf( slip ) );
                nearMaxNormalImpulse = b3MaxFloat( nearMaxNormalImpulse, totalNormalImpulse );
            }

            if ( haveManifoldNormal )
            {
                if ( p.x < -0.50f )
                {
                    preNormalXSum += manifoldNormalX;
                    preNormalXSamples += 1;
                }
                else if ( p.x > 0.50f )
                {
                    postNormalXSum += manifoldNormalX;
                    postNormalXSamples += 1;
                }
            }
        }
    }

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    float finalSlip = finalVelocity.x + finalAngular.z * supportRadius;

    result.set( "valid", true );
    result.set( "scope", "RQ1 fixed single-hull road-normal transition; donor dynamic outer P75 wheel; planar axle locks; frictional rolling" );
    result.set( "challengeRoad", challengeRoad );
    result.set( "roadAngleRadians", roadAngleRadians );
    result.set( "roadDropAt10m", -rightTop );
    result.set( "supportRadius", supportRadius );
    result.set( "initialOmegaZ", initialOmegaZ );
    result.set( "settledSamples", settledSamples );
    result.set( "settledContactDropouts", settledContactDropouts );
    result.set( "settledFeatureSetChanges", settledFeatureSetChanges );
    result.set( "nearTransitionFeatureSetChanges", nearTransitionFeatureSetChanges );
    result.set( "settledMinPointCount", settledMinPointCount == INT_MAX ? 0 : settledMinPointCount );
    result.set( "settledMaxPointCount", settledMaxPointCount );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsVz", settledMaxAbsVz );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
    result.set( "crossingStep", crossingStep );
    result.set( "nearSamples", nearSamples );
    result.set( "nearYRange", nearSamples > 0 ? nearYMax - nearYMin : NAN );
    result.set( "nearMaxAbsVy", nearMaxAbsVy );
    result.set( "nearMaxAbsSlip", nearMaxAbsSlip );
    result.set( "nearMaxNormalImpulse", nearMaxNormalImpulse );
    result.set( "preMeanNormalX", preNormalXSamples > 0 ? preNormalXSum / preNormalXSamples : NAN );
    result.set( "postMeanNormalX", postNormalXSamples > 0 ? postNormalXSum / postNormalXSamples : NAN );
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
    result.set( "measurementVxDelta", finalVelocity.x - velocityAtSettle.x );
    result.set( "measurementOmegaDelta", finalAngular.z - angularAtSettle.z );

    b3DestroyWorld( worldId );
    return result;
}
'''

if text.count(namespace_end) != 1:
    raise SystemExit('RQ1 namespace-end anchor drifted; apply after E2a patch')
text = text.replace(namespace_end, helper + '\n' + namespace_end)

binding_anchor = '\tfunction( "e2aRunOuterP75GroundCarrier", &e2aRunOuterP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ1 binding anchor drifted; apply after E2a patch')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "rq1RunOuterP75RoadNormalTransition", &rq1RunOuterP75RoadNormalTransition );\n')

path.write_text(text, encoding='utf-8')
print('RQ1_BINDINGS_PATCH_OK')
