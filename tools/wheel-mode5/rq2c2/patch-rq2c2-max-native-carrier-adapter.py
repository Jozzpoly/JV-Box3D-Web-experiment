from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c2/patch-rq2c2-max-native-carrier-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

base_include = '#include "wheel-mode5-rq2c1-local-carrier-suite.hpp"\n'
new_include = '#include "wheel-mode5-rq2c2-max-native-carrier-suite.hpp"\n'
if text.count(base_include) != 1:
    raise SystemExit(f'RQ2C2 requires exactly one RQ2C1 include, got {text.count(base_include)}')
if new_include in text:
    raise SystemExit('RQ2C2 include already present')
text = text.replace(base_include, base_include + new_include)

base_binding = '\tfunction( "rq2c1RunOuterP75LocalCarrier", &rq2c1RunOuterP75LocalCarrier );\n'
new_binding = '\tfunction( "rq2c2RunOuterP75MaxNativeCarrier", &rq2c2RunOuterP75MaxNativeCarrier );\n'
if text.count(base_binding) != 1:
    raise SystemExit(f'RQ2C2 requires exactly one RQ2C1 binding, got {text.count(base_binding)}')
if new_binding in text:
    raise SystemExit('RQ2C2 binding already present')
text = text.replace(base_binding, base_binding + new_binding)

if text.count(new_include) != 1:
    raise SystemExit(f'RQ2C2 include composition drifted: expected once, got {text.count(new_include)}')
if text.count(new_binding) != 1:
    raise SystemExit(f'RQ2C2 binding composition drifted: expected once, got {text.count(new_binding)}')

path.write_text(text, encoding='utf-8')
print('RQ2C2_MAX_NATIVE_CARRIER_ADAPTER_OK')
