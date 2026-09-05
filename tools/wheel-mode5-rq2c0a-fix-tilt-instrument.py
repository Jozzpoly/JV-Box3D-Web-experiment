from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq2c0a-fix-tilt-instrument.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# The first RQ2c0a run used acos(axis.z). In float precision, axis.z can round
# to exactly 1 for a real but small tilt, falsely reporting 0 rad. Replace only
# that diagnostic computation with a small-angle-stable atan2 formulation.
# No body, shape, joint, solver, contact or stepping parameter changes.
old = '''            float axisCosine = b3MaxFloat( -1.0f, b3MinFloat( 1.0f, axleAxis.z ) );
            float axisTilt = acosf( axisCosine );
'''
new = '''            float axisRadial = sqrtf( axleAxis.x * axleAxis.x + axleAxis.y * axleAxis.y );
            float axisTilt = atan2f( axisRadial, axleAxis.z );
'''

if text.count(old) != 1:
    raise SystemExit(f'RQ2c0a tilt instrument anchor drifted: expected 1, got {text.count(old)}')
text = text.replace(old, new)

path.write_text(text, encoding='utf-8')
print('RQ2C0A_TILT_INSTRUMENT_FIX_OK')
