from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2q-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

include_anchor = '#include <algorithm>\n'
if text.count(include_anchor) != 1:
    raise SystemExit(f'E2a2q bindings expected exactly one algorithm include anchor, found {text.count(include_anchor)}')
externs = (
    include_anchor
    + '\nextern "C" void b3E2a2qResetPairSolveCounter( void );\n'
    + 'extern "C" int b3E2a2qGetPairSolveCounter( void );\n'
)
text = text.replace(include_anchor, externs, 1)

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2q bindings expected exactly one E2a2 base binding, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor
    + '\tfunction( "e2a2qResetPairSolveCounter", &b3E2a2qResetPairSolveCounter );\n'
    + '\tfunction( "e2a2qGetPairSolveCounter", &b3E2a2qGetPairSolveCounter );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2Q_BINDINGS_PATCH_OK')
