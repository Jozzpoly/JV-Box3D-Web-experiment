from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c/patch-rq2c1-local-carrier-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

base_include = '#include "wheel-mode5-rq2c-orientation-suite.hpp"\n'
carrier_include = '#include "wheel-mode5-rq2c1-local-carrier-suite.hpp"\n'
if text.count(base_include) != 1:
    raise SystemExit(f'RQ2C1 requires exactly one RQ2C base include, got {text.count(base_include)}')
if carrier_include in text:
    raise SystemExit('RQ2C1 carrier include already present')
text = text.replace(base_include, base_include + carrier_include)

base_binding = '\tfunction( "rq2cRunOuterP75Orientation", &rq2cRunOuterP75Orientation );\n'
carrier_binding = '\tfunction( "rq2c1RunOuterP75LocalCarrier", &rq2c1RunOuterP75LocalCarrier );\n'
if text.count(base_binding) != 1:
    raise SystemExit(f'RQ2C1 requires exactly one RQ2C base binding, got {text.count(base_binding)}')
if carrier_binding in text:
    raise SystemExit('RQ2C1 carrier binding already present')
text = text.replace(base_binding, base_binding + carrier_binding)

if text.count(carrier_include) != 1:
    raise SystemExit(f'RQ2C1 include composition drifted: expected exact line once, got {text.count(carrier_include)}')
if text.count(carrier_binding) != 1:
    raise SystemExit(f'RQ2C1 binding composition drifted: expected exact line once, got {text.count(carrier_binding)}')

path.write_text(text, encoding='utf-8')
print('RQ2C1_LOCAL_CARRIER_ADAPTER_OK')
