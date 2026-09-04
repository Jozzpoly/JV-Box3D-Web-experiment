from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2ac-patch-force-fresh-recycler.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# Test-only instrumentation. Default false preserves pinned Box3D behavior.
global_anchor = 'int b3_maxWorldCount;\n'
global_patch = '''int b3_maxWorldCount;

// E2a2ac test-only causal intervention. Default false preserves normal behavior.
static bool b3_e2a2acForceFreshOnRecycleEligible;
static int b3_e2a2acRecycleEligibleCount;

void b3E2a2ac_SetForceFreshOnRecycleEligible( bool forceFresh )
{
\tb3_e2a2acForceFreshOnRecycleEligible = forceFresh;
}

void b3E2a2ac_ResetRecycleEligibleCount( void )
{
\tb3_e2a2acRecycleEligibleCount = 0;
}

int b3E2a2ac_GetRecycleEligibleCount( void )
{
\treturn b3_e2a2acRecycleEligibleCount;
}
'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one world-count anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

# Donor-composed source nests this eligibility branch four tabs deep. Intervene
# inside exactly this branch; do not alter the eligibility calculation itself.
start_marker = '\t\t\t\tif ( arcSq < slack * slack )\n\t\t\t\t{\n'
if physics.count(start_marker) != 1:
    raise SystemExit(f'E2a2ac expected one recycler eligibility branch, found {physics.count(start_marker)}')
physics = physics.replace(
    start_marker,
    start_marker
    + '\t\t\t\t\tb3_e2a2acRecycleEligibleCount += 1;\n'
    + '\t\t\t\t\tif ( b3_e2a2acForceFreshOnRecycleEligible == false )\n'
    + '\t\t\t\t\t{\n',
    1,
)

# Close the force-fresh guard immediately after the normal recycled-manifold
# continue. Force-fresh therefore skips every reuse mutation and falls through
# through the existing outer braces to the normal cache + b3UpdateContact path.
tail_anchor = (
    '\t\t\t\t\t// Contact is recycled. This also skips updating other aspects of the contact\n'
    '\t\t\t\t\t// such as material parameters.\n'
    '\t\t\t\t\tcontinue;\n'
    '\t\t\t\t}\n'
    '\t\t\t}\n'
    '\t\t}\n\n'
    '\t\t// Caching for contact recycling.\n'
)
tail_replacement = (
    '\t\t\t\t\t// Contact is recycled. This also skips updating other aspects of the contact\n'
    '\t\t\t\t\t// such as material parameters.\n'
    '\t\t\t\t\tcontinue;\n'
    '\t\t\t\t\t}\n'
    '\t\t\t\t}\n'
    '\t\t\t}\n'
    '\t\t}\n\n'
    '\t\t// Caching for contact recycling.\n'
)
if physics.count(tail_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one recycler tail anchor, found {physics.count(tail_anchor)}')
physics = physics.replace(tail_anchor, tail_replacement, 1)

bindings_anchor = 'using namespace emscripten;\n\n'
declarations = '''using namespace emscripten;

extern "C"
{
void b3E2a2ac_SetForceFreshOnRecycleEligible( bool forceFresh );
void b3E2a2ac_ResetRecycleEligibleCount( void );
int b3E2a2ac_GetRecycleEligibleCount( void );
}

'''
if bindings.count(bindings_anchor) != 1:
    raise SystemExit(f'E2a2ac expected one bindings declaration anchor, found {bindings.count(bindings_anchor)}')
bindings = bindings.replace(bindings_anchor, declarations, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AC_FORCE_FRESH_RECYCLER_PATCH_OK')
