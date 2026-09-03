from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

include_anchor = '#include <array>\n'
if text.count(include_anchor) != 1:
    raise SystemExit('E2a include anchor drifted; apply after E1 patch')
text = text.replace(include_anchor, include_anchor + '#include <algorithm>\n')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// E2a is a diagnostic-only dynamic carrier for the OUTER convex support
// envelope of the recovered annular P75 tire. It deliberately does not model
// the bore or inner/side contacts. Its only purpose is to exercise Box3D's real
// contact lifecycle on the broad flat-ground regime after E1d2 showed that a
// single tessellation winner is not a meaningful support semantic.
static int e2aBuildOuterSupportHull( b3Vec2* output )
{
    b3Vec2 hull[E1_ANNULAR_STATION_COUNT];
    int count = 0;
    for ( int i = 0; i < E1_ANNULAR_STATION_COUNT; ++i )
    {
        b3Vec2 p = { E1_ANNULAR_AXIAL[i], E1_ANNULAR_OUTER_P75[i] };
        while ( count >= 2 )
        {
            b3Vec2 a = hull[count - 2];
            b3Vec2 b = hull[count - 1];
            float cross = ( b.x - a.x ) * ( p.y - b.y ) - ( b.y - a.y ) * ( p.x - b.x );
            if ( cross >= -1.0e-10f )
            {
                count -= 1;
            }
            else
            {
                break;
            }
        }
        hull[count++] = p;
    }

    if ( count > B3_MAX_WHEEL_PROFILE_POINTS )
    {
        return -count;
    }
    for ( int i = 0; i < count; ++i )
    {
        output[i] = hull[i];
    }
    return count;
}

static bool e2aMakeOuterCarrier( b3Wheel* wheelOut, int* rawHullCountOut, int* effectiveProfileCountOut )
{
    b3Vec2 profile[B3_MAX_WHEEL_PROFILE_POINTS];
    int rawCount = e2aBuildOuterSupportHull( profile );
    if ( rawHullCountOut != nullptr )
    {
        *rawHullCountOut = rawCount;
    }
    if ( rawCount <= 0 || rawCount > B3_MAX_WHEEL_PROFILE_POINTS )
    {
        return false;
    }

    b3Wheel wheel = b3MakeWheelProfile( e1Vec( 0.0f, 0.0f, 0.0f ), b3Vec3_axisZ, profile, rawCount, 0.0f );
    b3Vec2 effective[B3_MAX_WHEEL_PROFILE_POINTS];
    int effectiveCount = b3GetWheelProfile( &wheel, effective );
    if ( effectiveProfileCountOut != nullptr )
    {
        *effectiveProfileCountOut = effectiveCount;
    }
    if ( effectiveCount <= 0 || effectiveCount > B3_MAX_WHEEL_PROFILE_POINTS )
    {
        return false;
    }
    *wheelOut = wheel;
    return true;
}

static val e2aOuterP75CarrierInfo()
{
    val result = val::object();
    b3Wheel wheel = {};
    int rawCount = 0;
    int effectiveCount = 0;
    if ( e2aMakeOuterCarrier( &wheel, &rawCount, &effectiveCount ) == false )
    {
        result.set( "valid", false );
        result.set( "rawHullCount", rawCount );
        return result;
    }

    b3Vec2 profile[B3_MAX_WHEEL_PROFILE_POINTS];
    int count = b3GetWheelProfile( &wheel, profile );
    float sourceOuterMax = -FLT_MAX;
    for ( int i = 0; i < E1_ANNULAR_STATION_COUNT; ++i )
    {
        sourceOuterMax = b3MaxFloat( sourceOuterMax, E1_ANNULAR_OUTER_P75[i] );
    }

    float effectiveOuterMax = -FLT_MAX;
    for ( int i = 0; i < count; ++i )
    {
        effectiveOuterMax = b3MaxFloat( effectiveOuterMax, profile[i].y );
    }
    float plateauMin = FLT_MAX;
    float plateauMax = -FLT_MAX;
    for ( int i = 0; i < count; ++i )
    {
        if ( fabsf( profile[i].y - effectiveOuterMax ) <= 2.0e-6f )
        {
            plateauMin = b3MinFloat( plateauMin, profile[i].x );
            plateauMax = b3MaxFloat( plateauMax, profile[i].x );
        }
    }

    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    val profileJs = val::array();
    for ( int i = 0; i < count; ++i )
    {
        val p = val::object();
        p.set( "axial", profile[i].x );
        p.set( "radius", profile[i].y );
        profileJs.set( i, p );
    }

    result.set( "valid", true );
    result.set( "rawHullCount", rawCount );
    result.set( "effectiveProfileCount", effectiveCount );
    result.set( "sourceOuterMax", sourceOuterMax );
    result.set( "effectiveOuterMax", effectiveOuterMax );
    result.set( "supportRadiusDown", -supportDown.y );
    result.set( "supportAxialDown", supportDown.z );
    result.set( "plateauAxialMin", plateauMin );
    result.set( "plateauAxialMax", plateauMax );
    result.set( "profile", profileJs );
    return result;
}

