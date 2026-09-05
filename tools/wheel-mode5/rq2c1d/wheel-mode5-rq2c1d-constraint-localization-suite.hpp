// Wheel-mode5 RQ2C1D diagnostic-only constraint localization.
//
// This intentionally duplicates the executed RQ2C1 0-degree physics apparatus
// without changing its masses, hertz, geometry, time step, contact setup or gates.
// The only additions are observational body/joint telemetry calls after each step.
// No value in this file is a new pass/fail threshold.

static val rq2c1dRunOuterP75ConstraintLocalization0()
{
    val result = val::object();

    const float yawDegrees = 0.0f;
    const float speedMetersPerSecond = 1.0f;
    const float friction = 0.9f;
    const float gravityMagnitude = 9.81f;
    const float dt = 1.0f / 240.0f;
    const int subStepCount = 4;
    const int stepCount = 960;
    const int settleStep = 240;
    const float mountHertz = 120.0f;
    const float mountDampingRatio = 1.0f;
    const float totalGuideMassRatio = 0.01f;
    const float perGuideBodyMassRatio = 0.005f;
    const float yawRadians = 0.0f;

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
        worldId,
        initialCenter,
        targetRotation,
        initialVelocity,
        guideBodyMass );
    b3BodyId verticalCarrier = rq2c1CreateGuideBody(
        worldId,
        initialCenter,
        targetRotation,
        initialVelocity,
        guideBodyMass );

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
        result.set( "error", "RQ2C1D carrier shape/joint composition invalid" );
        return result;
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
    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsSlip = 0.0f;
    float settledMaxAxisError = 0.0f;
    float settledMaxHeadingError = 0.0f;
    float settledMaxAbsCrossHeadingSpeed = 0.0f;
    float settledMaxAbsCrossTrack = 0.0f;

    float maxAbsSledCrossFromRoot = 0.0f;
    float maxAbsSledVerticalFromRoot = 0.0f;
    float maxAbsCarrierCrossFromRoot = 0.0f;
    float maxAbsCarrierVsSledHeading = 0.0f;
    float maxAbsCarrierVsSledCross = 0.0f;
    float maxAbsWheelVsCarrierHeading = 0.0f;
    float maxAbsWheelVsCarrierVertical = 0.0f;
    float maxAbsWheelVsCarrierCross = 0.0f;
    float maxCenterLinearSeparation = 0.0f;

    float maxHeadingForceMagnitude = 0.0f;
    float maxHeadingForceH = 0.0f;
    float maxHeadingForceY = 0.0f;
    float maxHeadingForceA = 0.0f;
    float maxVerticalForceMagnitude = 0.0f;
    float maxVerticalForceH = 0.0f;
    float maxVerticalForceY = 0.0f;
    float maxVerticalForceA = 0.0f;
    float maxCenterForceMagnitude = 0.0f;
    float maxCenterForceH = 0.0f;
    float maxCenterForceY = 0.0f;
    float maxCenterForceA = 0.0f;
    float maxMountTorqueMagnitude = 0.0f;
    float maxMountTorqueH = 0.0f;
    float maxMountTorqueY = 0.0f;
    float maxMountTorqueA = 0.0f;

    float settledHeadingTranslationMin = FLT_MAX;
    float settledHeadingTranslationMax = -FLT_MAX;
    float settledVerticalTranslationMin = FLT_MAX;
    float settledVerticalTranslationMax = -FLT_MAX;
    std::vector<uint32_t> previousFeatures;
    b3Pos settlePosition = b3Body_GetPosition( wheelBody );

    for ( int step = 0; step < stepCount; ++step )
    {
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

        b3Pos wheelP = b3Body_GetPosition( wheelBody );
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
        float headingTranslation = b3PrismaticJoint_GetTranslation( headingJoint );
        float verticalTranslation = b3PrismaticJoint_GetTranslation( verticalJoint );

        if ( step == settleStep )
        {
            previousFeatures = contact.features;
            settlePosition = wheelP;
        }

        if ( step >= settleStep )
        {
            settledSamples += 1;
            settledYMin = b3MinFloat( settledYMin, wheelP.y );
            settledYMax = b3MaxFloat( settledYMax, wheelP.y );
            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
            settledMaxAxisError = b3MaxFloat( settledMaxAxisError, axisError );
            settledMaxHeadingError = b3MaxFloat( settledMaxHeadingError, headingError );
            settledMaxAbsCrossHeadingSpeed = b3MaxFloat( settledMaxAbsCrossHeadingSpeed, fabsf( crossHeadingSpeed ) );
            b3Vec3 wheelDisplacement = b3SubPos( wheelP, settlePosition );
            settledMaxAbsCrossTrack = b3MaxFloat( settledMaxAbsCrossTrack, fabsf( rq2cDot( wheelDisplacement, targetAxle ) ) );

            b3Vec3 sledFromRoot = b3SubPos( sledP, initialCenter );
            b3Vec3 carrierFromRoot = b3SubPos( carrierP, initialCenter );
            b3Vec3 carrierVsSled = b3SubPos( carrierP, sledP );
            b3Vec3 wheelVsCarrier = b3SubPos( wheelP, carrierP );

            maxAbsSledCrossFromRoot = b3MaxFloat( maxAbsSledCrossFromRoot, fabsf( rq2cDot( sledFromRoot, targetAxle ) ) );
            maxAbsSledVerticalFromRoot = b3MaxFloat( maxAbsSledVerticalFromRoot, fabsf( sledFromRoot.y ) );
            maxAbsCarrierCrossFromRoot = b3MaxFloat( maxAbsCarrierCrossFromRoot, fabsf( rq2cDot( carrierFromRoot, targetAxle ) ) );
            maxAbsCarrierVsSledHeading = b3MaxFloat( maxAbsCarrierVsSledHeading, fabsf( rq2cDot( carrierVsSled, targetHeading ) ) );
            maxAbsCarrierVsSledCross = b3MaxFloat( maxAbsCarrierVsSledCross, fabsf( rq2cDot( carrierVsSled, targetAxle ) ) );
            maxAbsWheelVsCarrierHeading = b3MaxFloat( maxAbsWheelVsCarrierHeading, fabsf( rq2cDot( wheelVsCarrier, targetHeading ) ) );
            maxAbsWheelVsCarrierVertical = b3MaxFloat( maxAbsWheelVsCarrierVertical, fabsf( wheelVsCarrier.y ) );
            maxAbsWheelVsCarrierCross = b3MaxFloat( maxAbsWheelVsCarrierCross, fabsf( rq2cDot( wheelVsCarrier, targetAxle ) ) );
            maxCenterLinearSeparation = b3MaxFloat( maxCenterLinearSeparation, fabsf( b3Joint_GetLinearSeparation( centerJoint ) ) );

            b3Vec3 headingForce = b3Joint_GetConstraintForce( headingJoint );
            b3Vec3 verticalForce = b3Joint_GetConstraintForce( verticalJoint );
            b3Vec3 centerForce = b3Joint_GetConstraintForce( centerJoint );
            b3Vec3 mountTorque = b3Joint_GetConstraintTorque( mountJoint );

            maxHeadingForceMagnitude = b3MaxFloat( maxHeadingForceMagnitude, b3Length( headingForce ) );
            maxHeadingForceH = b3MaxFloat( maxHeadingForceH, fabsf( rq2cDot( headingForce, targetHeading ) ) );
            maxHeadingForceY = b3MaxFloat( maxHeadingForceY, fabsf( headingForce.y ) );
            maxHeadingForceA = b3MaxFloat( maxHeadingForceA, fabsf( rq2cDot( headingForce, targetAxle ) ) );

            maxVerticalForceMagnitude = b3MaxFloat( maxVerticalForceMagnitude, b3Length( verticalForce ) );
            maxVerticalForceH = b3MaxFloat( maxVerticalForceH, fabsf( rq2cDot( verticalForce, targetHeading ) ) );
            maxVerticalForceY = b3MaxFloat( maxVerticalForceY, fabsf( verticalForce.y ) );
            maxVerticalForceA = b3MaxFloat( maxVerticalForceA, fabsf( rq2cDot( verticalForce, targetAxle ) ) );

            maxCenterForceMagnitude = b3MaxFloat( maxCenterForceMagnitude, b3Length( centerForce ) );
            maxCenterForceH = b3MaxFloat( maxCenterForceH, fabsf( rq2cDot( centerForce, targetHeading ) ) );
            maxCenterForceY = b3MaxFloat( maxCenterForceY, fabsf( centerForce.y ) );
            maxCenterForceA = b3MaxFloat( maxCenterForceA, fabsf( rq2cDot( centerForce, targetAxle ) ) );

            maxMountTorqueMagnitude = b3MaxFloat( maxMountTorqueMagnitude, b3Length( mountTorque ) );
            maxMountTorqueH = b3MaxFloat( maxMountTorqueH, fabsf( rq2cDot( mountTorque, targetHeading ) ) );
            maxMountTorqueY = b3MaxFloat( maxMountTorqueY, fabsf( mountTorque.y ) );
            maxMountTorqueA = b3MaxFloat( maxMountTorqueA, fabsf( rq2cDot( mountTorque, targetAxle ) ) );

            settledHeadingTranslationMin = b3MinFloat( settledHeadingTranslationMin, headingTranslation );
            settledHeadingTranslationMax = b3MaxFloat( settledHeadingTranslationMax, headingTranslation );
            settledVerticalTranslationMin = b3MinFloat( settledVerticalTranslationMin, verticalTranslation );
            settledVerticalTranslationMax = b3MaxFloat( settledVerticalTranslationMax, verticalTranslation );

            if ( contact.contactCount == 0 )
            {
                settledContactDropouts += 1;
            }
            if ( previousFeatures.empty() == false && contact.features != previousFeatures )
            {
                settledFeatureSetChanges += 1;
            }
            settledMinPointCount = b3MinInt( settledMinPointCount, contact.pointCount );
            settledMaxPointCount = b3MaxInt( settledMaxPointCount, contact.pointCount );
            previousFeatures = contact.features;
        }
    }

    result.set( "valid", true );
    result.set( "apparatus", "RQ2C1D_SAME_RQ2C1_PHYSICS_DIAGNOSTIC_ONLY" );
    result.set( "yawDegrees", yawDegrees );
    result.set( "wheelMass", wheelMassData.mass );
    result.set( "totalGuideMassRatio", totalGuideMassRatio );
    result.set( "perGuideBodyMassRatio", perGuideBodyMassRatio );
    result.set( "guideBodyMass", guideBodyMass );
    result.set( "mountHertz", mountHertz );
    result.set( "mountDampingRatio", mountDampingRatio );
    result.set( "supportRadius", supportRadius );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "settledSamples", settledSamples );
    result.set( "settledContactDropouts", settledContactDropouts );
    result.set( "settledFeatureSetChanges", settledFeatureSetChanges );
    result.set( "settledMinPointCount", settledMinPointCount == INT_MAX ? 0 : settledMinPointCount );
    result.set( "settledMaxPointCount", settledMaxPointCount );
    result.set( "settledYRange", settledSamples > 0 ? settledYMax - settledYMin : NAN );
    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
    result.set( "settledMaxAxisError", settledMaxAxisError );
    result.set( "settledMaxHeadingError", settledMaxHeadingError );
    result.set( "settledMaxAbsCrossHeadingSpeed", settledMaxAbsCrossHeadingSpeed );
    result.set( "settledMaxAbsCrossTrack", settledMaxAbsCrossTrack );
    result.set( "settledHeadingTranslationMin", settledHeadingTranslationMin );
    result.set( "settledHeadingTranslationMax", settledHeadingTranslationMax );
    result.set( "settledVerticalTranslationMin", settledVerticalTranslationMin );
    result.set( "settledVerticalTranslationMax", settledVerticalTranslationMax );

    result.set( "maxAbsSledCrossFromRoot", maxAbsSledCrossFromRoot );
    result.set( "maxAbsSledVerticalFromRoot", maxAbsSledVerticalFromRoot );
    result.set( "maxAbsCarrierCrossFromRoot", maxAbsCarrierCrossFromRoot );
    result.set( "maxAbsCarrierVsSledHeading", maxAbsCarrierVsSledHeading );
    result.set( "maxAbsCarrierVsSledCross", maxAbsCarrierVsSledCross );
    result.set( "maxAbsWheelVsCarrierHeading", maxAbsWheelVsCarrierHeading );
    result.set( "maxAbsWheelVsCarrierVertical", maxAbsWheelVsCarrierVertical );
    result.set( "maxAbsWheelVsCarrierCross", maxAbsWheelVsCarrierCross );
    result.set( "maxCenterLinearSeparation", maxCenterLinearSeparation );

    result.set( "maxHeadingForceMagnitude", maxHeadingForceMagnitude );
    result.set( "maxHeadingForceH", maxHeadingForceH );
    result.set( "maxHeadingForceY", maxHeadingForceY );
    result.set( "maxHeadingForceA", maxHeadingForceA );
    result.set( "maxVerticalForceMagnitude", maxVerticalForceMagnitude );
    result.set( "maxVerticalForceH", maxVerticalForceH );
    result.set( "maxVerticalForceY", maxVerticalForceY );
    result.set( "maxVerticalForceA", maxVerticalForceA );
    result.set( "maxCenterForceMagnitude", maxCenterForceMagnitude );
    result.set( "maxCenterForceH", maxCenterForceH );
    result.set( "maxCenterForceY", maxCenterForceY );
    result.set( "maxCenterForceA", maxCenterForceA );
    result.set( "maxMountTorqueMagnitude", maxMountTorqueMagnitude );
    result.set( "maxMountTorqueH", maxMountTorqueH );
    result.set( "maxMountTorqueY", maxMountTorqueY );
    result.set( "maxMountTorqueA", maxMountTorqueA );

    b3DestroyWorld( worldId );
    return result;
}
