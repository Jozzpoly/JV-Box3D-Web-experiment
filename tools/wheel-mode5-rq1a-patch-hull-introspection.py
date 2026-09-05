from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq1a-patch-hull-introspection.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

anchor = '''    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, roadHull );\n    b3DestroyHull( roadHull );\n'''
replacement = '''    // RQ1a read-only geometry provenance. Inspect the generic hull before the\n    // shape deep-copies it. This does not alter the hull or simulation.\n    const b3Plane* roadPlanes = b3GetHullPlanes( roadHull );\n    int roadHullFaceCount = roadHull->faceCount;\n    int roadTopPlaneCount = 0;\n    float roadTopPlaneNormalXMin = FLT_MAX;\n    float roadTopPlaneNormalXMax = -FLT_MAX;\n    float roadTopPlaneNormalYMin = FLT_MAX;\n    float roadTopPlaneNormalYMax = -FLT_MAX;\n    for ( int fi = 0; fi < roadHullFaceCount; ++fi )\n    {\n        const b3Plane& plane = roadPlanes[fi];\n        if ( plane.normal.y > 0.9f )\n        {\n            roadTopPlaneCount += 1;\n            roadTopPlaneNormalXMin = b3MinFloat( roadTopPlaneNormalXMin, plane.normal.x );\n            roadTopPlaneNormalXMax = b3MaxFloat( roadTopPlaneNormalXMax, plane.normal.x );\n            roadTopPlaneNormalYMin = b3MinFloat( roadTopPlaneNormalYMin, plane.normal.y );\n            roadTopPlaneNormalYMax = b3MaxFloat( roadTopPlaneNormalYMax, plane.normal.y );\n        }\n    }\n\n    b3ShapeId groundShape = b3CreateHullShape( groundBody, &groundShapeDef, roadHull );\n    b3DestroyHull( roadHull );\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'RQ1a hull anchor drifted: expected 1, got {text.count(anchor)}')
text = text.replace(anchor, replacement)

result_anchor = '''    result.set( "roadDropAt10m", -rightTop );\n    result.set( "supportRadius", supportRadius );\n'''
result_replacement = '''    result.set( "roadDropAt10m", -rightTop );\n    result.set( "roadHullFaceCount", roadHullFaceCount );\n    result.set( "roadTopPlaneCount", roadTopPlaneCount );\n    result.set( "roadTopPlaneNormalXMin", roadTopPlaneCount > 0 ? roadTopPlaneNormalXMin : NAN );\n    result.set( "roadTopPlaneNormalXMax", roadTopPlaneCount > 0 ? roadTopPlaneNormalXMax : NAN );\n    result.set( "roadTopPlaneNormalYMin", roadTopPlaneCount > 0 ? roadTopPlaneNormalYMin : NAN );\n    result.set( "roadTopPlaneNormalYMax", roadTopPlaneCount > 0 ? roadTopPlaneNormalYMax : NAN );\n    result.set( "supportRadius", supportRadius );\n'''
if text.count(result_anchor) != 1:
    raise SystemExit(f'RQ1a result anchor drifted: expected 1, got {text.count(result_anchor)}')
text = text.replace(result_anchor, result_replacement)

path.write_text(text, encoding='utf-8')
print('RQ1A_HULL_INTROSPECTION_PATCH_OK')
