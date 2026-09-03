from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2k-patch-counterfactual-solver.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
old = 'b3Vec3 ds = b3Add( dp, b3Sub( b3RotateVector( dqB, rB ), b3RotateVector( dqA, rA ) ) );'
new = (
    '// E2a2k COUNTERFACTUAL DIAGNOSTIC ONLY: hold manifold anchors fixed in world-space\n'
    '\t\t\t\t// for separation prediction. This intentionally removes all rotational-anchor\n'
    '\t\t\t\t// contribution and is NOT a proposed generic solver fix. Velocity and impulse\n'
    '\t\t\t\t// application below continue to use the original contact anchors and angular velocity.\n'
    '\t\t\t\tb3Vec3 ds = b3Add( dp, b3Sub( rB, rA ) );'
)
count = text.count(old)
if count != 1:
    raise SystemExit(f'E2a2k expected exactly one pinned separation expression, found {count}')
text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('E2A2K_COUNTERFACTUAL_SOLVER_PATCH_OK')
