from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e1-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

include_anchor = '#include <vector>\n'
include_replacement = '''#include <vector>\n#include <array>\n#include <cfloat>\n\n#include "e1_annular_profile.h"\n'''
if text.count(include_anchor) != 1:
    raise SystemExit('E1 include anchor drifted')
text = text.replace(include_anchor, include_replacement)

using_anchor = 'using namespace emscripten;\n'
forward = '''using namespace emscripten;\n\n// Diagnostic E1 seam. This native function is internal to Box3D and is linked\n// into the same final wasm module. E1 deliberately reuses the engine's existing\n// triangle-vs-hull manifold builder without registering thousands of shapes.\nextern "C" void b3CollideHullAndTriangle( b3LocalManifold* manifold, int capacity, const b3HullData* hullA,\n\tb3Vec3 v1, b3Vec3 v2, b3Vec3 v3, int triangleFlags, b3SATCache* cache );\n'''
if text.count(using_anchor) != 1:
    raise SystemExit('E1 forward declaration anchor drifted')
text = text.replace(using_anchor, forward)

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

struct E1AnnularTriangle
{
    b3Vec3 v1, v2, v3;
    b3Vec3 center;
    float boundRadius;
    int surface;
    int station;
    int sector;
};

enum E1AnnularSurface
{
    e1_outerSurface = 0,
    e1_innerSurface = 1,
    e1_axialMinSurface = 2,
    e1_axialMaxSurface = 3,
};

static b3Vec3 e1Vec( float x, float y, float z )
{
    return (b3Vec3){ x, y, z };
}

static b3Vec3 e1WheelFramePoint( float axial, float radius, float angle )
{
    // Profile local frame is (radial X, axle Y, radial Z). M6 rotates +Y onto
    // world +Z with +90 degrees around X, so [x,y,z] -> [x,-z,y].
    float x = radius * cosf( angle );
    float z = radius * sinf( angle );
    return e1Vec( x, -z, axial );
}

static void e1PushTriangle( std::vector<E1AnnularTriangle>& out, b3Vec3 a, b3Vec3 b, b3Vec3 c,
                            int surface, int station, int sector )
{
    b3Vec3 center = b3MulSV( 1.0f / 3.0f, b3Add( a, b3Add( b, c ) ) );
    float r1 = b3Length( b3Sub( a, center ) );
    float r2 = b3Length( b3Sub( b, center ) );
    float r3 = b3Length( b3Sub( c, center ) );
    out.push_back( E1AnnularTriangle{
        a, b, c, center, b3MaxFloat( r1, b3MaxFloat( r2, r3 ) ), surface, station, sector
    } );
}

