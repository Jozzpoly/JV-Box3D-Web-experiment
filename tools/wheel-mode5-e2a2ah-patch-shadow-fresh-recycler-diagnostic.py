from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2ah-patch-shadow-fresh-recycler-diagnostic.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# Diagnostic-only shadow narrow phase. Disabled by default. The shadow contact owns
# a stack-local manifold and a value-copy of the convex cache; it must not mutate
# the live contact, recycler pose cache, solver manifold, or world manifold pool.
global_anchor = 'int b3_maxWorldCount;\n'
global_patch = r'''int b3_maxWorldCount;

static bool b3_e2a2ahShadowFreshEnabled;
static int b3_e2a2ahShadowSequence;
static int b3_e2a2ahShadowCallCount;
static int b3_e2a2ahShadowFreshPointCount;
static int b3_e2a2ahShadowRecycledPointCount;
static int b3_e2a2ahShadowMatchedPointCount;
static int b3_e2a2ahShadowFreshTouching;
static int b3_e2a2ahShadowActiveFeature[4];
static int b3_e2a2ahShadowFreshFeature[4];
static float b3_e2a2ahShadowBaseSeparation[4];
static float b3_e2a2ahShadowReprojection[4];
static float b3_e2a2ahShadowRecycledSeparation[4];
static float b3_e2a2ahShadowMatchedFreshSeparation[4];

void b3E2a2ah_SetShadowFreshEnabled( bool enabled )
{
	b3_e2a2ahShadowFreshEnabled = enabled;
}

void b3E2a2ah_ResetShadowFreshTelemetry( void )
{
	b3_e2a2ahShadowSequence = 0;
	b3_e2a2ahShadowCallCount = 0;
	b3_e2a2ahShadowFreshPointCount = 0;
	b3_e2a2ahShadowRecycledPointCount = 0;
	b3_e2a2ahShadowMatchedPointCount = 0;
	b3_e2a2ahShadowFreshTouching = 0;
	for ( int i = 0; i < 4; ++i )
	{
		b3_e2a2ahShadowActiveFeature[i] = -1;
		b3_e2a2ahShadowFreshFeature[i] = -1;
		b3_e2a2ahShadowBaseSeparation[i] = 0.0f;
		b3_e2a2ahShadowReprojection[i] = 0.0f;
		b3_e2a2ahShadowRecycledSeparation[i] = 0.0f;
		b3_e2a2ahShadowMatchedFreshSeparation[i] = 0.0f;
	}
}

int b3E2a2ah_GetShadowSequence( void ) { return b3_e2a2ahShadowSequence; }
int b3E2a2ah_GetShadowCallCount( void ) { return b3_e2a2ahShadowCallCount; }
int b3E2a2ah_GetShadowFreshPointCount( void ) { return b3_e2a2ahShadowFreshPointCount; }
int b3E2a2ah_GetShadowRecycledPointCount( void ) { return b3_e2a2ahShadowRecycledPointCount; }
int b3E2a2ah_GetShadowMatchedPointCount( void ) { return b3_e2a2ahShadowMatchedPointCount; }
int b3E2a2ah_GetShadowFreshTouching( void ) { return b3_e2a2ahShadowFreshTouching; }
int b3E2a2ah_GetShadowActiveFeature( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowActiveFeature[index] : -1; }
int b3E2a2ah_GetShadowFreshFeature( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowFreshFeature[index] : -1; }
float b3E2a2ah_GetShadowBaseSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowBaseSeparation[index] : 0.0f; }
float b3E2a2ah_GetShadowReprojection( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowReprojection[index] : 0.0f; }
float b3E2a2ah_GetShadowRecycledSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowRecycledSeparation[index] : 0.0f; }
float b3E2a2ah_GetShadowMatchedFreshSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowMatchedFreshSeparation[index] : 0.0f; }
'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one world-count anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

# Donor-composed recycler eligibility branch. Compute a fresh manifold only on a
# stack-local copy. This is deliberately convex-only / one-manifold-only, which
# matches the bounded flat-P75 wheel-ground apparatus.
start_marker = '\t\t\t\tif ( arcSq < slack * slack )\n\t\t\t\t{\n'
shadow_setup = r'''					b3Contact e2a2ahShadowContact = { 0 };
					b3Manifold e2a2ahShadowManifold = { 0 };
					bool e2a2ahShadowValid = false;
					bool e2a2ahShadowTouching = false;
					if ( b3_e2a2ahShadowFreshEnabled && isMeshContact == false && contact->manifoldCount == 1 )
					{
						e2a2ahShadowContact = *contact;
						e2a2ahShadowManifold = contact->manifolds[0];
						e2a2ahShadowContact.manifolds = &e2a2ahShadowManifold;
						e2a2ahShadowContact.manifoldCount = 1;
						e2a2ahShadowTouching = b3UpdateContact( world, workerIndex, &e2a2ahShadowContact, shapeA,
							bodySimA->localCenter, transformA, shapeB, bodySimB->localCenter, transformB, isFast, taskContext->arena );
						e2a2ahShadowValid = true;
					}
