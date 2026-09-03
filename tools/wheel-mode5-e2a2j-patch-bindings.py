from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2j-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
end = text.find(namespace_end)
if end < 0:
    raise SystemExit('E2a2j could not locate namespace end')

helper = r'''

// E2a2j is intentionally read-only with respect to Box3D contact/solver semantics.
// It reconstructs the pinned contact solver separation equation externally from
// public manifold anchors and the body's observed end-of-step transform.
static val e2a2jProbeSphereSeparationDecomposition( float spinRadiansPerSecond, int spinAxis, int subStepCount )
{
    val result = val::object();
    if ( b3IsValidFloat( spinRadiansPerSecond ) == false || spinRadiansPerSecond < 0.0f ||
         spinAxis < 0 || spinAxis > 2 || subStepCount < 1 || subStepCount > 16 )
    {
        result.set( "valid", false );
        return result;
    }

    b3Wheel wheel = {};
    int rawCount = 0;
    int effectiveCount = 0;
    if ( e2a2MakeFlatCarrier( &wheel, &rawCount, &effectiveCount ) == false )
    {
        result.set( "valid", false );
        return result;
    }
    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );
    float supportRadius = -supportDown.y;

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
    groundShapeDef.baseMaterial.friction = 0.0f;
    groundShapeDef.baseMaterial.restitution = 0.0f;
    b3BoxHull groundHull = b3MakeBoxHull( 5.0f, 0.10f, 5.0f );
    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, &groundHull.base );

    b3BodyDef sphereBodyDef = b3DefaultBodyDef();
    sphereBodyDef.type = b3_dynamicBody;
    sphereBodyDef.position = e1Vec( 0.0f, supportRadius, 0.0f );
    sphereBodyDef.rotation = b3Quat_identity;
    if ( spinAxis == 0 )
    {
        sphereBodyDef.angularVelocity = e1Vec( spinRadiansPerSecond, 0.0f, 0.0f );
    }
    else if ( spinAxis == 1 )
    {
        sphereBodyDef.angularVelocity = e1Vec( 0.0f, spinRadiansPerSecond, 0.0f );
    }
    else
    {
        sphereBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );
    }
    sphereBodyDef.enableSleep = false;
    sphereBodyDef.allowFastRotation = true;
    b3BodyId sphereBody = b3CreateBody( worldId, &sphereBodyDef );

    b3ShapeDef sphereShapeDef = b3DefaultShapeDef();
    sphereShapeDef.baseMaterial.friction = 0.0f;
    sphereShapeDef.baseMaterial.restitution = 0.0f;
    sphereShapeDef.density = 1.0f;

    // Match the E2a2e-i sphere body's mass/inertia to the two-point P75 carrier.
    b3ShapeId referenceWheelShape = b3CreateWheelShape( sphereBody, &sphereShapeDef, &wheel );
    if ( b3Shape_IsValid( referenceWheelShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }
    b3MassData referenceMassData = b3Body_GetMassData( sphereBody );
    b3DestroyShape( referenceWheelShape, true );

    b3Sphere sphere = {};
    sphere.center = e1Vec( 0.0f, 0.0f, 0.0f );
    sphere.radius = supportRadius;
    b3ShapeId sphereShape = b3CreateSphereShape( sphereBody, &sphereShapeDef, &sphere );
    b3Body_SetMassData( sphereBody, referenceMassData );

    if ( b3Shape_IsValid( groundShape ) == false || b3Shape_IsValid( sphereShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }

    const float dt = 1.0f / 240.0f;
    b3Pos startPosition = b3Body_GetPosition( sphereBody );
    b3Quat startRotation = b3Body_GetRotation( sphereBody );
    b3World_Step( worldId, dt, subStepCount );
    b3Pos endPosition = b3Body_GetPosition( sphereBody );
    b3Quat endRotation = b3Body_GetRotation( sphereBody );

    int capacity = b3Shape_GetContactCapacity( sphereShape );
    std::vector<b3ContactData> contacts( capacity > 0 ? (size_t)capacity : 0 );
    int contactCount = capacity > 0 ? b3Shape_GetContactData( sphereShape, contacts.data(), capacity ) : 0;

    const b3ContactData* selectedContact = nullptr;
    const b3Manifold* selectedManifold = nullptr;
    const b3ManifoldPoint* selectedPoint = nullptr;
    bool sphereIsA = false;

    for ( int ci = 0; ci < contactCount && selectedPoint == nullptr; ++ci )
    {
        const b3ContactData& contact = contacts[ci];
        bool isA = B3_ID_EQUALS( contact.shapeIdA, sphereShape );
        bool isB = B3_ID_EQUALS( contact.shapeIdB, sphereShape );
        if ( isA == false && isB == false )
        {
            continue;
        }
        for ( int mi = 0; mi < contact.manifoldCount && selectedPoint == nullptr; ++mi )
        {
            const b3Manifold& manifold = contact.manifolds[mi];
            if ( manifold.pointCount > 0 )
            {
                selectedContact = &contact;
                selectedManifold = &manifold;
                selectedPoint = &manifold.points[0];
                sphereIsA = isA;
            }
        }
    }

    if ( selectedContact == nullptr || selectedManifold == nullptr || selectedPoint == nullptr )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        result.set( "contactCount", contactCount );
        return result;
    }

    b3Vec3 normal = selectedManifold->normal;
    b3Vec3 rA = selectedPoint->anchorA;
    b3Vec3 rB = selectedPoint->anchorB;
    b3Vec3 sphereAnchor = sphereIsA ? rA : rB;

    // This probe starts at identity, so the observed end world rotation is the
    // same delta rotation that the solver applies to the stored world-space anchor.
    float startQuatError = b3AbsFloat( startRotation.v.x ) + b3AbsFloat( startRotation.v.y ) +
                           b3AbsFloat( startRotation.v.z ) + b3AbsFloat( startRotation.s - 1.0f );
    b3Vec3 rotatedSphereAnchor = b3RotateVector( endRotation, sphereAnchor );
    b3Vec3 anchorRotationDelta = b3Sub( rotatedSphereAnchor, sphereAnchor );

    b3Vec3 dynamicDelta = e1Vec(
        (float)( endPosition.x - startPosition.x ),
        (float)( endPosition.y - startPosition.y ),
        (float)( endPosition.z - startPosition.z ) );

    // Solver convention is B minus A. The ground body is static, so only the
    // sphere contributes to dp and anchor rotation; signs depend on whether the
    // sphere is contact shape A or B.
    float translationContribution = sphereIsA ? -b3Dot( dynamicDelta, normal ) : b3Dot( dynamicDelta, normal );
    float rotationalContribution = sphereIsA ? -b3Dot( anchorRotationDelta, normal ) : b3Dot( anchorRotationDelta, normal );
    float preparedAnchorProjection = b3Dot( b3Sub( rB, rA ), normal );
    float baseSeparation = selectedPoint->separation - preparedAnchorProjection;
    float reconstructedEndSeparation = selectedPoint->separation + translationContribution + rotationalContribution;

    float qScalar = b3ClampFloat( b3AbsFloat( endRotation.s ), 0.0f, 1.0f );
    float observedAngle = 2.0f * acosf( qScalar );
    float analyticRotationalContribution = spinAxis == 1 ? 0.0f : supportRadius * ( 1.0f - cosf( observedAngle ) );

    b3Vec3 finalLinearVelocity = b3Body_GetLinearVelocity( sphereBody );
    b3Vec3 finalAngularVelocity = b3Body_GetAngularVelocity( sphereBody );

    result.set( "valid", true );
    result.set( "spinRadiansPerSecond", spinRadiansPerSecond );
    result.set( "spinAxis", spinAxis );
    result.set( "subStepCount", subStepCount );
    result.set( "dt", dt );
    result.set( "supportRadius", supportRadius );
    result.set( "sphereIsA", sphereIsA );
    result.set( "contactCount", contactCount );
    result.set( "manifoldCount", selectedContact->manifoldCount );
    result.set( "pointCount", selectedManifold->pointCount );
    result.set( "startQuatIdentityError", startQuatError );
    result.set( "normalX", normal.x );
    result.set( "normalY", normal.y );
    result.set( "normalZ", normal.z );
    result.set( "sphereAnchorX", sphereAnchor.x );
    result.set( "sphereAnchorY", sphereAnchor.y );
    result.set( "sphereAnchorZ", sphereAnchor.z );
    result.set( "sphereAnchorLength", b3Length( sphereAnchor ) );
    result.set( "preparedSeparation", selectedPoint->separation );
    result.set( "preparedAnchorProjection", preparedAnchorProjection );
    result.set( "baseSeparation", baseSeparation );
    result.set( "translationContribution", translationContribution );
    result.set( "rotationalContribution", rotationalContribution );
    result.set( "reconstructedEndSeparation", reconstructedEndSeparation );
    result.set( "observedRotationAngleRad", observedAngle );
    result.set( "observedRotationAngleDeg", observedAngle * B3_RAD_TO_DEG );
    result.set( "analyticRotationalContribution", analyticRotationalContribution );
    result.set( "rotationMinusAnalytic", rotationalContribution - analyticRotationalContribution );
    result.set( "normalImpulse", selectedPoint->normalImpulse );
    result.set( "totalNormalImpulse", selectedPoint->totalNormalImpulse );
    result.set( "startY", (float)startPosition.y );
    result.set( "endY", (float)endPosition.y );
    result.set( "deltaY", (float)( endPosition.y - startPosition.y ) );
    result.set( "finalVy", finalLinearVelocity.y );
    result.set( "finalAngularX", finalAngularVelocity.x );
    result.set( "finalAngularY", finalAngularVelocity.y );
    result.set( "finalAngularZ", finalAngularVelocity.z );

    b3DestroyWorld( worldId );
    return result;
}
'''

text = text[:end] + helper + '\n' + text[end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2j binding anchor drifted; apply after E2a2 patch')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2jProbeSphereSeparationDecomposition", &e2a2jProbeSphereSeparationDecomposition );\n')

path.write_text(text, encoding='utf-8')
print('E2A2J_BINDINGS_PATCH_OK')
