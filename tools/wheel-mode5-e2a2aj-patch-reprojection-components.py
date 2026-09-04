from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2aj-patch-reprojection-components.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# Self-contained, live-only E2a2aj telemetry. This is deliberately independent
# from E2a2ah shadow-fresh feature matching: the current question only needs an
# exact decomposition of the authoritative recycled reprojection term.
global_anchor = 'int b3_maxWorldCount;\n'
global_patch = r'''int b3_maxWorldCount;

static bool b3_e2a2ajEnabled;
static int b3_e2a2ajSequence;
static int b3_e2a2ajCallCount;
static int b3_e2a2ajPointCount;
static float b3_e2a2ajBaseSeparation[4];
static float b3_e2a2ajCenterDot[4];
static float b3_e2a2ajAnchorADot[4];
static float b3_e2a2ajAnchorBDot[4];
static float b3_e2a2ajRecomposedDot[4];
static float b3_e2a2ajReprojection[4];
static float b3_e2a2ajRecycledSeparation[4];

void b3E2a2aj_SetEnabled( bool enabled ) { b3_e2a2ajEnabled = enabled; }
void b3E2a2aj_ResetTelemetry( void )
{
	b3_e2a2ajSequence = 0;
	b3_e2a2ajCallCount = 0;
	b3_e2a2ajPointCount = 0;
	for ( int i = 0; i < 4; ++i )
	{
		b3_e2a2ajBaseSeparation[i] = 0.0f;
		b3_e2a2ajCenterDot[i] = 0.0f;
		b3_e2a2ajAnchorADot[i] = 0.0f;
		b3_e2a2ajAnchorBDot[i] = 0.0f;
		b3_e2a2ajRecomposedDot[i] = 0.0f;
		b3_e2a2ajReprojection[i] = 0.0f;
		b3_e2a2ajRecycledSeparation[i] = 0.0f;
	}
}
int b3E2a2aj_GetSequence( void ) { return b3_e2a2ajSequence; }
int b3E2a2aj_GetCallCount( void ) { return b3_e2a2ajCallCount; }
int b3E2a2aj_GetPointCount( void ) { return b3_e2a2ajPointCount; }
float b3E2a2aj_GetBaseSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajBaseSeparation[index] : 0.0f; }
float b3E2a2aj_GetCenterDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajCenterDot[index] : 0.0f; }
float b3E2a2aj_GetAnchorADot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajAnchorADot[index] : 0.0f; }
float b3E2a2aj_GetAnchorBDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajAnchorBDot[index] : 0.0f; }
float b3E2a2aj_GetRecomposedDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajRecomposedDot[index] : 0.0f; }
float b3E2a2aj_GetReprojection( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajReprojection[index] : 0.0f; }
float b3E2a2aj_GetRecycledSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajRecycledSeparation[index] : 0.0f; }
'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one world-count anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

calc_anchor = '''\t\t\t\t\t\t\tb3Vec3 rA = b3MulMV( matrixA, mp->anchorA );\n\t\t\t\t\t\t\tb3Vec3 rB = b3MulMV( matrixB, mp->anchorB );\n\t\t\t\t\t\t\tb3Vec3 dp = b3Add( dc, b3Sub( rB, rA ) );\n\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n\t\t\t\t\t\t\tmp->persisted = true;\n'''
calc_patch = '''\t\t\t\t\t\t\tb3Vec3 rA = b3MulMV( matrixA, mp->anchorA );\n\t\t\t\t\t\t\tb3Vec3 rB = b3MulMV( matrixB, mp->anchorB );\n\t\t\t\t\t\t\tb3Vec3 dp = b3Add( dc, b3Sub( rB, rA ) );\n\t\t\t\t\t\t\tfloat e2a2ajCenterDot = b3Dot( dc, normal );\n\t\t\t\t\t\t\tfloat e2a2ajAnchorADot = -b3Dot( rA, normal );\n\t\t\t\t\t\t\tfloat e2a2ajAnchorBDot = b3Dot( rB, normal );\n\t\t\t\t\t\t\tfloat e2a2ajRecomposedDot = e2a2ajCenterDot + e2a2ajAnchorADot + e2a2ajAnchorBDot;\n\t\t\t\t\t\t\tfloat e2a2ajReprojection = b3Dot( dp, normal );\n\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + e2a2ajReprojection;\n\t\t\t\t\t\t\tmp->persisted = true;\n\t\t\t\t\t\t\tif ( b3_e2a2ajEnabled && pointIndex < 4 )\n\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\tb3_e2a2ajBaseSeparation[pointIndex] = mp->baseSeparation;\n\t\t\t\t\t\t\t\tb3_e2a2ajCenterDot[pointIndex] = e2a2ajCenterDot;\n\t\t\t\t\t\t\t\tb3_e2a2ajAnchorADot[pointIndex] = e2a2ajAnchorADot;\n\t\t\t\t\t\t\t\tb3_e2a2ajAnchorBDot[pointIndex] = e2a2ajAnchorBDot;\n\t\t\t\t\t\t\t\tb3_e2a2ajRecomposedDot[pointIndex] = e2a2ajRecomposedDot;\n\t\t\t\t\t\t\t\tb3_e2a2ajReprojection[pointIndex] = e2a2ajReprojection;\n\t\t\t\t\t\t\t\tb3_e2a2ajRecycledSeparation[pointIndex] = mp->separation;\n\t\t\t\t\t\t\t}\n'''
if physics.count(calc_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one recycler calculation anchor, found {physics.count(calc_anchor)}')
physics = physics.replace(calc_anchor, calc_patch, 1)

continue_anchor = '''\t\t\t\t\t// Contact is recycled. This also skips updating other aspects of the contact\n\t\t\t\t\t// such as material parameters.\n\t\t\t\t\tcontinue;\n'''
continue_patch = '''\t\t\t\t\tif ( b3_e2a2ajEnabled )\n\t\t\t\t\t{\n\t\t\t\t\t\tb3_e2a2ajCallCount += 1;\n\t\t\t\t\t\tb3_e2a2ajSequence += 1;\n\t\t\t\t\t\tb3_e2a2ajPointCount = contact->manifolds[0].pointCount < 4 ? contact->manifolds[0].pointCount : 4;\n\t\t\t\t\t}\n\t\t\t\t\t// Contact is recycled. This also skips updating other aspects of the contact\n\t\t\t\t\t// such as material parameters.\n\t\t\t\t\tcontinue;\n'''
if physics.count(continue_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one recycler continue anchor, found {physics.count(continue_anchor)}')
physics = physics.replace(continue_anchor, continue_patch, 1)

bindings_anchor = 'using namespace emscripten;\n\n'
declarations = r'''using namespace emscripten;

extern "C"
{
void b3E2a2aj_SetEnabled( bool enabled );
void b3E2a2aj_ResetTelemetry( void );
int b3E2a2aj_GetSequence( void );
int b3E2a2aj_GetCallCount( void );
int b3E2a2aj_GetPointCount( void );
float b3E2a2aj_GetBaseSeparation( int index );
float b3E2a2aj_GetCenterDot( int index );
float b3E2a2aj_GetAnchorADot( int index );
float b3E2a2aj_GetAnchorBDot( int index );
float b3E2a2aj_GetRecomposedDot( int index );
float b3E2a2aj_GetReprojection( int index );
float b3E2a2aj_GetRecycledSeparation( int index );
}

'''
if bindings.count(bindings_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one bindings declaration anchor, found {bindings.count(bindings_anchor)}')
bindings = bindings.replace(bindings_anchor, declarations, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AJ_REPROJECTION_COMPONENT_PATCH_OK')
