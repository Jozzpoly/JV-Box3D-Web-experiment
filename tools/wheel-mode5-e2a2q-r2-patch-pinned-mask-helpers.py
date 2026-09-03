from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2q-r2-patch-pinned-mask-helpers.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

block_start_marker = '            // E2a2q DIAGNOSTIC ONLY: coupled 2x2 normal mini-LCP.\n'
block_end_marker = '\n\t\t\tcp0->normalImpulses = newImpulse0;\n'
start = text.find(block_start_marker)
end = text.find(block_end_marker, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2q-r2 could not isolate coupled block')
block = text[start:end]

if 'b3AndW' not in block or 'b3AnyTrueW' not in block:
    raise SystemExit('E2a2q-r2 expected unadapted mask calls in coupled block')
block = block.replace('b3AndW', 'e2a2qAndW')
block = block.replace('b3AnyTrueW', 'e2a2qAnyTrueW')
if 'b3AndW' in block or 'b3AnyTrueW' in block:
    raise SystemExit('E2a2q-r2 unsupported mask calls remain')
text = text[:start] + block + text[end:]

solve_anchor = 'void b3SolveContacts_Convex( b3SolverBlock block, b3StepContext* context, bool useBias )\n'
if text.count(solve_anchor) != 1:
    raise SystemExit(f'E2a2q-r2 expected exactly one convex solve anchor, found {text.count(solve_anchor)}')
helpers = '''// E2a2q DIAGNOSTIC ONLY: pinned 8441b4a SIMD has OR/Blend/AllZero but no public AND/AnyTrue helpers.
// Comparison masks are all-bits/zero, so Blend(0, b, a) is lane-wise logical AND.
static inline b3FloatW e2a2qAndW( b3FloatW a, b3FloatW b )
{
    return b3BlendW( b3ZeroW(), b, a );
}

static inline bool e2a2qAnyTrueW( b3FloatW a )
{
    return b3AllZeroW( a ) == false;
}

'''
text = text.replace(solve_anchor, helpers + solve_anchor, 1)

path.write_text(text, encoding='utf-8')
print('E2A2Q_R2_PINNED_MASK_HELPERS_PATCH_OK')
