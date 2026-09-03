from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2k-r2-patch-counterfactual-convex-solver.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
old = 'b3Vec3W ds = b3AddVW( dp, b3SubVW( rsB, rsA ) );'
new = (
    '// E2a2k-r2 COUNTERFACTUAL DIAGNOSTIC ONLY: hold wide convex manifold anchors fixed\n'
    '\t\t\t// in world-space for separation prediction. This removes ONLY the rotational-anchor\n'
    '\t\t\t// contribution from the active b3SolveContacts_Convex wide path. It is NOT a\n'
    '\t\t\t// proposed production solver fix; velocity and impulse application remain unchanged.\n'
    '\t\t\tb3Vec3W ds = b3AddVW( dp, b3SubVW( rB, rA ) );'
)
count = text.count(old)
if count != 1:
    raise SystemExit(f'E2a2k-r2 expected exactly one pinned wide convex separation expression, found {count}')
text = text.replace(old, new)
path.write_text(text, encoding='utf-8')
print('E2A2K_R2_COUNTERFACTUAL_CONVEX_SOLVER_PATCH_OK')