'''
if physics.count(start_marker) != 1:
    raise SystemExit(f'E2a2ah expected one recycler eligibility branch, found {physics.count(start_marker)}')
physics = physics.replace(start_marker, start_marker + shadow_setup, 1)

# Record the live recycled manifold only after the normal shortcut has completed
# its separation reprojection, immediately before its continue. Matching is by
# feature id so topology changes remain visible rather than index-assumed.
tail_anchor = (
    '\t\t\t\t\t// Contact is recycled. This also skips updating other aspects of the contact\n'
    '\t\t\t\t\t// such as material parameters.\n'
    '\t\t\t\t\tcontinue;\n'
)
record = r'''					if ( e2a2ahShadowValid )
					{
						b3_e2a2ahShadowCallCount += 1;
						b3_e2a2ahShadowSequence += 1;
						b3_e2a2ahShadowFreshTouching = e2a2ahShadowTouching ? 1 : 0;
						b3_e2a2ahShadowFreshPointCount = e2a2ahShadowManifold.pointCount;
						b3_e2a2ahShadowRecycledPointCount = contact->manifolds[0].pointCount;
						b3_e2a2ahShadowMatchedPointCount = 0;
						for ( int i = 0; i < 4; ++i )
						{
							b3_e2a2ahShadowActiveFeature[i] = -1;
							b3_e2a2ahShadowFreshFeature[i] = -1;
							b3_e2a2ahShadowBaseSeparation[i] = 0.0f;
							b3_e2a2ahShadowReprojection[i] = 0.0f;
							b3_e2a2ahShadowRecycledSeparation[i] = 0.0f;
							b3_e2a2ahShadowMatchedFreshSeparation[i] = 0.0f;
						}
						for ( int i = 0; i < contact->manifolds[0].pointCount && i < 4; ++i )
						{
							b3ManifoldPoint* activePoint = contact->manifolds[0].points + i;
							b3_e2a2ahShadowActiveFeature[i] = (int)activePoint->id;
							b3_e2a2ahShadowBaseSeparation[i] = activePoint->baseSeparation;
							b3_e2a2ahShadowRecycledSeparation[i] = activePoint->separation;
							b3_e2a2ahShadowReprojection[i] = activePoint->separation - activePoint->baseSeparation;
							for ( int j = 0; j < e2a2ahShadowManifold.pointCount && j < 4; ++j )
							{
								if ( e2a2ahShadowManifold.points[j].id == activePoint->id )
								{
									b3_e2a2ahShadowMatchedFreshSeparation[i] = e2a2ahShadowManifold.points[j].separation;
									b3_e2a2ahShadowMatchedPointCount += 1;
									break;
								}
							}
						}
						for ( int j = 0; j < e2a2ahShadowManifold.pointCount && j < 4; ++j )
						{
							b3_e2a2ahShadowFreshFeature[j] = (int)e2a2ahShadowManifold.points[j].id;
						}
					}
'''
if physics.count(tail_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one recycler continue anchor, found {physics.count(tail_anchor)}')
physics = physics.replace(tail_anchor, tail_anchor.replace('\t\t\t\t\tcontinue;\n', record + '\t\t\t\t\tcontinue;\n'), 1)

bindings_anchor = 'using namespace emscripten;\n\n'
declarations = r'''using namespace emscripten;

extern "C"
{
void b3E2a2ah_SetShadowFreshEnabled( bool enabled );
void b3E2a2ah_ResetShadowFreshTelemetry( void );
int b3E2a2ah_GetShadowSequence( void );
int b3E2a2ah_GetShadowCallCount( void );
int b3E2a2ah_GetShadowFreshPointCount( void );
int b3E2a2ah_GetShadowRecycledPointCount( void );
int b3E2a2ah_GetShadowMatchedPointCount( void );
int b3E2a2ah_GetShadowFreshTouching( void );
int b3E2a2ah_GetShadowActiveFeature( int index );
int b3E2a2ah_GetShadowFreshFeature( int index );
float b3E2a2ah_GetShadowBaseSeparation( int index );
float b3E2a2ah_GetShadowReprojection( int index );
float b3E2a2ah_GetShadowRecycledSeparation( int index );
float b3E2a2ah_GetShadowMatchedFreshSeparation( int index );
}

'''
if bindings.count(bindings_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one bindings declaration anchor, found {bindings.count(bindings_anchor)}')
bindings = bindings.replace(bindings_anchor, declarations, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AH_SHADOW_FRESH_RECYCLER_DIAGNOSTIC_PATCH_OK')
