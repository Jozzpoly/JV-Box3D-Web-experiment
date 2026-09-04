from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2ae-patch-recycled-separation-reprojection-ablation.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# Test-only intervention. Default false preserves pinned Box3D behavior.
global_anchor = 'int b3_maxWorldCount;\n'
global_patch = '''int b3_maxWorldCount;

// E2a2ae test-only intervention: on the normal recycled-manifold shortcut,
// optionally suppress only the relative-motion separation reprojection term.
// Eligibility, cached anchors, baseSeparation, persisted state, impulses and
// shortcut continuation remain unchanged.
static bool b3_e2a2aeFreezeRecycledSeparation;
static int b3_e2a2aeFrozenPointCount;

void b3E2a2ae_SetFreezeRecycledSeparation( bool enabled )
{
\tb3_e2a2aeFreezeRecycledSeparation = enabled;
}

void b3E2a2ae_ResetFrozenPointCount( void )
{
\tb3_e2a2aeFrozenPointCount = 0;
}

int b3E2a2ae_GetFrozenPointCount( void )
{
\treturn b3_e2a2aeFrozenPointCount;
}
'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2ae expected one world-count anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

point_anchor = (
    '\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n'
    '\t\t\t\t\t\t\tmp->persisted = true;\n'
)
point_replacement = (
    '\t\t\t\t\t\t\tif ( b3_e2a2aeFreezeRecycledSeparation )\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tmp->separation = mp->baseSeparation;\n'
    '\t\t\t\t\t\t\t\tb3_e2a2aeFrozenPointCount += 1;\n'
    '\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\telse\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n'
    '\t\t\t\t\t\t\t}\n'
    '\t\t\t\t\t\t\tmp->persisted = true;\n'
)
if physics.count(point_anchor) != 1:
    raise SystemExit(f'E2a2ae expected one recycled-point separation anchor, found {physics.count(point_anchor)}')
physics = physics.replace(point_anchor, point_replacement, 1)

bindings_anchor = 'using namespace emscripten;\n\n'
declarations = '''using namespace emscripten;

extern "C"
{
void b3E2a2ae_SetFreezeRecycledSeparation( bool enabled );
void b3E2a2ae_ResetFrozenPointCount( void );
int b3E2a2ae_GetFrozenPointCount( void );
}

'''
if bindings.count(bindings_anchor) != 1:
    raise SystemExit(f'E2a2ae expected one bindings declaration anchor, found {bindings.count(bindings_anchor)}')
bindings = bindings.replace(bindings_anchor, declarations, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AE_RECYCLED_SEPARATION_REPROJECTION_PATCH_OK')
