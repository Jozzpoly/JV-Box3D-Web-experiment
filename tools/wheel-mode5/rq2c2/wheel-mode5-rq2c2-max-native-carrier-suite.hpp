// Wheel-mode5 RQ2C2 maximum-native generic-constraint carrier falsifier.
//
// Same physics/topology/masses as executed RQ2C1. The only physics change is
// generic constraint tuning on heading prismatic, vertical prismatic and
// spherical center: 240 Hz / damping 2.0. At dt=1/240 with 4 substeps the
// pinned solver clamps generic joint hertz to 0.25*inv_h = 240 Hz, making this
// a maximum-native-stiffness architecture falsifier rather than a tuning sweep.
// The existing ParallelJoint angular mount remains 120 Hz / damping 1.0.

static val rq2c2RunOuterP75MaxNativeCarrier( float yawDegrees )
{
    val result = val::object();
    if ( b3IsValidFloat( yawDegrees ) == false || rq2cSupportedYawDegrees( yawDegrees ) == false )
    {
        result.set( "valid", false );
        result.set( "error", "RQ2C2 supports only 0 / +3.5 / -3.5 degree yaw" );
        return result;
    }

    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float gravityMagnitude = 9.81f;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;
    const int stepCount = 960;
    const int settleStep = 240;
    const float mountHertz = 120.0f;
    const float mountDampingRatio = 1.0f;
    const float carrierConstraintHertz = 240.0f;
    const float carrierConstraintDampingRatio = 2.0f;
    const float totalGuideMassRatio = 0.01f;
    const float perGuideBodyMassRatio = 0.005f;
    const float yawRadians = yawDegrees * ( B3_PI / 180.0f );

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

    b3Quat targetRotation = b3MakeQuatFromAxisAngle( b3Vec3_axisY, yawRadians );
    b3Vec3 targetHeading = b3RotateVector( targetRotation, b3Vec3_axisX );
    b3Vec3 targetAxle = b3RotateVector( targetRotation, b3Vec3_axisZ );
    b3Vec3 initialVelocity = rq2cScale( speedMetersPerSecond, targetHeading );
    float initialOmegaMagnitude = -speedMetersPerSecond / supportRadius;

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

    b3Vec3 initialHorizontal = rq2cScale( -3.0f, targetHeading );
    b3Pos initialCenter = e1Vec( initialHorizontal.x, supportRadius + 0.001f, initialHorizontal.z );

    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = initialCenter;
    wheelBodyDef.rotation = targetRotation;
    wheelBodyDef.linearVelocity = initialVelocity;
    wheelBodyDef.angularVelocity = rq2cScale( initialOmegaMagnitude, targetAxle );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );

    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = friction;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;
    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );

    b3MassData wheelMassData = b3Body_GetMassData( wheelBody );
    if ( b3IsValidFloat( wheelMassData.mass ) == false || wheelMassData.mass <= 0.0f )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        result.set( "error", "donor wheel mass unavailable" );
        return result;
    }
    const float guideBodyMass = perGuideBodyMassRatio * wheelMassData.mass;

    b3BodyDef guideRootDef = b3DefaultBodyDef();
    guideRootDef.position = initialCenter;
    guideRootDef.rotation = targetRotation;
    b3BodyId guideRoot = b3CreateBody( worldId, &guideRootDef );

    b3BodyId headingSled = rq2c1CreateGuideBody(
        worldId, initialCenter, targetRotation, initialVelocity, guideBodyMass );
    b3BodyId verticalCarrier = rq2c1CreateGuideBody(
        worldId, initialCenter, targetRotation, initialVelocity, guideBodyMass );

    b3PrismaticJointDef headingDef = b3DefaultPrismaticJointDef();
    headingDef.base.bodyIdA = guideRoot;
    headingDef.base.bodyIdB = headingSled;
    headingDef.base.localFrameA = { b3Vec3_zero, b3Quat_identity };
    headingDef.base.localFrameB = { b3Vec3_zero, b3Quat_identity };
    headingDef.base.collideConnected = false;
    headingDef.enableSpring = false;
    headingDef.enableLimit = false;
    headingDef.enableMotor = false;
    b3JointId headingJoint = b3CreatePrismaticJoint( worldId, &headingDef );

    b3Quat verticalAxisFrame = b3ComputeQuatBetweenUnitVectors( b3Vec3_axisX, b3Vec3_axisY );
    b3PrismaticJointDef verticalDef = b3DefaultPrismaticJointDef();
    verticalDef.base.bodyIdA = headingSled;
    verticalDef.base.bodyIdB = verticalCarrier;
    verticalDef.base.localFrameA = { b3Vec3_zero, verticalAxisFrame };
    verticalDef.base.localFrameB = { b3Vec3_zero, verticalAxisFrame };
    verticalDef.base.collideConnected = false;
    verticalDef.enableSpring = false;
    verticalDef.enableLimit = false;
    verticalDef.enableMotor = false;
    b3JointId verticalJoint = b3CreatePrismaticJoint( worldId, &verticalDef );

    b3SphericalJointDef centerDef = b3DefaultSphericalJointDef();
    centerDef.base.bodyIdA = verticalCarrier;
    centerDef.base.bodyIdB = wheelBody;
    centerDef.base.localFrameA.p = b3Vec3_zero;
    centerDef.base.localFrameB.p = b3Vec3_zero;
    centerDef.base.collideConnected = false;
    centerDef.enableSpring = false;
    centerDef.enableConeLimit = false;
    centerDef.enableTwistLimit = false;
    b3JointId centerJoint = b3CreateSphericalJoint( worldId, &centerDef );

    // RQ2C2's only change from RQ2C1 physics.
    b3Joint_SetConstraintTuning( headingJoint, carrierConstraintHertz, carrierConstraintDampingRatio );
    b3Joint_SetConstraintTuning( verticalJoint, carrierConstraintHertz, carrierConstraintDampingRatio );
    b3Joint_SetConstraintTuning( centerJoint, carrierConstraintHertz, carrierConstraintDampingRatio );

    b3ParallelJointDef mountDef = b3DefaultParallelJointDef();
    mountDef.base.bodyIdA = verticalCarrier;
    mountDef.base.bodyIdB = wheelBody;
    mountDef.hertz = mountHertz;
    mountDef.dampingRatio = mountDampingRatio;
    mountDef.maxTorque = FLT_MAX;
    b3JointId mountJoint = b3CreateParallelJoint( worldId, &mountDef );

    if ( b3Shape_IsValid( groundShape ) == false || b3Shape_IsValid( wheelShape ) == false ||
         b3Joint_IsValid( headingJoint ) == false || b3Joint_IsValid( verticalJoint ) == false ||
         b3Joint_IsValid( centerJoint ) == false || b3Joint_IsValid( mountJoint ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        result.set( "error", "RQ2C2 carrier shape/joint composition invalid" );
        return result;
    }

    float headingTuningHertz = 0.0f;
    float headingTuningDamping = 0.0f;
    float verticalTuningHertz = 0.0f;
    float verticalTuningDamping = 0.0f;
    float centerTuningHertz = 0.0f;
    float centerTuningDamping = 0.0f;
    b3Joint_GetConstraintTuning( headingJoint, &headingTuningHertz, &headingTuningDamping );
    b3Joint_GetConstraintTuning( verticalJoint, &verticalTuningHertz, &verticalTuningDamping );
    b3Joint_GetConstraintTuning( centerJoint, &centerTuningHertz, &centerTuningDamping );

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
    float settledMaxAbsSlip = 0.0f;
    double settledAbsSlipSum = 0.0;
    float settledMaxAxisError = 0.0f;
    float settledMaxHeadingError = 0.0f;
    float settledMaxAbsCrossHeadingSpeed = 0.0f;
    float settledMaxAbsCrossTrack = 0.0f;
    float settledMaxCenterError = 0.0f;
    float settledMaxSledCross = 0.0f;
    float settledMaxCarrierCross = 0.0f;
    std::vector<uint32_t> previousFeatures;
    b3Pos settlePosition = b3Body_GetPosition( wheelBody );

    for ( int step = 0; step < stepCount; ++step )
    {
        b3World_Step( worldId, dt, subStepCount );
        Rh0ContactSample contact = rh0SampleContact( wheelShape );
        if ( contact.contactCount > 0 && firstContactStep < 0 ) firstContactStep = step;
        if ( contact.totalNormalImpulse > 1.0e-9f && firstImpulseStep < 0 ) firstImpulseStep = step;

        b3Pos p = b3Body_GetPosition( wheelBody );
        b3Pos sledP = b3Body_GetPosition( headingSled );
        b3Pos carrierP = b3Body_GetPosition( verticalCarrier );
        b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
        b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
        b3Quat q = b3Body_GetRotation( wheelBody );
        b3Vec3 actualAxle = b3RotateVector( q, b3Vec3_axisZ );
        float slip = rq2cDot( v, targetHeading ) + supportRadius * rq2cDot( w, targetAxle );
        float axisError = rq2cAngleBetween( actualAxle, targetAxle );
        float headingError = rq2cHorizontalHeadingError( v, targetHeading );
        float crossHeadingSpeed = rq2cDot( v, targetAxle );
        float centerError = b3Length( b3SubPos( p, carrierP ) );

        if ( step == settleStep )
        {
            previousFeatures = contact.features;
            settlePosition = p;
        }

        if ( step >= settleStep )
        {
            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, p.y );
            settledYMax = b3MaxFloat( settledYMax, p.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
            settledAbsSlipSum += fabsf( slip );
            settledMaxAxisError = b3MaxFloat( settledMaxAxisError, axisError );
            settledMaxHeadingError = b3MaxFloat( settledMaxHeadingError, headingError );
            settledMaxAbsCrossHeadingSpeed = b3MaxFloat( settledMaxAbsCrossHeadingSpeed, fabsf( crossHeadingSpeed ) );
            b3Vec3 displacement = b3SubPos( p, settlePosition );
            settledMaxAbsCrossTrack = b3MaxFloat( settledMaxAbsCrossTrack, fabsf( rq2cDot( displacement, targetAxle ) ) );
            settledMaxCenterError = b3MaxFloat( settledMaxCenterError, centerError );
            settledMaxSledCross = b3MaxFloat( settledMaxSledCross, fabsf( rq2cDot( b3SubPos( sledP, initialCenter ), targetAxle ) ) );
            settledMaxCarrierCross = b3MaxFloat( settledMaxCarrierCross, fabsf( rq2cDot( b3SubPos( carrierP, initialCenter ), targetAxle ) ) );

            if ( contact.contactCount == 0 ) settledContactDropouts += 1;
            if ( previousFeatures.empty() == false && contact.features != previousFeatures ) settledFeatureSetChanges += 1;
            settledMinPointCount = b3MinInt( settledMinPointCount, contact.pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, contact.pointCount );
            previousFeatures = contact.features;
        }
    }

    b3Pos finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    b3Quat finalRotation = b3Body_GetRotation( wheelBody );
    b3Vec3 finalAxle = b3RotateVector( finalRotation, b3Vec3_axisZ );
    float finalSlip = rq2cDot( finalVelocity, targetHeading ) + supportRadius * rq2cDot( finalAngular, targetAxle );
    float finalAxisError = rq2cAngleBetween( finalAxle, targetAxle );
    float finalHeadingError = rq2cHorizontalHeadingError( finalVelocity, targetHeading );

    result.set( "valid", true );
    result.set( "apparatus", "RQ2C2_RQ2C1_CHAIN_MAX_NATIVE_GENERIC_CONSTRAINT_HERTZ" );
    result.set( "yawDegrees", yawDegrees );
    result.set( "yawRadians", yawRadians );
    result.set( "wheelMass", wheelMassData.mass );
    result.set( "totalGuideMassRatio", totalGuideMassRatio );
    result.set( "perGuideBodyMassRatio", perGuideBodyMassRatio );
    result.set( "guideBodyMass", guideBodyMass );
    result.set( "mountHertz", mountHertz );
    result.set( "mountDampingRatio", mountDampingRatio );
    result.set( "carrierConstraintHertz", carrierConstraintHertz );
    result.set( "carrierConstraintDampingRatio", carrierConstraintDampingRatio );
    result.set( "headingTuningHertz", headingTuningHertz );
    result.set( "headingTuningDamping", headingTuningDamping );
    result.set( "verticalTuningHertz", verticalTuningHertz );
    result.set( "verticalTuningDamping", verticalTuningDamping );
    result.set( "centerTuningHertz", centerTuningHertz );
    result.set( "centerTuningDamping", centerTuningDamping );
    result.set( "supportRadius", supportRadius );
    result.set( "targetHeadingX", targetHeading.x );
    result.set( "targetHeadingZ", targetHeading.z );
    result.set( "targetAxleX", targetAxle.x );
    result.set( "targetAxleZ", targetAxle.z );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "settledSamples", settledSamples );
    result.set( "settledContactDropouts", settledContactDropouts );
    result.set( "settledFeatureSetChanges", settledFeatureSetChanges );
    result.set( "settledMinPointCount", settledMinPointCount == INT_MAX ? 0 : settledMinPointCount );
    result.set( "settledMaxPointCount", settledMaxPointCount );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMeanAbsSlip", settledSamples > 0 ? settledAbsSlipSum / settledSamples : NAN );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
    result.set( "settledMaxAxisError", settledMaxAxisError );
    result.set( "settledMaxHeadingError", settledMaxHeadingError );
    result.set( "settledMaxAbsCrossHeadingSpeed", settledMaxAbsCrossHeadingSpeed );
    result.set( "settledMaxAbsCrossTrack", settledMaxAbsCrossTrack );
    result.set( "settledMaxCenterError", settledMaxCenterError );
    result.set( "settledMaxSledCross", settledMaxSledCross );
    result.set( "settledMaxCarrierCross", settledMaxCarrierCross );
    result.set( "finalX", finalPosition.x );
    result.set( "finalY", finalPosition.y );
    result.set( "finalZ", finalPosition.z );
    result.set( "finalVx", finalVelocity.x );
    result.set( "finalVy", finalVelocity.y );
    result.set( "finalVz", finalVelocity.z );
    result.set( "finalOmegaX", finalAngular.x );
    result.set( "finalOmegaY", finalAngular.y );
    result.set( "finalOmegaZ", finalAngular.z );
    result.set( "finalSlip", finalSlip );
    result.set( "finalAxisError", finalAxisError );
    result.set( "finalHeadingError", finalHeadingError );

    b3DestroyWorld( worldId );
    return result;
}