static const std::vector<E1AnnularTriangle>& e1AnnularTriangles()
{
    static const std::vector<E1AnnularTriangle> triangles = [] {
        std::vector<E1AnnularTriangle> out;
        const int segments = E1_ANNULAR_ANGULAR_SEGMENTS;
        out.reserve( 2 * 2 * ( E1_ANNULAR_STATION_COUNT - 1 ) * segments + 4 * segments );
        for ( int station = 0; station + 1 < E1_ANNULAR_STATION_COUNT; ++station )
        {
            float axialA = E1_ANNULAR_AXIAL[station];
            float axialB = E1_ANNULAR_AXIAL[station + 1];
            for ( int sector = 0; sector < segments; ++sector )
            {
                float angle0 = 2.0f * B3_PI * (float)sector / (float)segments;
                float angle1 = 2.0f * B3_PI * (float)( sector + 1 ) / (float)segments;

                b3Vec3 oa0 = e1WheelFramePoint( axialA, E1_ANNULAR_OUTER_P75[station], angle0 );
                b3Vec3 oa1 = e1WheelFramePoint( axialA, E1_ANNULAR_OUTER_P75[station], angle1 );
                b3Vec3 ob0 = e1WheelFramePoint( axialB, E1_ANNULAR_OUTER_P75[station + 1], angle0 );
                b3Vec3 ob1 = e1WheelFramePoint( axialB, E1_ANNULAR_OUTER_P75[station + 1], angle1 );
                // Outward radial winding.
                e1PushTriangle( out, oa0, ob0, ob1, e1_outerSurface, station, sector );
                e1PushTriangle( out, oa0, ob1, oa1, e1_outerSurface, station, sector );

                b3Vec3 ia0 = e1WheelFramePoint( axialA, E1_ANNULAR_INNER[station], angle0 );
                b3Vec3 ia1 = e1WheelFramePoint( axialA, E1_ANNULAR_INNER[station], angle1 );
                b3Vec3 ib0 = e1WheelFramePoint( axialB, E1_ANNULAR_INNER[station + 1], angle0 );
                b3Vec3 ib1 = e1WheelFramePoint( axialB, E1_ANNULAR_INNER[station + 1], angle1 );
                // Reverse the radial winding: the outward normal of the tire solid
                // points into the bore on the inner surface.
                e1PushTriangle( out, ia1, ib1, ib0, e1_innerSurface, station, sector );
                e1PushTriangle( out, ia1, ib0, ia0, e1_innerSurface, station, sector );
            }
        }

        // Close the two axial ends with annuli, not discs. The positive end is
        // deliberately wound opposite the negative end so both normals point
        // out of the tire solid.
        for ( int end = 0; end < 2; ++end )
        {
            int station = end == 0 ? 0 : E1_ANNULAR_STATION_COUNT - 1;
            int surface = end == 0 ? e1_axialMinSurface : e1_axialMaxSurface;
            for ( int sector = 0; sector < segments; ++sector )
            {
                float angle0 = 2.0f * B3_PI * (float)sector / (float)segments;
                float angle1 = 2.0f * B3_PI * (float)( sector + 1 ) / (float)segments;
                b3Vec3 i0 = e1WheelFramePoint( E1_ANNULAR_AXIAL[station], E1_ANNULAR_INNER[station], angle0 );
                b3Vec3 i1 = e1WheelFramePoint( E1_ANNULAR_AXIAL[station], E1_ANNULAR_INNER[station], angle1 );
                b3Vec3 o0 = e1WheelFramePoint( E1_ANNULAR_AXIAL[station], E1_ANNULAR_OUTER_P75[station], angle0 );
                b3Vec3 o1 = e1WheelFramePoint( E1_ANNULAR_AXIAL[station], E1_ANNULAR_OUTER_P75[station], angle1 );
                if ( end == 0 )
                {
                    e1PushTriangle( out, i0, o0, o1, surface, station, sector );
                    e1PushTriangle( out, i0, o1, i1, surface, station, sector );
                }
                else
                {
                    e1PushTriangle( out, i0, o1, o0, surface, station, sector );
                    e1PushTriangle( out, i0, i1, o1, surface, station, sector );
                }
            }
        }
        return out;
    }();
    return triangles;
}

