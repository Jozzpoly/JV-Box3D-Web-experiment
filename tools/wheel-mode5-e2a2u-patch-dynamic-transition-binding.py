from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2u-patch-dynamic-transition-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
if text.count(namespace_end) != 1:
    raise SystemExit('E2a2u namespace anchor drifted')

helper = r'''

struct E2a2uTransitionSample
{
    int step;
    float angleRadians;
    float supportValueDelta;
    int predictedPointCount;
    int pointCount;
    int persistedCount;
    uint32_t feature0;
    uint32_t feature1;
    bool persisted0;
    bool persisted1;
    float normalImpulse0;
    float normalImpulse1;
    float separation0;
    float separation1;
    float totalNormalImpulse;
    float finalNormalImpulse;
    double y;
    float vy;
};

static val e2a2uSampleToVal( const E2a2uTransitionSample& sample, int relativeStep )
{
    val out = val::object();
    out.set( "relativeStep", relativeStep );
    out.set( "step", sample.step );
    out.set( "angleRadians", sample.angleRadians );
    out.set( "angleMicroradians", sample.angleRadians * 1.0e6f );
    out.set( "supportValueDelta", sample.supportValueDelta );
    out.set( "supportValueDeltaMicrometers", sample.supportValueDelta * 1.0e6f );
    out.set( "predictedPointCount", sample.predictedPointCount );
    out.set( "pointCount", sample.pointCount );
    out.set( "persistedCount", sample.persistedCount );
    out.set( "feature0", sample.feature0 );
    out.set( "feature1", sample.feature1 );
    out.set( "persisted0", sample.persisted0 );
    out.set( "persisted1", sample.persisted1 );
    out.set( "normalImpulse0", sample.normalImpulse0 );
    out.set( "normalImpulse1", sample.normalImpulse1 );
    out.set( "separation0", sample.separation0 );
    out.set( "separation1", sample.separation1 );
    out.set( "totalNormalImpulse", sample.totalNormalImpulse );
    out.set( "finalNormalImpulse", sample.finalNormalImpulse );
    out.set( "y", sample.y );
    out.set( "vy", sample.vy );
    return out;
}

// E2a2u crosses the native plane support-feature boundary through real relative
// orientation, not by mutating wheel profile geometry. The flat P75 wheel stays
// tilt-locked while a kinematic ground box rotates extremely slowly about X.
// direction = +1: settle flat (2 points), then tilt away (2 -> 1).
// direction = -1: settle at +15 urad (1 point), then rotate back to flat (1 -> 2).
static val e2a2uRunDynamicSupportTransition( float spinRadiansPerSecond, int direction )
{
    val result = val::object();
    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || ( direction != 1 && direction != -1 ) )
    {
        result.set( "valid", false );
        return result;
    }

    b3Wheel wheel = {};
    int rawProfileCount = 0;
    int effectiveProfileCount = 0;
    if ( e2a2MakeFlatCarrier( &wheel, &rawProfileCount, &effectiveProfileCount ) == false )
    {
        result.set( "valid", false );
        return result;
    }

    b3Vec2 profile[B3_MAX_WHEEL_PROFILE_POINTS];
    int profileCount = b3GetWheelProfile( &wheel, profile );
    if ( profileCount != 2 )
    {
        result.set( "valid", false );
        return result;
    }

    const float supportSpan = profile[1].x - profile[0].x;
    const float supportBestValue = b3MaxFloat( profile[0].y, profile[1].y );
    const float sourceTolerance = b3MaxFloat( 1.0e-6f, 8.0f * FLT_EPSILON * ( 1.0f + fabsf( supportBestValue ) ) );
    const float angularSpeed = 2.0e-5f;
    const int settleSteps = 240;
    const int motionSteps = 180;
    const int postSteps = 60;
    const int stepCount = settleSteps + motionSteps + postSteps;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;
    const float initialAngle = direction > 0 ? 0.0f : angularSpeed * dt * (float)motionSteps;
    const float commandedAngularX = direction > 0 ? angularSpeed : -angularSpeed;

    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    float supportRadius = -supportDown.y;

    b3WorldDef worldDef = b3DefaultWorldDef();
    worldDef.gravity = e1Vec( 0.0f, -9.81f, 0.0f );
    worldDef.enableSleep = false;
    worldDef.workerCount = 1;
    b3WorldId worldId = b3CreateWorld( &worldDef );
    b3World_EnableWarmStarting( worldId, true );

    float groundHalf = 0.5f * initialAngle;
    b3Quat groundInitialRotation = { { sinf( groundHalf ), 0.0f, 0.0f }, cosf( groundHalf ) };
    b3BodyDef groundBodyDef = b3DefaultBodyDef();
    groundBodyDef.type = b3_kinematicBody;
    groundBodyDef.position = e1Vec( 0.0f, -0.10f, 0.0f );
    groundBodyDef.rotation = groundInitialRotation;
    groundBodyDef.enableSleep = false;
    b3BodyId groundBody = b3CreateBody( worldId, &groundBodyDef );
    b3ShapeDef groundShapeDef = b3DefaultShapeDef();
    groundShapeDef.baseMaterial.friction = 0.0f;
    groundShapeDef.baseMaterial.restitution = 0.0f;
    b3BoxHull groundHull = b3MakeBoxHull( 5.0f, 0.10f, 5.0f );
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + 0.010f, 0.0f );
    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    wheelBodyDef.motionLocks.angularX = true;
    wheelBodyDef.motionLocks.angularY = true;
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

    int topologyMismatchCount = 0;
    int transitionCount = 0;
    int transitionStep = -1;
    int transitionFrom = -1;
    int transitionTo = -1;
    int transitionPersistedCount = -1;
    float transitionVyDelta = NAN;
    float transitionFinalImpulseDelta = NAN;
    float transitionTotalImpulseDelta = NAN;
    float maxAbsVyMotion = 0.0f;
    float maxAbsFinalImpulseStepDeltaMotion = 0.0f;
    float maxAbsTotalImpulseStepDeltaMotion = 0.0f;
    int contactDropoutsMotion = 0;
    int contactIdChangesMotion = 0;
    uint64_t previousContactKey = 0;
    bool havePreviousContactKey = false;

    E2a2uTransitionSample previousSample = {};
    bool havePreviousSample = false;
    int previousPointCount = -1;
    val transitionSamples = val::array();
    int transitionSampleCount = 0;
    int captureRemaining = 0;
    int relativeAfter = 1;

    for ( int step = 0; step < stepCount; ++step )
    {
        if ( step == settleSteps )
        {
            b3Body_SetAngularVelocity( groundBody, e1Vec( commandedAngularX, 0.0f, 0.0f ) );
        }
        if ( step == settleSteps + motionSteps )
        {
            b3Body_SetAngularVelocity( groundBody, b3Vec3_zero );
        }

        b3World_Step( worldId, dt, subStepCount );

        b3Quat groundRotation = b3Body_GetRotation( groundBody );
        b3Vec3 groundUp = b3RotateVector( groundRotation, b3Vec3_axisY );
        float angle = atan2f( groundUp.z, groundUp.y );
        float axial = fabsf( groundUp.z );
        float supportValueDelta = fabsf( supportSpan ) * axial;
        int predictedPointCount = supportValueDelta <= sourceTolerance ? 2 : 1;

        int capacity = b3Shape_GetContactCapacity( wheelShape );
        std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
        int contactCount = capacity > 0 ? b3Shape_GetContactData( wheelShape, contacts.data(), capacity ) : 0;

        int pointCount = 0;
        int persistedCount = 0;
        uint32_t features[2] = { 0u, 0u };
        bool persisted[2] = { false, false };
        float normalImpulses[2] = { 0.0f, 0.0f };
        float separations[2] = { NAN, NAN };
        float totalNormalImpulse = 0.0f;
        float finalNormalImpulse = 0.0f;
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
            for ( int mi = 0; mi < contact.manifoldCount; ++mi )
            {
                const b3Manifold& manifold = contact.manifolds[mi];
                for ( int pi = 0; pi < manifold.pointCount; ++pi )
                {
                    const b3ManifoldPoint& point = manifold.points[pi];
                    if ( pointCount < 2 )
                    {
                        features[pointCount] = point.featureId;
                        persisted[pointCount] = point.persisted;
                        normalImpulses[pointCount] = point.normalImpulse;
                        separations[pointCount] = point.separation;
                    }
                    pointCount += 1;
                    persistedCount += point.persisted ? 1 : 0;
                    totalNormalImpulse += point.totalNormalImpulse;
                    finalNormalImpulse += point.normalImpulse;
                }
            }
        }

        b3Pos wheelPosition = b3Body_GetPosition( wheelBody );
        b3Vec3 wheelVelocity = b3Body_GetLinearVelocity( wheelBody );

        E2a2uTransitionSample sample = {
            step,
            angle,
            supportValueDelta,
            predictedPointCount,
            pointCount,
            persistedCount,
            features[0],
            features[1],
            persisted[0],
            persisted[1],
            normalImpulses[0],
            normalImpulses[1],
            separations[0],
            separations[1],
            totalNormalImpulse,
            finalNormalImpulse,
            (double)wheelPosition.y,
            wheelVelocity.y,
        };

        if ( step >= settleSteps - 1 && contactCount > 0 && pointCount != predictedPointCount )
        {
            topologyMismatchCount += 1;
        }

        if ( step >= settleSteps && contactCount == 0 )
        {
            contactDropoutsMotion += 1;
        }
        if ( step >= settleSteps && havePreviousContactKey && haveContactKey && contactKey != previousContactKey )
        {
            contactIdChangesMotion += 1;
        }
        if ( haveContactKey )
        {
            previousContactKey = contactKey;
            havePreviousContactKey = true;
        }

        if ( step >= settleSteps && step < settleSteps + motionSteps )
        {
            maxAbsVyMotion = b3MaxFloat( maxAbsVyMotion, fabsf( wheelVelocity.y ) );
            if ( havePreviousSample )
            {
                maxAbsFinalImpulseStepDeltaMotion = b3MaxFloat(
                    maxAbsFinalImpulseStepDeltaMotion, fabsf( sample.finalNormalImpulse - previousSample.finalNormalImpulse ) );
                maxAbsTotalImpulseStepDeltaMotion = b3MaxFloat(
                    maxAbsTotalImpulseStepDeltaMotion, fabsf( sample.totalNormalImpulse - previousSample.totalNormalImpulse ) );
            }
        }

        if ( step >= settleSteps && previousPointCount > 0 && pointCount > 0 && pointCount != previousPointCount )
        {
            transitionCount += 1;
            if ( transitionStep < 0 )
            {
                transitionStep = step;
                transitionFrom = previousPointCount;
                transitionTo = pointCount;
                transitionPersistedCount = persistedCount;
                if ( havePreviousSample )
                {
                    transitionVyDelta = sample.vy - previousSample.vy;
                    transitionFinalImpulseDelta = sample.finalNormalImpulse - previousSample.finalNormalImpulse;
                    transitionTotalImpulseDelta = sample.totalNormalImpulse - previousSample.totalNormalImpulse;
                    transitionSamples.set( transitionSampleCount++, e2a2uSampleToVal( previousSample, -1 ) );
                }
                transitionSamples.set( transitionSampleCount++, e2a2uSampleToVal( sample, 0 ) );
                captureRemaining = 4;
                relativeAfter = 1;
            }
        }
        else if ( captureRemaining > 0 && transitionStep >= 0 && step > transitionStep )
        {
            transitionSamples.set( transitionSampleCount++, e2a2uSampleToVal( sample, relativeAfter++ ) );
            captureRemaining -= 1;
        }

        previousPointCount = pointCount > 0 ? pointCount : previousPointCount;
        previousSample = sample;
        havePreviousSample = true;
    }

    b3Pos finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalLinearVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngularVelocity = b3Body_GetAngularVelocity( wheelBody );
    b3Quat finalGroundRotation = b3Body_GetRotation( groundBody );
    b3Vec3 finalGroundUp = b3RotateVector( finalGroundRotation, b3Vec3_axisY );
    float finalGroundAngle = atan2f( finalGroundUp.z, finalGroundUp.y );

    result.set( "valid", true );
    result.set( "direction", direction );
    result.set( "transitionLabel", direction > 0 ? "2to1" : "1to2" );
    result.set( "spinRadiansPerSecond", spinRadiansPerSecond );
    result.set( "warmStarting", true );
    result.set( "dt", dt );
    result.set( "subStepCount", subStepCount );
    result.set( "settleSteps", settleSteps );
    result.set( "motionSteps", motionSteps );
    result.set( "postSteps", postSteps );
    result.set( "angularSpeed", angularSpeed );
    result.set( "initialAngleRadians", initialAngle );
    result.set( "initialAngleMicroradians", initialAngle * 1.0e6f );
    result.set( "finalGroundAngleRadians", finalGroundAngle );
    result.set( "finalGroundAngleMicroradians", finalGroundAngle * 1.0e6f );
    result.set( "supportSpan", supportSpan );
    result.set( "sourceTolerance", sourceTolerance );
    result.set( "sourceToleranceMicrometers", sourceTolerance * 1.0e6f );
    result.set( "predictedTiltThresholdRadians", asinf( b3ClampFloat( sourceTolerance / fabsf( supportSpan ), 0.0f, 1.0f ) ) );
    result.set( "predictedTiltThresholdMicroradians", asinf( b3ClampFloat( sourceTolerance / fabsf( supportSpan ), 0.0f, 1.0f ) ) * 1.0e6f );
    result.set( "topologyMismatchCount", topologyMismatchCount );
    result.set( "transitionCount", transitionCount );
    result.set( "transitionStep", transitionStep );
    result.set( "transitionFrom", transitionFrom );
    result.set( "transitionTo", transitionTo );
    result.set( "transitionPersistedCount", transitionPersistedCount );
    result.set( "transitionVyDelta", transitionVyDelta );
    result.set( "transitionFinalImpulseDelta", transitionFinalImpulseDelta );
    result.set( "transitionTotalImpulseDelta", transitionTotalImpulseDelta );
    result.set( "maxAbsVyMotion", maxAbsVyMotion );
    result.set( "maxAbsFinalImpulseStepDeltaMotion", maxAbsFinalImpulseStepDeltaMotion );
    result.set( "maxAbsTotalImpulseStepDeltaMotion", maxAbsTotalImpulseStepDeltaMotion );
    result.set( "contactDropoutsMotion", contactDropoutsMotion );
    result.set( "contactIdChangesMotion", contactIdChangesMotion );
    result.set( "finalY", (double)finalPosition.y );
    result.set( "finalVy", finalLinearVelocity.y );
    result.set( "finalAngularX", finalAngularVelocity.x );
    result.set( "finalAngularY", finalAngularVelocity.y );
    result.set( "finalAngularZ", finalAngularVelocity.z );
    result.set( "transitionSamples", transitionSamples );

    b3DestroyWorld( worldId );
    return result;
}
'''

text = text.replace(namespace_end, helper + namespace_end, 1)

binding_anchor = '\tfunction( "e2a2mRunFlatP75GroundCarrierTiltLocked", &e2a2mRunFlatP75GroundCarrierTiltLocked );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2u expected one tilt-lock binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2uRunDynamicSupportTransition", &e2a2uRunDynamicSupportTransition );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2U_DYNAMIC_TRANSITION_BINDING_PATCH_OK')