static val e2aRunOuterP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )
{
    val result = val::object();
    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false )
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
        result.set( "rawHullCount", rawHullCount );
        return result;
    }

    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    float supportRadius = -supportDown.y;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -9.81f, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, warmStarting );

    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    groundBodyDef.position = e1Vec( 0.0f, -0.10f, 0.0f );
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );
    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = 0.0f;
    groundShapeDef.baseMaterial.restitution = 0.0f;
    b3BoxHull groundHull = b3MakeBoxHull( 5.0f, 0.10f, 5.0f );
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );

    float phase = 2.0f * B3_PI * (float)phaseIndex / 256.0f;
    float half = 0.5f * phase;
    b3Quat phaseRotation = { { 0.0f, 0.0f, sinf( half ) }, cosf( half ) };

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + 0.010f, 0.0f );
    wheelBodyDef.rotation = phaseRotation;
    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );

    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = 0.0f;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;
    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );

    if ( b3Shape_IsValid( groundShape ) == false || b3Shape_IsValid( wheelShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }

    const int stepCount = 480;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;
    int firstContactStep = -1;
    int firstImpulseStep = -1;
    int contactDropoutsAfterImpulse = 0;
    int featureSetChangesAfterImpulse = 0;
    int contactIdChangesAfterImpulse = 0;
    int postImpulsePointCount = 0;
    int postImpulsePersistedPointCount = 0;
    int minPointCountAfterImpulse = INT_MAX;
    int maxPointCountAfterImpulse = 0;
    float maxNormalTiltDegAfterImpulse = 0.0f;
    float minSeparationAfterImpulse = FLT_MAX;
    float maxSeparationAfterImpulse = -FLT_MAX;
    std::vector<uint32_t> previousFeatures;
    uint64_t previousContactKey = 0;
    bool havePreviousContactKey = false;
    std::vector<uint32_t> uniqueFeatures;

    int settledSamples = 0;
    float settledYMin = FLT_MAX;
    float settledYMax = -FLT_MAX;
    float settledMaxAbsVy = 0.0f;
    float settledMinAngularZ = FLT_MAX;
    float settledMaxAngularZ = -FLT_MAX;
    double settledImpulseSum = 0.0;
    double settledImpulseSqSum = 0.0;
    float settledImpulseMin = FLT_MAX;
    float settledImpulseMax = -FLT_MAX;

    val contactSamples = val::array();
    int contactSampleCount = 0;

    for ( int step = 0; step < stepCount; ++step )
    {
        b3World_Step( worldId, dt, subStepCount );

        int capacity = b3Shape_GetContactCapacity( wheelShape );
        std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
        int contactCount = capacity > 0 ? b3Shape_GetContactData( wheelShape, contacts.data(), capacity ) : 0;

        int manifoldCount = 0;
        int pointCount = 0;
        int persistedCount = 0;
        float totalNormalImpulse = 0.0f;
        float finalNormalImpulse = 0.0f;
        float stepMinSeparation = FLT_MAX;
        float stepMaxSeparation = -FLT_MAX;
        float stepMaxNormalTiltDeg = 0.0f;
        std::vector<uint32_t> currentFeatures;
        uint64_t contactKey = 0;
        bool haveContactKey = false;

        for ( int ci = 0; ci < contactCount; ++ci )
        {
            const b3ContactData& contact = contacts[ci];
            if ( haveContactKey == false )
            {
                contactKey = ( (uint64_t)contact.contactId.generation << 32 ) | (uint32_t)contact.contactId.index1;
                haveContactKey = true;
            }
            manifoldCount += contact.manifoldCount;
            for ( int mi = 0; mi < contact.manifoldCount; ++mi )
            {
                const b3Manifold& manifold = contact.manifolds[mi];
                float normalLength = b3Length( manifold.normal );
                if ( normalLength > FLT_EPSILON )
                {
                    float cosine = b3ClampFloat( fabsf( manifold.normal.y ) / normalLength, 0.0f, 1.0f );
                    float tilt = acosf( cosine ) * B3_RAD_TO_DEG;
                    stepMaxNormalTiltDeg = b3MaxFloat( stepMaxNormalTiltDeg, tilt );
                }
                for ( int pi = 0; pi < manifold.pointCount; ++pi )
                {
                    const b3ManifoldPoint& point = manifold.points[pi];
                    pointCount += 1;
                    persistedCount += point.persisted ? 1 : 0;
                    totalNormalImpulse += point.totalNormalImpulse;
                    finalNormalImpulse += point.normalImpulse;
                    stepMinSeparation = b3MinFloat( stepMinSeparation, point.separation );
                    stepMaxSeparation = b3MaxFloat( stepMaxSeparation, point.separation );
                    currentFeatures.push_back( point.featureId );
                }
            }
        }

        std::sort( currentFeatures.begin(), currentFeatures.end() );
        currentFeatures.erase( std::unique( currentFeatures.begin(), currentFeatures.end() ), currentFeatures.end() );

        if ( contactCount > 0 && firstContactStep < 0 )
        {
            firstContactStep = step;
        }
        if ( totalNormalImpulse > 1.0e-9f && firstImpulseStep < 0 )
        {
            firstImpulseStep = step;
        }

        if ( firstImpulseStep >= 0 )
        {
            if ( contactCount == 0 )
            {
                if ( step > firstImpulseStep )
                {
                    contactDropoutsAfterImpulse += 1;
                }
            }
            else
            {
                if ( step > firstImpulseStep && previousFeatures.empty() == false && currentFeatures != previousFeatures )
                {
                    featureSetChangesAfterImpulse += 1;
                }
                if ( step > firstImpulseStep && havePreviousContactKey && haveContactKey && contactKey != previousContactKey )
                {
                    contactIdChangesAfterImpulse += 1;
                }
                postImpulsePointCount += pointCount;
                if ( step > firstImpulseStep )
                {
                    postImpulsePersistedPointCount += persistedCount;
                }
                minPointCountAfterImpulse = b3MinInt( minPointCountAfterImpulse, pointCount );
                maxPointCountAfterImpulse = b3MaxInt( maxPointCountAfterImpulse, pointCount );
                maxNormalTiltDegAfterImpulse = b3MaxFloat( maxNormalTiltDegAfterImpulse, stepMaxNormalTiltDeg );
                if ( pointCount > 0 )
                {
                    minSeparationAfterImpulse = b3MinFloat( minSeparationAfterImpulse, stepMinSeparation );
                    maxSeparationAfterImpulse = b3MaxFloat( maxSeparationAfterImpulse, stepMaxSeparation );
                }
                for ( uint32_t feature : currentFeatures )
                {
                    if ( std::find( uniqueFeatures.begin(), uniqueFeatures.end(), feature ) == uniqueFeatures.end() )
                    {
                        uniqueFeatures.push_back( feature );
                    }
                }
            }
        }

        if ( contactCount > 0 )
        {
            previousFeatures = currentFeatures;
            if ( haveContactKey )
            {
                previousContactKey = contactKey;
                havePreviousContactKey = true;
            }
        }

        if ( firstContactStep >= 0 && step <= firstContactStep + 11 )
        {
            b3Pos p = b3Body_GetPosition( wheelBody );
            b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
            val sample = val::object();
            sample.set( "step", step );
            sample.set( "y", (double)p.y );
            sample.set( "vy", v.y );
            sample.set( "contactCount", contactCount );
            sample.set( "manifoldCount", manifoldCount );
            sample.set( "pointCount", pointCount );
            sample.set( "persistedCount", persistedCount );
            sample.set( "totalNormalImpulse", totalNormalImpulse );
            sample.set( "finalNormalImpulse", finalNormalImpulse );
            sample.set( "normalTiltDeg", stepMaxNormalTiltDeg );
            val features = val::array();
            for ( int fi = 0; fi < (int)currentFeatures.size(); ++fi )
            {
                features.set( fi, currentFeatures[fi] );
            }
            sample.set( "featureIds", features );
            contactSamples.set( contactSampleCount++, sample );
        }

        if ( firstImpulseStep >= 0 && step >= firstImpulseStep + 120 )
        {
            b3Pos p = b3Body_GetPosition( wheelBody );
            b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
            b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, (float)p.y );
            settledYMax = b3MaxFloat( settledYMax, (float)p.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMinAngularZ = b3MinFloat( settledMinAngularZ, w.z );
            settledMaxAngularZ = b3MaxFloat( settledMaxAngularZ, w.z );
            settledImpulseSum += totalNormalImpulse;
            settledImpulseSqSum += (double)totalNormalImpulse * (double)totalNormalImpulse;
            settledImpulseMin = b3MinFloat( settledImpulseMin, totalNormalImpulse );
            settledImpulseMax = b3MaxFloat( settledImpulseMax, totalNormalImpulse );
        }
    }

    std::sort( uniqueFeatures.begin(), uniqueFeatures.end() );
    b3Pos finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalLinearVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngularVelocity = b3Body_GetAngularVelocity( wheelBody );
    float mass = b3Body_GetMass( wheelBody );

    double impulseMean = settledSamples > 0 ? settledImpulseSum / (double)settledSamples : NAN;
    double impulseVariance = settledSamples > 0 ? settledImpulseSqSum / (double)settledSamples - impulseMean * impulseMean : NAN;
    if ( impulseVariance < 0.0 && impulseVariance > -1.0e-12 )
    {
        impulseVariance = 0.0;
    }
    double impulseStd = settledSamples > 0 && impulseVariance >= 0.0 ? sqrt( impulseVariance ) : NAN;

    val uniqueFeaturesJs = val::array();
    for ( int i = 0; i < (int)uniqueFeatures.size(); ++i )
    {
        uniqueFeaturesJs.set( i, uniqueFeatures[i] );
    }

    result.set( "valid", true );
    result.set( "phaseIndex", phaseIndex );
    result.set( "spinRadiansPerSecond", spinRadiansPerSecond );
    result.set( "warmStarting", warmStarting );
    result.set( "stepCount", stepCount );
    result.set( "dt", dt );
    result.set( "subStepCount", subStepCount );
    result.set( "supportRadius", supportRadius );
    result.set( "rawHullCount", rawHullCount );
    result.set( "effectiveProfileCount", effectiveProfileCount );
    result.set( "mass", mass );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "contactDropoutsAfterImpulse", contactDropoutsAfterImpulse );
    result.set( "featureSetChangesAfterImpulse", featureSetChangesAfterImpulse );
    result.set( "contactIdChangesAfterImpulse", contactIdChangesAfterImpulse );
    result.set( "postImpulsePointCount", postImpulsePointCount );
    result.set( "postImpulsePersistedPointCount", postImpulsePersistedPointCount );
    result.set( "minPointCountAfterImpulse", minPointCountAfterImpulse == INT_MAX ? -1 : minPointCountAfterImpulse );
    result.set( "maxPointCountAfterImpulse", maxPointCountAfterImpulse );
    result.set( "maxNormalTiltDegAfterImpulse", maxNormalTiltDegAfterImpulse );
    result.set( "minSeparationAfterImpulse", minSeparationAfterImpulse == FLT_MAX ? NAN : minSeparationAfterImpulse );
    result.set( "maxSeparationAfterImpulse", maxSeparationAfterImpulse == -FLT_MAX ? NAN : maxSeparationAfterImpulse );
    result.set( "uniqueFeatureIds", uniqueFeaturesJs );
    result.set( "settledSamples", settledSamples );
    result.set( "settledYMin", settledSamples > 0 ? settledYMin : NAN );
    result.set( "settledYMax", settledSamples > 0 ? settledYMax : NAN );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledMaxAbsVy", settledSamples > 0 ? settledMaxAbsVy : NAN );
    result.set( "settledMinAngularZ", settledSamples > 0 ? settledMinAngularZ : NAN );
    result.set( "settledMaxAngularZ", settledSamples > 0 ? settledMaxAngularZ : NAN );
    result.set( "settledTotalImpulseMean", impulseMean );
    result.set( "settledTotalImpulseStd", impulseStd );
    result.set( "settledTotalImpulseMin", settledSamples > 0 ? settledImpulseMin : NAN );
    result.set( "settledTotalImpulseMax", settledSamples > 0 ? settledImpulseMax : NAN );
    result.set( "finalY", (double)finalPosition.y );
    result.set( "finalVy", finalLinearVelocity.y );
    result.set( "finalAngularZ", finalAngularVelocity.z );
    result.set( "contactSamples", contactSamples );

    b3DestroyWorld( worldId );
    return result;
}
'''
if text.count(namespace_end) != 1:
    raise SystemExit('E2a namespace-end anchor drifted; apply after E1 patch')
text = text.replace(namespace_end, helper + '\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n')

binding_anchor = '\tfunction( "e1ProbeAnnularP75Box", &e1ProbeAnnularP75Box );\n'
binding_replacement = binding_anchor + (
    '\tfunction( "e2aOuterP75CarrierInfo", &e2aOuterP75CarrierInfo );\n'
    '\tfunction( "e2aRunOuterP75GroundCarrier", &e2aRunOuterP75GroundCarrier );\n'
)
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a binding anchor drifted; apply after E1 patch')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E2A_BINDINGS_PATCH_OK')
