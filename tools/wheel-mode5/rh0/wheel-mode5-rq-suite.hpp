// Wheel-mode5 RH0 canonical donor-carrier replay suite.
//
// This file is normal versioned C++ source, intentionally included into the
// pinned box3d.js bindings translation unit after the E1 + E2a helpers exist.
// It replaces scenario identity encoded through chains of Python text patches.
//
// IMPORTANT: these scenarios are frozen migration fixtures. They preserve the
// already-qualified RQ0/RQ1c/RQ2a/RQ2b laboratory conditions; they are not a
// parameterized product tire model and they do not broaden the evidence scope.

enum Rh0RqFamily
{
    rh0Rq0Rolling = 0,
    rh0Rq1RoadTransition = 1,
    rh0Rq2Longitudinal = 2,
};

enum Rh0CanonicalScenarioId
{
    rh0Rq0Matched = 0,
    rh0Rq0ZeroSpin = 1,
    rh0Rq1cFlat = 2,
    rh0Rq1c30Urad = 3,
    rh0Rq2ZeroTorque = 4,
    rh0Rq2aBrake20 = 5,
    rh0Rq2bDrive20 = 6,
};

struct Rh0ScenarioConfig
{
    int id;
    int family;
    const char* name;
    float initialX;
    bool matchedSpin;
    float roadAngleRadians;
    int stepCount;
    int settleStep;
    int pulseStartStep;
    int pulseEndStep;
    int torqueSign;
    float demandFraction;
};

static bool rh0GetScenarioConfig( int scenarioId, Rh0ScenarioConfig* config )
{
    Rh0ScenarioConfig c = {};
    c.id = scenarioId;
    c.settleStep = 240;
    c.pulseStartStep = -1;
    c.pulseEndStep = -1;

    switch ( scenarioId )
    {
        case rh0Rq0Matched:
            c.family = rh0Rq0Rolling;
            c.name = "RQ0_MATCHED";
            c.initialX = -3.0f;
            c.matchedSpin = true;
            c.stepCount = 960;
            break;
        case rh0Rq0ZeroSpin:
            c.family = rh0Rq0Rolling;
            c.name = "RQ0_ZERO_SPIN_POSITIVE_CONTROL";
            c.initialX = -3.0f;
            c.matchedSpin = false;
            c.stepCount = 960;
            break;
        case rh0Rq1cFlat:
            c.family = rh0Rq1RoadTransition;
            c.name = "RQ1C_FLAT_CONTROL";
            c.initialX = -2.0f;
            c.matchedSpin = true;
            c.roadAngleRadians = 0.0f;
            c.stepCount = 960;
            break;
        case rh0Rq1c30Urad:
            c.family = rh0Rq1RoadTransition;
            c.name = "RQ1C_30URAD";
            c.initialX = -2.0f;
            c.matchedSpin = true;
            c.roadAngleRadians = 30.0e-6f;
            c.stepCount = 960;
            break;
        case rh0Rq2ZeroTorque:
            c.family = rh0Rq2Longitudinal;
            c.name = "RQ2_ZERO_TORQUE_CONTROL";
            c.initialX = -3.0f;
            c.matchedSpin = true;
            c.stepCount = 840;
            c.pulseStartStep = 360;
            c.pulseEndStep = 480;
            c.torqueSign = 0;
            c.demandFraction = 0.0f;
            break;
        case rh0Rq2aBrake20:
            c.family = rh0Rq2Longitudinal;
            c.name = "RQ2A_BRAKE20";
            c.initialX = -3.0f;
            c.matchedSpin = true;
            c.stepCount = 840;
            c.pulseStartStep = 360;
            c.pulseEndStep = 480;
            c.torqueSign = +1;
            c.demandFraction = 0.20f;
            break;
        case rh0Rq2bDrive20:
            c.family = rh0Rq2Longitudinal;
            c.name = "RQ2B_DRIVE20";
            c.initialX = -3.0f;
            c.matchedSpin = true;
            c.stepCount = 840;
            c.pulseStartStep = 360;
            c.pulseEndStep = 480;
            c.torqueSign = -1;
            c.demandFraction = 0.20f;
            break;
        default:
            return false;
    }

    *config = c;
    return true;
}

