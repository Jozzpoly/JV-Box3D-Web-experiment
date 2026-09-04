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

start_marker = '\t\tif ( arcSq < slack * slack )\n\t\t{\n'
cache_marker = '\n\t\t// Cache relative transform for contact recycling.\n'
start = physics.find(start_marker)
if start < 0:
    raise SystemExit('E2a2ac could not locate recycler eligibility branch')
cache = physics.find(cache_marker, start)
if cache < 0:
    raise SystemExit('E2a2ac could not locate recycler cache fall-through')
block = physics[start:cache]
if 'Keep anchors but update separation' not in block or 'continue;' not in block:
    raise SystemExit('E2a2ac recycler block semantic anchors drifted')

body_start = len(start_marker)
closing = block.rfind('\n\t\t}')
if closing < body_start:
    raise SystemExit('E2a2ac could not locate recycler block closing brace')
body = block[body_start:closing]
if body.count('\n\t\t\tcontinue;') != 1:
    raise SystemExit(f'E2a2ac expected one recycler continue, found {body.count(chr(10) + chr(9)*3 + "continue;")}')

# Count eligibility in both arms. In force-fresh mode, skip all recycled-manifold
# mutation and fall through to the normal b3UpdateContact narrow-phase path.
nested_body = ''.join(('\t' + line if line else line) for line in body.splitlines(keepends=True))
replacement = (
    start_marker
    + '\t\t\tb3_e2a2acRecycleEligibleCount += 1;\n'
    + '\t\t\tif ( b3_e2a2acForceFreshOnRecycleEligible == false )\n'
    + '\t\t\t{\n'
    + nested_body
    + '\t\t\t}\n'
    + '\t\t}'
)
physics = physics[:start] + replacement + physics[cache:]

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
