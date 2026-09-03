from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2o-patch-reverse-wheel-plane-points.py <wheel_shape.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static void b3CollideWheelAndPlane( b3LocalManifold* manifold, int capacity, const b3Wheel* wheel, b3Vec3 planeNormal,'
end_marker = '\n}\n\n// Contact against a segment with radius:'
start = text.find(start_marker)
end = text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2o could not isolate b3CollideWheelAndPlane')

body = text[start:end]
anchor = '\tmanifold->pointCount = pointCount;\n'
if body.count(anchor) != 1:
    raise SystemExit(f'E2a2o expected exactly one pointCount commit in b3CollideWheelAndPlane, found {body.count(anchor)}')

replacement = (
    '\t// E2a2o DIAGNOSTIC ONLY: reverse the two otherwise identical support points.\n'
    '\t// Geometry, separation and feature pairs are unchanged; only manifold order changes.\n'
    '\tif ( pointCount == 2 )\n'
    '\t{\n'
    '\t\tb3LocalManifoldPoint temp = manifold->points[0];\n'
    '\t\tmanifold->points[0] = manifold->points[1];\n'
    '\t\tmanifold->points[1] = temp;\n'
    '\t}\n\n'
    '\tmanifold->pointCount = pointCount;\n'
)
body = body.replace(anchor, replacement)
text = text[:start] + body + text[end:]
path.write_text(text, encoding='utf-8')
print('E2A2O_REVERSE_WHEEL_PLANE_POINTS_PATCH_OK')
