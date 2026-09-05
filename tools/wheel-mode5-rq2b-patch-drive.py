from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq2b-patch-drive.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# RQ2b deliberately clones the already-qualified RQ2a C++ apparatus after the
# RQ2a patch has been composed. The only mechanical change is torque direction:
# RQ2a applies +Z against the initial negative spin (braking), while RQ2b applies
# -Z with the initial negative spin (drive traction). Keeping the same helper
# body makes geometry, timing, contact telemetry and axle provenance identical.
comment_marker = '// RQ2a representative braking demand.'
function_signature = 'static val rq2aRunOuterP75Braking( float brakeFraction )'

if text.count(comment_marker) != 1 or text.count(function_signature) != 1:
    raise SystemExit('RQ2b requires exactly one composed RQ2a helper')

block_start = text.index(comment_marker)
function_start = text.index(function_signature, block_start)
brace_start = text.index('{', function_start)

depth = 0
function_end = None
for i in range(brace_start, len(text)):
    ch = text[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            function_end = i + 1
            break

if function_end is None:
    raise SystemExit('RQ2b could not find the end of the RQ2a helper')

source = text[block_start:function_end]
clone = source
clone = clone.replace('rq2aRunOuterP75Braking', 'rq2bRunOuterP75Drive')
clone = clone.replace('RQ2a', 'RQ2b').replace('rq2a', 'rq2b')
clone = clone.replace('braking', 'drive traction').replace('Braking', 'Drive')
clone = clone.replace('Brake', 'Drive').replace('brake', 'drive')

positive_torque = 'b3Body_ApplyTorque( wheelBody, e1Vec( 0.0f, 0.0f, driveTorque ), true );'
negative_torque = 'b3Body_ApplyTorque( wheelBody, e1Vec( 0.0f, 0.0f, -driveTorque ), true );'
if clone.count(positive_torque) != 1:
    raise SystemExit('RQ2b drive torque anchor drifted')
clone = clone.replace(positive_torque, negative_torque)

old_comment = '// Initial omegaZ is negative, so +Z torque is a drive traction torque.'
new_comment = '// Initial omegaZ is negative, so -Z torque increases negative spin and is a drive torque.'
if clone.count(old_comment) != 1:
    raise SystemExit('RQ2b drive torque comment anchor drifted')
clone = clone.replace(old_comment, new_comment)

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
if text.count(namespace_end) != 1:
    raise SystemExit('RQ2b namespace-end anchor drifted')
text = text.replace(namespace_end, clone + '\n\n' + namespace_end)

binding_anchor = '\tfunction( "rq2aRunOuterP75Braking", &rq2aRunOuterP75Braking );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ2b RQ2a binding anchor drifted')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "rq2bRunOuterP75Drive", &rq2bRunOuterP75Drive );\n',
)

path.write_text(text, encoding='utf-8')
print('RQ2B_DRIVE_PATCH_OK')
