from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rh0/patch-rq-suite-adapter.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

include_line = '#include "wheel-mode5-rq-suite.hpp"\n'
if include_line in text:
    raise SystemExit('RH0 suite include already present')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
if text.count(namespace_end) != 1:
    raise SystemExit(f'RH0 namespace-end anchor drifted: expected 1, got {text.count(namespace_end)}')
text = text.replace(namespace_end, include_line + '\n' + namespace_end)

binding_anchor = '\tfunction( "e2aRunOuterP75GroundCarrier", &e2aRunOuterP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'RH0 E2a binding anchor drifted: expected 1, got {text.count(binding_anchor)}')

binding_line = '\tfunction( "rh0RunOuterP75CanonicalScenario", &rh0RunOuterP75CanonicalScenario );\n'
if binding_line in text:
    raise SystemExit('RH0 suite binding already present')
text = text.replace(binding_anchor, binding_anchor + binding_line)

path.write_text(text, encoding='utf-8')
print('RH0_RQ_SUITE_ADAPTER_OK')
