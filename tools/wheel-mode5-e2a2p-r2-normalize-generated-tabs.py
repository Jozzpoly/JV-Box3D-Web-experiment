from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2p-r2-normalize-generated-tabs.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = r'\t\t// E2a2p DIAGNOSTIC ONLY: simultaneous/Jacobi solve for the first two normal points.'
end_marker = '\n\t\t// No friction when applying bias\n'
start = text.find(start_marker)
end = text.find(end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2p-r2 could not isolate generated simultaneous block')
if text.find(start_marker, start + 1) >= 0:
    raise SystemExit('E2a2p-r2 found ambiguous generated simultaneous block')

block = text[start:end]
if r'\t' not in block:
    raise SystemExit('E2a2p-r2 expected literal tab escapes in generated block')
normalized = block.replace(r'\t', '\t')
if r'\t' in normalized:
    raise SystemExit('E2a2p-r2 literal tab escapes remain after normalization')
if not normalized.startswith('\t\t// E2a2p DIAGNOSTIC ONLY:'):
    raise SystemExit('E2a2p-r2 normalized block marker mismatch')

text = text[:start] + normalized + text[end:]
path.write_text(text, encoding='utf-8')
print('E2A2P_R2_GENERATED_TABS_NORMALIZED_OK')
