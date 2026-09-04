from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq0-planar-axle-patch.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

anchor = '''    wheelBodyDef.enableSleep = false;\n    wheelBodyDef.allowFastRotation = true;\n    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );\n'''
replacement = '''    wheelBodyDef.enableSleep = false;\n    wheelBodyDef.allowFastRotation = true;\n    // RQ0 apparatus correction: emulate an ideal planar axle guide without\n    // teleporting the body or changing contact/recycler semantics. The wheel\n    // remains dynamic in longitudinal X, vertical Y and spin around axle Z.\n    wheelBodyDef.motionLocks.linearZ = true;\n    wheelBodyDef.motionLocks.angularX = true;\n    wheelBodyDef.motionLocks.angularY = true;\n    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );\n'''
if text.count(anchor) != 1:
    raise SystemExit(f'RQ0 planar axle anchor drifted: expected 1, got {text.count(anchor)}')
text = text.replace(anchor, replacement)

scope = 'RQ0 fixed flat road; donor dynamic outer P75 wheel profile; no bore/inner/side validation'
new_scope = 'RQ0 fixed flat road; donor dynamic outer P75 wheel profile; planar axle locks; no bore/inner/side validation'
if text.count(scope) != 1:
    raise SystemExit(f'RQ0 scope anchor drifted: expected 1, got {text.count(scope)}')
text = text.replace(scope, new_scope)

path.write_text(text, encoding='utf-8')
print('RQ0_PLANAR_AXLE_PATCH_OK')
