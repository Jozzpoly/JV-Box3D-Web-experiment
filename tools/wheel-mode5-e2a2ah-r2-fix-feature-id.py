from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ah-r2-fix-feature-id.py <physics_world.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
replacements = [
    ('activePoint->id', 'activePoint->featureId', 2),
    ('e2a2ahShadowManifold.points[j].id', 'e2a2ahShadowManifold.points[j].featureId', 2),
]
for old, new, expected in replacements:
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'E2a2ah-r2 expected {expected} occurrences of {old!r}, found {count}')
    text = text.replace(old, new)

path.write_text(text, encoding='utf-8')
print('E2A2AH_R2_FEATURE_ID_FIX_OK')
