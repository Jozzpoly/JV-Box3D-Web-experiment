from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c3/patch-rq2c3-suite-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

rq2c_include = '#include "wheel-mode5-rq2c-orientation-suite.hpp"\n'
rq2c3_include = '#include "wheel-mode5-rq2c3-direct-guide-suite.hpp"\n'
if text.count(rq2c_include) != 1:
    raise SystemExit(f'RQ2C3 requires exactly one RQ2C base include, got {text.count(rq2c_include)}')
if rq2c3_include in text:
    raise SystemExit('RQ2C3 suite include already present')
text = text.replace(rq2c_include, rq2c_include + rq2c3_include)

rq2c_binding = '\tfunction( "rq2cRunOuterP75Orientation", &rq2cRunOuterP75Orientation );\n'
rq2c3_binding = '\tfunction( "rq2c3RunOuterP75DirectGuide", &rq2c3RunOuterP75DirectGuide );\n'
if text.count(rq2c_binding) != 1:
    raise SystemExit(f'RQ2C3 requires exactly one RQ2C base binding, got {text.count(rq2c_binding)}')
if rq2c3_binding in text:
    raise SystemExit('RQ2C3 binding already present')
text = text.replace(rq2c_binding, rq2c_binding + rq2c3_binding)

if text.count(rq2c3_include) != 1:
    raise SystemExit(f'RQ2C3 include composition drifted: expected exact line once, got {text.count(rq2c3_include)}')
if text.count(rq2c3_binding) != 1:
    raise SystemExit(f'RQ2C3 binding composition drifted: expected exact line once, got {text.count(rq2c3_binding)}')

path.write_text(text, encoding='utf-8')
print('RQ2C3_DIRECT_GUIDE_SUITE_ADAPTER_OK')
