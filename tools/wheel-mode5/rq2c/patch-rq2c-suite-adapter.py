from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c/patch-rq2c-suite-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

rh0_include = '#include "wheel-mode5-rq-suite.hpp"\n'
rq2c_include = '#include "wheel-mode5-rq2c-orientation-suite.hpp"\n'
if text.count(rh0_include) != 1:
    raise SystemExit(f'RQ2C requires exactly one RH0 suite include, got {text.count(rh0_include)}')
if rq2c_include in text:
    raise SystemExit('RQ2C suite include already present')
text = text.replace(rh0_include, rh0_include + rq2c_include)

rh0_binding = '\tfunction( "rh0RunOuterP75CanonicalScenario", &rh0RunOuterP75CanonicalScenario );\n'
rq2c_binding = '\tfunction( "rq2cRunOuterP75Orientation", &rq2cRunOuterP75Orientation );\n'
if text.count(rh0_binding) != 1:
    raise SystemExit(f'RQ2C requires exactly one RH0 suite binding, got {text.count(rh0_binding)}')
if rq2c_binding in text:
    raise SystemExit('RQ2C suite binding already present')
text = text.replace(rh0_binding, rh0_binding + rq2c_binding)

if text.count(rq2c_include) != 1:
    raise SystemExit(f'RQ2C include composition drifted: expected exact line once, got {text.count(rq2c_include)}')
if text.count(rq2c_binding) != 1:
    raise SystemExit(f'RQ2C binding composition drifted: expected exact line once, got {text.count(rq2c_binding)}')

path.write_text(text, encoding='utf-8')
print('RQ2C_ORIENTATION_SUITE_ADAPTER_OK')
