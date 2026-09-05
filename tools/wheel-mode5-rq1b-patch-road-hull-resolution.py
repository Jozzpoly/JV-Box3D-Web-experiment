from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq1b-patch-road-hull-resolution.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// RQ1b: read-only representational-resolution probe for the generic road hull.
// This never creates a world or shape and therefore cannot measure wheel physics.
static val rq1bInspectRoadHullResolution( float angleMicroradians )
{
    val result = val::object();
    const float angle = angleMicroradians * 1.0e-6f;
    const float roadHalfLength = 10.0f;
    const float roadHalfWidth = 2.0f;
    const float roadBottom = -0.20f;
    const float rightTop = -tanf( angle ) * roadHalfLength;

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

    b3HullData* hull = b3CreateHull( roadPoints, 10, 16 );
    if ( hull == NULL )
    {
        result.set( "valid", false );
        return result;
    }

    const b3Plane* planes = b3GetHullPlanes( hull );
    int topPlaneCount = 0;
    float nxMin = FLT_MAX;
    float nxMax = -FLT_MAX;
    float nyMin = FLT_MAX;
    float nyMax = -FLT_MAX;
    for ( int i = 0; i < hull->faceCount; ++i )
    {
        const b3Plane& plane = planes[i];
        if ( plane.normal.y > 0.9f )
        {
            topPlaneCount += 1;
            nxMin = b3MinFloat( nxMin, plane.normal.x );
            nxMax = b3MaxFloat( nxMax, plane.normal.x );
            nyMin = b3MinFloat( nyMin, plane.normal.y );
            nyMax = b3MaxFloat( nyMax, plane.normal.y );
        }
    }

    result.set( "valid", true );
    result.set( "requestedAngleMicroradians", angleMicroradians );
    result.set( "requestedAngleRadians", angle );
    result.set( "rightTopDropMicrometers", -rightTop * 1.0e6f );
    result.set( "faceCount", hull->faceCount );
    result.set( "vertexCount", hull->vertexCount );
    result.set( "topPlaneCount", topPlaneCount );
    result.set( "topPlaneNormalXMin", topPlaneCount > 0 ? nxMin : NAN );
    result.set( "topPlaneNormalXMax", topPlaneCount > 0 ? nxMax : NAN );
    result.set( "topPlaneNormalYMin", topPlaneCount > 0 ? nyMin : NAN );
    result.set( "topPlaneNormalYMax", topPlaneCount > 0 ? nyMax : NAN );
    result.set( "topPlaneNormalXSpan", topPlaneCount > 0 ? nxMax - nxMin : NAN );

    b3DestroyHull( hull );
    return result;
}
'''
if text.count(namespace_end) != 1:
    raise SystemExit('RQ1b namespace-end anchor drifted')
text = text.replace(namespace_end, helper + '\n' + namespace_end)

binding_anchor = '\tfunction( "rq1RunOuterP75RoadNormalTransition", &rq1RunOuterP75RoadNormalTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ1b binding anchor drifted; apply after RQ1')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "rq1bInspectRoadHullResolution", &rq1bInspectRoadHullResolution );\n')

path.write_text(text, encoding='utf-8')
print('RQ1B_ROAD_HULL_RESOLUTION_PATCH_OK')
