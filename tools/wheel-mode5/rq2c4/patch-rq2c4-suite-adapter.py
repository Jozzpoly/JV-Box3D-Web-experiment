from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c4/patch-rq2c4-suite-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

base_include = '#include "wheel-mode5-rq2c3-direct-guide-suite.hpp"\n'
new_include = '#include "wheel-mode5-rq2c4-hard-relax-suite.hpp"\n'
if text.count(base_include) != 1:
    raise SystemExit(f'RQ2C4 requires exactly one RQ2C3 suite include, got {text.count(base_include)}')
if new_include in text:
    raise SystemExit('RQ2C4 suite include already present')
text = text.replace(base_include, base_include + new_include)

base_binding = '\tfunction( "rq2c3RunOuterP75DirectGuide", &rq2c3RunOuterP75DirectGuide );\n'
new_binding = '\tfunction( "rq2c4RunOuterP75HardRelaxGuide", &rq2c4RunOuterP75HardRelaxGuide );\n'
if text.count(base_binding) != 1:
    raise SystemExit(f'RQ2C4 requires exactly one RQ2C3 binding, got {text.count(base_binding)}')
if new_binding in text:
    raise SystemExit('RQ2C4 binding already present')
text = text.replace(base_binding, base_binding + new_binding)

path.write_text(text, encoding='utf-8')
print('RQ2C4_HARD_RELAX_SUITE_ADAPTER_OK')
