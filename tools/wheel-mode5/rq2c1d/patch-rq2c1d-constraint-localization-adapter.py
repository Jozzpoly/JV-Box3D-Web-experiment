from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c1d/patch-rq2c1d-constraint-localization-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

base_include = '#include "wheel-mode5-rq2c1-local-carrier-suite.hpp"\n'
diag_include = '#include "wheel-mode5-rq2c1d-constraint-localization-suite.hpp"\n'
if text.count(base_include) != 1:
    raise SystemExit(f'RQ2C1D requires exactly one RQ2C1 include, got {text.count(base_include)}')
if diag_include in text:
    raise SystemExit('RQ2C1D diagnostic include already present')
text = text.replace(base_include, base_include + diag_include)

base_binding = '\tfunction( "rq2c1RunOuterP75LocalCarrier", &rq2c1RunOuterP75LocalCarrier );\n'
diag_binding = '\tfunction( "rq2c1dRunOuterP75ConstraintLocalization0", &rq2c1dRunOuterP75ConstraintLocalization0 );\n'
if text.count(base_binding) != 1:
    raise SystemExit(f'RQ2C1D requires exactly one RQ2C1 binding, got {text.count(base_binding)}')
if diag_binding in text:
    raise SystemExit('RQ2C1D diagnostic binding already present')
text = text.replace(base_binding, base_binding + diag_binding)

if text.count(diag_include) != 1:
    raise SystemExit(f'RQ2C1D include composition drifted: expected exact line once, got {text.count(diag_include)}')
if text.count(diag_binding) != 1:
    raise SystemExit(f'RQ2C1D binding composition drifted: expected exact line once, got {text.count(diag_binding)}')

path.write_text(text, encoding='utf-8')
print('RQ2C1D_CONSTRAINT_LOCALIZATION_ADAPTER_OK')
