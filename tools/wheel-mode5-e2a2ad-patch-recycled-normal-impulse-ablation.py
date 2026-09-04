from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2ad-patch-recycled-normal-impulse-ablation.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# Test-only intervention. Default false preserves pinned Box3D behavior.
global_anchor = 'int b3_maxWorldCount;\n'
global_patch = '''int b3_maxWorldCount;

// E2a2ad test-only intervention: clear only carried normal impulses on the
// recycled-manifold shortcut while preserving eligibility, anchors, separation,
// persisted flags, and the shortcut continue.
static bool b3_e2a2adZeroRecycledNormalImpulse;
static int b3_e2a2adZeroedPointCount;

void b3E2a2ad_SetZeroRecycledNormalImpulse( bool enabled )
{
\tb3_e2a2adZeroRecycledNormalImpulse = enabled;
}

void b3E2a2ad_ResetZeroedPointCount( void )
{
\tb3_e2a2adZeroedPointCount = 0;
}

int b3E2a2ad_GetZeroedPointCount( void )
{
\treturn b3_e2a2adZeroedPointCount;
}
'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one world-count anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

# Intervene only after the normal recycled shortcut has reprojected separation
# and marked the existing manifold point persisted. With friction=0 in this
# apparatus, normalImpulse is the solver-carried warm-start state under test.
point_anchor = (
    '\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n'
    '\t\t\t\t\t\t\tmp->persisted = true;\n'
)
point_replacement = point_anchor + (
    '\t\t\t\t\t\t\tif ( b3_e2a2adZeroRecycledNormalImpulse )\n'
    '\t\t\t\t\t\t\t{\n'
    '\t\t\t\t\t\t\t\tmp->normalImpulse = 0.0f;\n'
    '\t\t\t\t\t\t\t\tb3_e2a2adZeroedPointCount += 1;\n'
    '\t\t\t\t\t\t\t}\n'
)
if physics.count(point_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one recycled-point update anchor, found {physics.count(point_anchor)}')
physics = physics.replace(point_anchor, point_replacement, 1)

bindings_anchor = 'using namespace emscripten;\n\n'
declarations = '''using namespace emscripten;

extern "C"
{
void b3E2a2ad_SetZeroRecycledNormalImpulse( bool enabled );
void b3E2a2ad_ResetZeroedPointCount( void );
int b3E2a2ad_GetZeroedPointCount( void );
}

'''
if bindings.count(bindings_anchor) != 1:
    raise SystemExit(f'E2a2ad expected one bindings declaration anchor, found {bindings.count(bindings_anchor)}')
bindings = bindings.replace(bindings_anchor, declarations, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AD_RECYCLED_NORMAL_IMPULSE_PATCH_OK')
