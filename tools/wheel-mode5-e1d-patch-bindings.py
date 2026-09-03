from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e1d-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
helper = r'''

// E1d is a read-only diagnostic seam layered after the E1 probe patch. It
// exposes every accepted triangle manifold at one pose so JS can test whether
// the single winning witness is hopping inside an otherwise stable support
// patch. It does not change E1 selection, collision acceptance, or solver state.
static val e1InspectAnnularP75BoxPatch( float hx, float hy, float hz,
                                       float px, float py, float pz,
                                       float qx, float qy, float qz, float qw,
                                       float acceptanceSkin )
{
    val result = val::object();
    if ( !( hx > 0.0f && hy > 0.0f && hz > 0.0f ) || acceptanceSkin < 0.0f )
    {
        result.set( "valid", false );
        return result;
    }

    float qLength = sqrtf( qx * qx + qy * qy + qz * qz + qw * qw );
    if ( qLength <= FLT_EPSILON )
    {
        result.set( "valid", false );
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
        return result;
    }

    const b3Vec3 boxCenterWheel = e1Vec( px, py, pz );
    const float boxRadius = sqrtf( hx * hx + hy * hy + hz * hz );
    const float broadMargin = 0.025f;
    int broadCandidates = 0;
    int rawCandidates = 0;
    int acceptedCandidates = 0;
    float bestSeparation = -FLT_MAX;
    int bestAcceptedIndex = -1;
    val accepted = val::array();

    const std::vector<E1AnnularTriangle>& triangles = e1AnnularTriangles();
    for ( int triangleIndex = 0; triangleIndex < (int)triangles.size(); ++triangleIndex )
    {
        const E1AnnularTriangle& triangle = triangles[triangleIndex];
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
        if ( candidateSeparation > acceptanceSkin )
        {
            continue;
        }

        int acceptedIndex = acceptedCandidates++;
        b3Vec3 normalWheel = b3RotateVector( rotation, manifold.normal );
        b3Vec3 witnessWheel = b3TransformPoint( boxTransform, manifold.points[candidatePointIndex].point );

        val item = val::object();
        item.set( "acceptedIndex", acceptedIndex );
        item.set( "triangleIndex", triangleIndex );
        item.set( "surface", triangle.surface );
        item.set( "station", triangle.station );
        item.set( "sector", triangle.sector );
        item.set( "candidateSeparation", candidateSeparation );
        item.set( "pointCount", manifold.pointCount );
        item.set( "chosenPointIndex", candidatePointIndex );
        item.set( "normalX", normalWheel.x );
        item.set( "normalY", normalWheel.y );
        item.set( "normalZ", normalWheel.z );
        item.set( "witnessX", witnessWheel.x );
        item.set( "witnessY", witnessWheel.y );
        item.set( "witnessZ", witnessWheel.z );

        val manifoldPoints = val::array();
        for ( int i = 0; i < manifold.pointCount; ++i )
        {
            b3Vec3 pointWheel = b3TransformPoint( boxTransform, manifold.points[i].point );
            val point = val::object();
            point.set( "index", i );
            point.set( "x", pointWheel.x );
            point.set( "y", pointWheel.y );
            point.set( "z", pointWheel.z );
            point.set( "separation", manifold.points[i].separation );
            manifoldPoints.set( i, point );
        }
        item.set( "points", manifoldPoints );
        accepted.set( acceptedIndex, item );

        // Match E1's strict comparison and triangle iteration order exactly.
        if ( candidateSeparation > bestSeparation )
        {
            bestSeparation = candidateSeparation;
            bestAcceptedIndex = acceptedIndex;
        }
    }

    b3DestroyHull( hull );
    result.set( "valid", true );
    result.set( "meshTriangleCount", (int)triangles.size() );
    result.set( "broadCandidates", broadCandidates );
    result.set( "rawCandidates", rawCandidates );
    result.set( "acceptedCandidates", acceptedCandidates );
    result.set( "acceptanceSkin", acceptanceSkin );
    result.set( "bestAcceptedIndex", bestAcceptedIndex );
    result.set( "bestSeparation", acceptedCandidates > 0 ? bestSeparation : NAN );
    result.set( "candidates", accepted );
    return result;
}
'''
if text.count(namespace_end) != 1:
    raise SystemExit('E1d namespace-end anchor drifted; apply after E1 patch')
text = text.replace(namespace_end, helper + '\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n')

binding_anchor = '\tfunction( "e1ProbeAnnularP75Box", &e1ProbeAnnularP75Box );\n'
binding_replacement = binding_anchor + '\tfunction( "e1InspectAnnularP75BoxPatch", &e1InspectAnnularP75BoxPatch );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E1d binding anchor drifted; apply after E1 patch')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E1D_BINDINGS_PATCH_OK')
