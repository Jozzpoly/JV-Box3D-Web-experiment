// Wheel-mode5 RQ2C orientation/mount qualification suite.
//
// This is normal versioned C++ source layered after the frozen RH0 canonical
// suite. It deliberately does not modify the RH0 scenarios. The bounded
// experiment is limited to 0 / +3.5 / -3.5 degree steering-yaw equivalence
// with fully free translation and the existing 120 Hz local-axis ParallelJoint.

static b3Vec3 rq2cScale( float s, b3Vec3 v )
{
    return e1Vec( s * v.x, s * v.y, s * v.z );
}

static b3Vec3 rq2cAdd( b3Vec3 a, b3Vec3 b )
{
    return e1Vec( a.x + b.x, a.y + b.y, a.z + b.z );
}

static b3Vec3 rq2cSub( b3Vec3 a, b3Vec3 b )
{
    return e1Vec( a.x - b.x, a.y - b.y, a.z - b.z );
}

static float rq2cDot( b3Vec3 a, b3Vec3 b )
{
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

static b3Vec3 rq2cCross( b3Vec3 a, b3Vec3 b )
{
    return e1Vec(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x );
}

static float rq2cLength( b3Vec3 v )
{
    return sqrtf( rq2cDot( v, v ) );
}

static float rq2cAngleBetween( b3Vec3 a, b3Vec3 b )
{
    b3Vec3 c = rq2cCross( a, b );
    return b3Atan2( rq2cLength( c ), rq2cDot( a, b ) );
}

static float rq2cHorizontalHeadingError( b3Vec3 velocity, b3Vec3 heading )
{
    float horizontalSpeed = sqrtf( velocity.x * velocity.x + velocity.z * velocity.z );
    if ( horizontalSpeed <= 1.0e-8f )
    {
        return B3_PI;
    }

    float vx = velocity.x / horizontalSpeed;
    float vz = velocity.z / horizontalSpeed;
    float crossY = heading.x * vz - heading.z * vx;
    float dot = heading.x * vx + heading.z * vz;
    return b3Atan2( fabsf( crossY ), dot );
}

static bool rq2cSupportedYawDegrees( float yawDegrees )
{
    const float tolerance = 1.0e-4f;
    return fabsf( yawDegrees ) <= tolerance ||
           fabsf( yawDegrees - 3.5f ) <= tolerance ||
           fabsf( yawDegrees + 3.5f ) <= tolerance;
}

static val rq2cRunOuterP75Orientation( float yawDegrees )
{
    val result = val::object();
    if ( b3IsValidFloat( yawDegrees ) == false || rq2cSupportedYawDegrees( yawDegrees ) == false )
    {
        result.set( "valid", false );
        result.set( "error", "RQ2C supports only 0 / +3.5 / -3.5 degree yaw" );
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
    b3BodyDef wheelBodyDef = b3DefaultBodyDef();
    wheelBodyDef.type = b3_dynamicBody;
    wheelBodyDef.position = e1Vec( initialHorizontal.x, supportRadius + 0.001f, initialHorizontal.z );
    wheelBodyDef.rotation = targetRotation;
    wheelBodyDef.linearVelocity = rq2cScale( speedMetersPerSecond, targetHeading );
    wheelBodyDef.angularVelocity = rq2cScale( initialOmegaMagnitude, targetAxle );
    wheelBodyDef.enableSleep = false;
    wheelBodyDef.allowFastRotation = true;
    // Intentionally no world-axis linear or angular motion locks.
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );

    b3BodyDef referenceBodyDef = b3DefaultBodyDef();
    referenceBodyDef.position = wheelBodyDef.position;
    referenceBodyDef.rotation = targetRotation;
    b3BodyId referenceBody = b3CreateBody( worldId, &referenceBodyDef );

    b3ParallelJointDef mountDef = b3DefaultParallelJointDef();
    mountDef.base.bodyIdA = referenceBody;
    mountDef.base.bodyIdB = wheelBody;
    mountDef.hertz = mountHertz;
    mountDef.dampingRatio = mountDampingRatio;
    mountDef.maxTorque = FLT_MAX;
    b3JointId mountJoint = b3CreateParallelJoint( worldId, &mountDef );

    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = friction;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;
    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );

    if ( b3Joint_IsValid( mountJoint ) == false || b3Shape_IsValid( groundShape ) == false ||
         b3Shape_IsValid( wheelShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        result.set( "error", "RQ2C mount, ground or wheel shape invalid" );
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
    double settledAbsSlipSum = 0.0;
    float settledMaxAxisError = 0.0f;
    float settledMaxHeadingError = 0.0f;
    float settledMaxAbsCrossHeadingSpeed = 0.0f;
    float settledMaxAbsCrossTrack = 0.0f;
    std::vector<uint32_t> previousFeatures;
    b3Vec3 settlePosition = b3Body_GetPosition( wheelBody );

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

        b3Vec3 p = b3Body_GetPosition( wheelBody );
        b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
        b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
        b3Quat q = b3Body_GetRotation( wheelBody );
        b3Vec3 actualAxle = b3RotateVector( q, b3Vec3_axisZ );
        float slip = rq2cDot( v, targetHeading ) + supportRadius * rq2cDot( w, targetAxle );
        float axisError = rq2cAngleBetween( actualAxle, targetAxle );
        float headingError = rq2cHorizontalHeadingError( v, targetHeading );
        float crossHeadingSpeed = rq2cDot( v, targetAxle );

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
            b3Vec3 displacement = rq2cSub( p, settlePosition );
            settledMaxAbsCrossTrack = b3MaxFloat(
                settledMaxAbsCrossTrack,
                fabsf( rq2cDot( displacement, targetAxle ) ) );

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

    b3Vec3 finalPosition = b3Body_GetPosition( wheelBody );
    b3Vec3 finalVelocity = b3Body_GetLinearVelocity( wheelBody );
    b3Vec3 finalAngular = b3Body_GetAngularVelocity( wheelBody );
    b3Quat finalRotation = b3Body_GetRotation( wheelBody );
    b3Vec3 finalAxle = b3RotateVector( finalRotation, b3Vec3_axisZ );
    float finalSlip = rq2cDot( finalVelocity, targetHeading ) + supportRadius * rq2cDot( finalAngular, targetAxle );
    float finalAxisError = rq2cAngleBetween( finalAxle, targetAxle );
    float finalHeadingError = rq2cHorizontalHeadingError( finalVelocity, targetHeading );

    result.set( "valid", true );
    result.set( "yawDegrees", yawDegrees );
    result.set( "yawRadians", yawRadians );
    result.set( "speedMetersPerSecond", speedMetersPerSecond );
    result.set( "friction", friction );
    result.set( "supportRadius", supportRadius );
    result.set( "mountHertz", mountHertz );
    result.set( "mountDampingRatio", mountDampingRatio );
    result.set( "firstContactStep", firstContactStep );
    result.set( "firstImpulseStep", firstImpulseStep );
    result.set( "targetHeadingX", targetHeading.x );
    result.set( "targetHeadingZ", targetHeading.z );
    result.set( "targetAxleX", targetAxle.x );
    result.set( "targetAxleZ", targetAxle.z );
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