struct Rh0ContactSample
{
    int contactCount;
    int pointCount;
    float totalNormalImpulse;
    float manifoldNormalX;
    bool haveManifoldNormal;
    std::vector<uint32_t> features;
};

static Rh0ContactSample rh0SampleContact( b3ShapeId wheelShape )
{
    Rh0ContactSample sample = {};
    int capacity = b3Shape_GetContactCapacity( wheelShape );
    std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
    sample.contactCount = capacity > 0 ? b3Shape_GetContactData( wheelShape, contacts.data(), capacity ) : 0;

    for ( int ci = 0; ci < sample.contactCount; ++ci )
    {
        const b3ContactData& contact = contacts[ci];
        for ( int mi = 0; mi < contact.manifoldCount; ++mi )
        {
            const b3Manifold& manifold = contact.manifolds[mi];
            if ( manifold.pointCount > 0 && sample.haveManifoldNormal == false )
            {
                sample.manifoldNormalX = manifold.normal.x;
                sample.haveManifoldNormal = true;
            }
            for ( int pi = 0; pi < manifold.pointCount; ++pi )
            {
                const b3ManifoldPoint& point = manifold.points[pi];
                sample.pointCount += 1;
                sample.totalNormalImpulse += point.totalNormalImpulse;
                sample.features.push_back( point.featureId );
            }
        }
    }

    std::sort( sample.features.begin(), sample.features.end() );
    sample.features.erase( std::unique( sample.features.begin(), sample.features.end() ), sample.features.end() );
    return sample;
}