static val e1ProbeAnnularP75Box( float hx, float hy, float hz,
                                 float px, float py, float pz,
                                 float qx, float qy, float qz, float qw,
                                 float acceptanceSkin )
{
    val result = val::object();
    if ( !( hx > 0.0f && hy > 0.0f && hz > 0.0f ) || acceptanceSkin < 0.0f )
    {
        result.set( "valid", false );
        result.set( "hit", false );
        return result;
    }

    float qLength = sqrtf( qx * qx + qy * qy + qz * qz + qw * qw );
    if ( qLength <= FLT_EPSILON )
    {
        result.set( "valid", false );
        result.set( "hit", false );
        return result;
    }
    b3Quat rotation = { qx / qLength, qy / qLength, qz / qLength, qw / qLength };
    b3Transform boxTransform = { e1Vec( px, py, pz ), rotation };

    b3Vec3 boxPoints[8];
    int pointIndex = 0;
    for ( int sx = -1; sx <= 1; sx += 2 )
    {
        for ( int sy = -1; sy <= 1; sy += 2 )
        {
            for ( int sz = -1; sz <= 1; sz += 2 )
            {
                boxPoints[pointIndex++] = e1Vec( sx * hx, sy * hy, sz * hz );
            }
        }
    }
    b3HullData* hull = b3CreateHull( boxPoints, 8, 8 );
    if ( hull == nullptr )
    {
        result.set( "valid", false );
        result.set( "hit", false );
        return result;
    }

    const b3Vec3 boxCenterWheel = e1Vec( px, py, pz );
    const float boxRadius = sqrtf( hx * hx + hy * hy + hz * hz );
    const float broadMargin = 0.025f; // donor speculative envelope + 5 mm guard
    int broadCandidates = 0;
    int rawCandidates = 0;
    int acceptedCandidates = 0;
    float rawClosestAbs = FLT_MAX;
    float rawClosestSeparation = FLT_MAX;
    float bestSeparation = -FLT_MAX;
    b3Vec3 bestNormalBox = b3Vec3_zero;
    b3Vec3 bestPointBox = b3Vec3_zero;
    int bestSurface = -1;
    int bestStation = -1;
    int bestSector = -1;

    for ( const E1AnnularTriangle& triangle : e1AnnularTriangles() )
    {
        float centerDistance = b3Length( b3Sub( triangle.center, boxCenterWheel ) );
        if ( centerDistance > boxRadius + triangle.boundRadius + broadMargin )
        {
            continue;
        }
        broadCandidates += 1;

        b3Vec3 v1 = b3InvTransformPoint( boxTransform, triangle.v1 );
        b3Vec3 v2 = b3InvTransformPoint( boxTransform, triangle.v2 );
        b3Vec3 v3 = b3InvTransformPoint( boxTransform, triangle.v3 );
        b3LocalManifoldPoint points[4] = {};
        b3LocalManifold manifold = {};
        manifold.points = points;
        b3SATCache cache = {};
        b3CollideHullAndTriangle( &manifold, 4, hull, v1, v2, v3, 0, &cache );
        if ( manifold.pointCount <= 0 )
        {
            continue;
        }
        rawCandidates += 1;

        float candidateSeparation = FLT_MAX;
        int candidatePointIndex = 0;
        for ( int i = 0; i < manifold.pointCount; ++i )
        {
            if ( manifold.points[i].separation < candidateSeparation )
            {
                candidateSeparation = manifold.points[i].separation;
                candidatePointIndex = i;
            }
        }
        float absSeparation = fabsf( candidateSeparation );
        if ( absSeparation < rawClosestAbs )
        {
            rawClosestAbs = absSeparation;
            rawClosestSeparation = candidateSeparation;
        }
        if ( candidateSeparation > acceptanceSkin )
        {
            continue;
        }
        acceptedCandidates += 1;

        // For a closed non-convex surface choose the accepted boundary patch
        // closest to zero (largest signed separation). The solver will receive
        // one manifold, not one constraint per sampled patch.
        if ( candidateSeparation > bestSeparation )
        {
            bestSeparation = candidateSeparation;
            bestNormalBox = manifold.normal;
            bestPointBox = manifold.points[candidatePointIndex].point;
            bestSurface = triangle.surface;
            bestStation = triangle.station;
            bestSector = triangle.sector;
        }
    }

    b3DestroyHull( hull );
    bool hit = acceptedCandidates > 0;
    result.set( "valid", true );
    result.set( "hit", hit );
    result.set( "meshTriangleCount", (int)e1AnnularTriangles().size() );
    result.set( "broadCandidates", broadCandidates );
    result.set( "rawCandidates", rawCandidates );
    result.set( "acceptedCandidates", acceptedCandidates );
    result.set( "acceptanceSkin", acceptanceSkin );
    result.set( "rawClosestSeparation", rawCandidates > 0 ? rawClosestSeparation : NAN );
    if ( hit )
    {
        b3Vec3 normalWheel = b3RotateVector( rotation, bestNormalBox );
        b3Vec3 pointWheel = b3TransformPoint( boxTransform, bestPointBox );
        result.set( "separation", bestSeparation );
        result.set( "normalX", normalWheel.x );
        result.set( "normalY", normalWheel.y );
        result.set( "normalZ", normalWheel.z );
        result.set( "pointX", pointWheel.x );
        result.set( "pointY", pointWheel.y );
        result.set( "pointZ", pointWheel.z );
        result.set( "surface", bestSurface );
        result.set( "station", bestStation );
        result.set( "sector", bestSector );
    }
    return result;
}
'''
replacement = helper + '\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
if text.count(namespace_end) != 1:
    raise SystemExit('E1 namespace-end anchor drifted')
text = text.replace(namespace_end, replacement)

binding_anchor = 'EMSCRIPTEN_BINDINGS( box3d )\n{\n'
binding_replacement = '''EMSCRIPTEN_BINDINGS( box3d )\n{\n\tfunction( "e1ProbeAnnularP75Box", &e1ProbeAnnularP75Box );\n'''
if text.count(binding_anchor) != 1:
    raise SystemExit('E1 binding registration anchor drifted')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E1_BINDINGS_PATCH_OK')
