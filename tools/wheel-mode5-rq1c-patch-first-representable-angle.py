from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq1c-patch-first-representable-angle.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
old = '    const float roadAngleRadians = challengeRoad ? 20.0e-6f : 0.0f;\n'
new = '    const float roadAngleRadians = challengeRoad ? 30.0e-6f : 0.0f;\n'
if text.count(old) != 1:
    raise SystemExit(f'RQ1c angle anchor drifted: expected 1, got {text.count(old)}')
text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('RQ1C_FIRST_REPRESENTABLE_ANGLE_PATCH_OK')