static val rh0RunOuterP75CanonicalScenario( int scenarioId )
{
    val result = val::object();
    Rh0ScenarioConfig config = {};
    if ( rh0GetScenarioConfig( scenarioId, &config ) == false )
    {
        result.set( "valid", false );
        result.set( "error", "unknown canonical RH0 scenario id" );
        return result;
    }

    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float gravityMagnitude = 9.81f;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;

    b3Wheel wheel = {};
    int rawHullCount = 0;
    int effectiveProfileCount = 0;
    if ( e2aMakeOuterCarrier( &wheel, &rawHullCount, &effectiveProfileCount ) == false )
    {
        result.set( "valid", false );
        result.set( "error", "outer-P75 carrier unavailable" );
        return result;
    }

    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    float supportRadius = -supportDown.y;
    if ( supportRadius <= 0.0f )
    {
        result.set( "valid", false );
        result.set( "error", "invalid support radius" );
        return result;
    }

    const float initialOmegaZ = config.matchedSpin ? -speedMetersPerSecond / supportRadius : 0.0f;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -gravityMagnitude, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, true );

    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    if ( config.family != rh0Rq1RoadTransition )
    {
        groundBodyDef.position = e1Vec( 0.0f, -0.10f, 0.0f );
    }
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );

    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = friction;
    groundShapeDef.baseMaterial.restitution = 0.0f;

    b3ShapeId groundShape = b3_nullShapeId;
    int roadHullFaceCount = 0;
    int roadTopPlaneCount = 0;
    float roadTopPlaneNormalXMin = FLT_MAX;
    float roadTopPlaneNormalXMax = -FLT_MAX;
    float roadTopPlaneNormalYMin = FLT_MAX;
    float roadTopPlaneNormalYMax = -FLT_MAX;
    float roadDropAt10m = 0.0f;

    if ( config.family == rh0Rq1RoadTransition )
    {
        const float roadHalfLength = 10.0f;
        const float roadHalfWidth = 2.0f;
        const float roadBottom = -0.20f;
        const float rightTop = -tanf( config.roadAngleRadians ) * roadHalfLength;
        roadDropAt10m = -rightTop;

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
            result.set( "error", "RQ1 road hull creation failed" );
            return result;
        }

        // Preserve the read-only RQ1a/RQ1c geometry provenance before shape
        // creation. This does not alter the generated hull or the dynamics.
        const b3Plane* roadPlanes = b3GetHullPlanes( roadHull );
        roadHullFaceCount = roadHull->faceCount;
        for ( int fi = 0; fi < roadHullFaceCount; ++fi )
        {
            const b3Plane& plane = roadPlanes[fi];
            if ( plane.normal.y > 0.9f )
            {
                roadTopPlaneCount += 1;
                roadTopPlaneNormalXMin = b3MinFloat( roadTopPlaneNormalXMin, plane.normal.x );
                roadTopPlaneNormalXMax = b3MaxFloat( roadTopPlaneNormalXMax, plane.normal.x );
                roadTopPlaneNormalYMin = b3MinFloat( roadTopPlaneNormalYMin, plane.normal.y );
                roadTopPlaneNormalYMax = b3MaxFloat( roadTopPlaneNormalYMax, plane.normal.y );
            }
        }

        groundShape = b3CreateHullShape( groundBody, &groundShapeDef, roadHull );
        b3DestroyHull( roadHull );
    }
    else
    {
        b3BoxHull groundHull = b3MakeBoxHull( 10.0f, 0.10f, 2.0f );
        groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );
    }

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( config.initialX, supportRadius + 0.001f, 0.0f );
    wheelBodyDef.linearVelocity = e1Vec( speedMetersPerSecond, 0.0f, 0.0f );
    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, initialOmegaZ );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    // Frozen RQ0/RQ1/RQ2 provenance: aligned laboratory planar axle guide.
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
        result.set( "error", "ground or wheel shape invalid" );
        return result;
    }

    float mass = NAN;
    float coulombTorqueScale = 0.0f;
    float torqueMagnitude = 0.0f;
    if ( config.family == rh0Rq2Longitudinal )
    {
        mass = b3Body_GetMass( wheelBody );
        if ( b3IsValidFloat( mass ) == false || mass <= 0.0f )
        {
            b3DestroyWorld( worldId );
            result.set( "valid", false );
            result.set( "error", "invalid wheel mass" );
            return result;
        }
        coulombTorqueScale = friction * mass * gravityMagnitude * supportRadius;
        torqueMagnitude = config.demandFraction * coulombTorqueScale;
    }

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

    int crossingStep = -1;
    int nearTransitionFeatureSetChanges = 0;
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

    int pulseSamples = 0;
    int pulseContactDropouts = 0;
    int pulseFeatureSetChanges = 0;
    int pulseMinPointCount = INT_MAX;
    int pulseMaxPointCount = 0;
    float pulseYMin = FLT_MAX;
    float pulseYMax = -FLT_MAX;
    float pulseMaxAbsVy = 0.0f;
    float pulseMaxAbsVz = 0.0f;
    float pulseMaxAbsSlip = 0.0f;
    double pulseAbsSlipSum = 0.0;
    float pulseMaxNormalImpulse = 0.0f;
    double pulseNormalImpulseSum = 0.0;
    double pulseNormalImpulseSqSum = 0.0;
    std::vector<uint32_t> previousPulseFeatures;

    b3Vec3 positionAtSettle = b3Body_GetPosition( wheelBody );
    b3Vec3 velocityAtSettle = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 angularAtSettle = b3Body_GetAngularVelocity( wheelBody );

    b3Vec3 prePulsePosition = b3Body_GetPosition( wheelBody );
    b3Vec3 prePulseVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 prePulseAngular = b3Body_GetAngularVelocity( wheelBody );
    b3Vec3 postPulsePosition = prePulsePosition;
    b3Vec3 postPulseVelocity = prePulseVelocity;
    b3Vec3 postPulseAngular = prePulseAngular;

    for ( int step = 0; step < config.stepCount; ++step )
    {
        if ( config.family == rh0Rq2Longitudinal && step == config.pulseStartStep )
        {
            prePulsePosition = b3Body_GetPosition( wheelBody );
            prePulseVelocity = b3Body_GetLinearVelocity( wheelBody );
            prePulseAngular = b3Body_GetAngularVelocity( wheelBody );
        }

        if ( config.family == rh0Rq2Longitudinal &&
             step >= config.pulseStartStep && step < config.pulseEndStep && torqueMagnitude > 0.0f )
        {
            if ( config.torqueSign > 0 )
            {
                // Initial omegaZ is negative; +Z opposes spin and brakes.
                b3Body_ApplyTorque( wheelBody, e1Vec( 0.0f, 0.0f, torqueMagnitude ), true );
            }
            else if ( config.torqueSign < 0 )
            {
                // Initial omegaZ is negative; -Z increases negative spin and drives.
                b3Body_ApplyTorque( wheelBody, e1Vec( 0.0f, 0.0f, -torqueMagnitude ), true );
            }
        }

        b3World_Step( worldId, dt, subStepCount );
        Rh0ContactSample contact = rh0SampleContact( wheelShape );

        if ( contact.contactCount > 0 && firstContactStep < 0 )
        {
            firstContactStep = step;
        }
        if ( contact.totalNormalImpulse > 1.0e-9f && firstImpulseStep < 0 )
        {
            firstImpulseStep = step;
        }

        if ( step == config.settleStep )
        {
            positionAtSettle = b3Body_GetPosition( wheelBody );
            velocityAtSettle = b3Body_GetLinearVelocity( wheelBody );
            angularAtSettle = b3Body_GetAngularVelocity( wheelBody );

            // RQ0/RQ1 historically seed the feature comparator at settle.
            // RQ2 historically lets the first settled sample seed it instead.
            if ( config.family != rh0Rq2Longitudinal )
            {
                previousFeatures = contact.features;
            }
        }

        b3Vec3 p = b3Body_GetPosition( wheelBody );
        b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
        b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
        float slip = v.x + w.z * supportRadius;

        if ( step >= config.settleStep )
        {
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

            if ( contact.contactCount == 0 )
            {
                settledContactDropouts += 1;
            }
            bool featureChanged = previousFeatures.empty() == false && contact.features != previousFeatures;
            if ( featureChanged )
            {
                settledFeatureSetChanges += 1;
                if ( config.family == rh0Rq1RoadTransition && fabsf( p.x ) <= 0.25f )
                {
                    nearTransitionFeatureSetChanges += 1;
                }
            }
            settledMinPointCount = b3MinInt( settledMinPointCount, contact.pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, contact.pointCount );
            previousFeatures = contact.features;

            settledNormalImpulseSum += contact.totalNormalImpulse;
            settledNormalImpulseSqSum += (double)contact.totalNormalImpulse * (double)contact.totalNormalImpulse;
            settledImpulseSamples += 1;

            if ( config.family == rh0Rq1RoadTransition )
            {
                if ( crossingStep < 0 && p.x >= 0.0f )
                {
                    crossingStep = step;
                }

                if ( fabsf( p.x ) <= 0.25f )
                {
                    nearSamples += 1;
                    nearYMin = b3MinFloat( nearYMin, p.y );
                    nearYMax = b3MaxFloat( nearYMax, p.y );
                    nearMaxAbsVy = b3MaxFloat( nearMaxAbsVy, fabsf( v.y ) );
                    nearMaxAbsSlip = b3MaxFloat( nearMaxAbsSlip, fabsf( slip ) );
                    nearMaxNormalImpulse = b3MaxFloat( nearMaxNormalImpulse, contact.totalNormalImpulse );
                }

                if ( contact.haveManifoldNormal )
                {
                    if ( p.x < -0.50f )
                    {
                        preNormalXSum += contact.manifoldNormalX;
                        preNormalXSamples += 1;
                    }
                    else if ( p.x > 0.50f )
                    {
                        postNormalXSum += contact.manifoldNormalX;
                        postNormalXSamples += 1;
                    }
                }
            }
        }

        if ( config.family == rh0Rq2Longitudinal &&
             step >= config.pulseStartStep && step < config.pulseEndStep )
        {
            pulseSamples += 1;
            pulseYMin = b3MinFloat( pulseYMin, p.y );
            pulseYMax = b3MaxFloat( pulseYMax, p.y );
            pulseMaxAbsVy = b3MaxFloat( pulseMaxAbsVy, fabsf( v.y ) );
            pulseMaxAbsVz = b3MaxFloat( pulseMaxAbsVz, fabsf( v.z ) );
            pulseMaxAbsSlip = b3MaxFloat( pulseMaxAbsSlip, fabsf( slip ) );
            pulseAbsSlipSum += fabsf( slip );
            pulseMaxNormalImpulse = b3MaxFloat( pulseMaxNormalImpulse, contact.totalNormalImpulse );
            pulseNormalImpulseSum += contact.totalNormalImpulse;
            pulseNormalImpulseSqSum += (double)contact.totalNormalImpulse * (double)contact.totalNormalImpulse;
            if ( contact.contactCount == 0 )
            {
                pulseContactDropouts += 1;
            }
            if ( previousPulseFeatures.empty() == false && contact.features != previousPulseFeatures )
            {
                pulseFeatureSetChanges += 1;
            }
            pulseMinPointCount = b3MinInt( pulseMinPointCount, contact.pointCount );
            pulseMaxPointCount = b3MaxInt( pulseMaxPointCount, contact.pointCount );
            previousPulseFeatures = contact.features;
        }

        if ( config.family == rh0Rq2Longitudinal && step == config.pulseEndStep - 1 )
        {
            postPulsePosition = p;
            postPulseVelocity = v;
            postPulseAngular = w;
        }
    }

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    float finalSlip = finalVelocity.x + finalAngular.z * supportRadius;

    double settledImpulseMean = settledImpulseSamples > 0 ? settledNormalImpulseSum / settledImpulseSamples : 0.0;
    double settledImpulseVariance = settledImpulseSamples > 0 ? settledNormalImpulseSqSum / settledImpulseSamples - settledImpulseMean * settledImpulseMean : 0.0;
    if ( settledImpulseVariance < 0.0 ) settledImpulseVariance = 0.0;

    double pulseImpulseMean = pulseSamples > 0 ? pulseNormalImpulseSum / pulseSamples : 0.0;
    double pulseImpulseVariance = pulseSamples > 0 ? pulseNormalImpulseSqSum / pulseSamples - pulseImpulseMean * pulseImpulseMean : 0.0;
    if ( pulseImpulseVariance < 0.0 ) pulseImpulseVariance = 0.0;

    result.set( "valid", true );
    result.set( "scenarioId", config.id );
    result.set( "scenarioName", config.name );
    result.set( "family", config.family );
    result.set( "speedMetersPerSecond", speedMetersPerSecond );
    result.set( "friction", friction );
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
    result.set( "settledNormalImpulseMean", settledImpulseMean );
    result.set( "settledNormalImpulseStd", sqrt( settledImpulseVariance ) );

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

    if ( config.family == rh0Rq1RoadTransition )
    {
        result.set( "roadAngleRadians", config.roadAngleRadians );
        result.set( "roadDropAt10m", roadDropAt10m );
        result.set( "roadHullFaceCount", roadHullFaceCount );
        result.set( "roadTopPlaneCount", roadTopPlaneCount );
        result.set( "roadTopPlaneNormalXMin", roadTopPlaneCount > 0 ? roadTopPlaneNormalXMin : NAN );
        result.set( "roadTopPlaneNormalXMax", roadTopPlaneCount > 0 ? roadTopPlaneNormalXMax : NAN );
        result.set( "roadTopPlaneNormalYMin", roadTopPlaneCount > 0 ? roadTopPlaneNormalYMin : NAN );
        result.set( "roadTopPlaneNormalYMax", roadTopPlaneCount > 0 ? roadTopPlaneNormalYMax : NAN );
        result.set( "crossingStep", crossingStep );
        result.set( "nearTransitionFeatureSetChanges", nearTransitionFeatureSetChanges );
        result.set( "nearSamples", nearSamples );
        result.set( "nearYRange", nearSamples > 0 ? nearYMax - nearYMin : NAN );
        result.set( "nearMaxAbsVy", nearMaxAbsVy );
        result.set( "nearMaxAbsSlip", nearMaxAbsSlip );
        result.set( "nearMaxNormalImpulse", nearMaxNormalImpulse );
        result.set( "preMeanNormalX", preNormalXSamples > 0 ? preNormalXSum / preNormalXSamples : NAN );
        result.set( "postMeanNormalX", postNormalXSamples > 0 ? postNormalXSum / postNormalXSamples : NAN );
    }

    if ( config.family == rh0Rq2Longitudinal )
    {
        result.set( "mass", mass );
        result.set( "demandFraction", config.demandFraction );
        result.set( "coulombTorqueScale", coulombTorqueScale );
        result.set( "torqueMagnitude", torqueMagnitude );
        result.set( "torqueSign", config.torqueSign );
        result.set( "pulseStartStep", config.pulseStartStep );
        result.set( "pulseEndStep", config.pulseEndStep );
        result.set( "pulseDurationSeconds", ( config.pulseEndStep - config.pulseStartStep ) * dt );
        result.set( "pulseSamples", pulseSamples );
        result.set( "pulseContactDropouts", pulseContactDropouts );
        result.set( "pulseFeatureSetChanges", pulseFeatureSetChanges );
        result.set( "pulseMinPointCount", pulseMinPointCount == INT_MAX ? 0 : pulseMinPointCount );
        result.set( "pulseMaxPointCount", pulseMaxPointCount );
        result.set( "pulseYRange", pulseSamples > 0 ? pulseYMax - pulseYMin : NAN );
        result.set( "pulseMaxAbsVy", pulseMaxAbsVy );
        result.set( "pulseMaxAbsVz", pulseMaxAbsVz );
        result.set( "pulseMeanAbsSlip", pulseSamples > 0 ? pulseAbsSlipSum / pulseSamples : NAN );
        result.set( "pulseMaxAbsSlip", pulseMaxAbsSlip );
        result.set( "pulseNormalImpulseMean", pulseImpulseMean );
        result.set( "pulseNormalImpulseStd", sqrt( pulseImpulseVariance ) );
        result.set( "pulseMaxNormalImpulse", pulseMaxNormalImpulse );
        result.set( "prePulseX", prePulsePosition.x );
        result.set( "prePulseVx", prePulseVelocity.x );
        result.set( "prePulseVy", prePulseVelocity.y );
        result.set( "prePulseOmegaZ", prePulseAngular.z );
        result.set( "postPulseX", postPulsePosition.x );
        result.set( "postPulseVx", postPulseVelocity.x );
        result.set( "postPulseVy", postPulseVelocity.y );
        result.set( "postPulseOmegaZ", postPulseAngular.z );
        result.set( "pulseDisplacementX", postPulsePosition.x - prePulsePosition.x );
        result.set( "pulseVxDelta", postPulseVelocity.x - prePulseVelocity.x );
        result.set( "pulseOmegaDelta", postPulseAngular.z - prePulseAngular.z );
    }

    b3DestroyWorld( worldId );
    return result;
}
