from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2l-patch-wheel-symmetry-separation.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# Wheel lane classification needs b3Shape outside validation-only builds.
include_old = '#if B3_ENABLE_VALIDATION\n#include "shape.h"\n#endif\n'
include_new = '#include "shape.h"\n'
if text.count(include_old) != 1:
    raise SystemExit(f'E2a2l include anchor drifted: {text.count(include_old)}')
text = text.replace(include_old, include_new, 1)

# Keep symmetry metadata entirely internal to the wide convex constraint.
struct_old = '\tb3SymMatrix3W invIA, invIB;\n\tb3Vec3W normal;\n\n\t// todo test computing the tangents on the fly, at least tangent2\n'
struct_new = '''\tb3SymMatrix3W invIA, invIB;
\tb3Vec3W normal;

\t// E2a2l diagnostic metadata. A zero axis means ordinary rigid-body anchor
\t// rotation. A unit axis means this lane belongs to a rotationally symmetric
\t// b3_wheelShape and geometric separation may ignore roll phase about it.
\tb3Vec3W symmetryAxisA;
\tb3Vec3W symmetryAxisB;

\t// todo test computing the tangents on the fly, at least tangent2
'''
if text.count(struct_old) != 1:
    raise SystemExit(f'E2a2l wide-constraint anchor drifted: {text.count(struct_old)}')
text = text.replace(struct_old, struct_new, 1)

# Classify the actual contact shapes while b3PrepareContacts_Convex still has
# direct access to b3Contact, world shapes and the start-of-step body transform.
prepare_old = '''\t\t\t\tint indexA = contact->bodySimIndexA;
\t\t\t\tint indexB = contact->bodySimIndexB;

#if B3_ENABLE_VALIDATION
'''
prepare_new = '''\t\t\t\tint indexA = contact->bodySimIndexA;
\t\t\t\tint indexB = contact->bodySimIndexB;

\t\t\t\tb3Vec3 symmetryAxisA = b3Vec3_zero;
\t\t\t\tb3Vec3 symmetryAxisB = b3Vec3_zero;
\t\t\t\tconst b3Shape* shapeA = b3Array_Get( world->shapes, contact->shapeIdA );
\t\t\t\tconst b3Shape* shapeB = b3Array_Get( world->shapes, contact->shapeIdB );
\t\t\t\tif ( shapeA->type == b3_wheelShape && indexA != B3_NULL_INDEX )
\t\t\t\t{
\t\t\t\t\tsymmetryAxisA = b3RotateVector( sims[indexA].transform.q, shapeA->wheel.axis );
\t\t\t\t}
\t\t\t\tif ( shapeB->type == b3_wheelShape && indexB != B3_NULL_INDEX )
\t\t\t\t{
\t\t\t\t\tsymmetryAxisB = b3RotateVector( sims[indexB].transform.q, shapeB->wheel.axis );
\t\t\t\t}

#if B3_ENABLE_VALIDATION
'''
if text.count(prepare_old) != 1:
    raise SystemExit(f'E2a2l prepare contact anchor drifted: {text.count(prepare_old)}')
text = text.replace(prepare_old, prepare_new, 1)

pack_old = '''\t\t\t\tconstraint->indexA[lane] = indexA + 1;
\t\t\t\tconstraint->indexB[lane] = indexB + 1;
\t\t\t\tconstraint->manifolds[lane] = manifold;

\t\t\t\t// Body A data
'''
pack_new = '''\t\t\t\tconstraint->indexA[lane] = indexA + 1;
\t\t\t\tconstraint->indexB[lane] = indexB + 1;
\t\t\t\tconstraint->manifolds[lane] = manifold;

\t\t\t\t( (float*)&constraint->symmetryAxisA.X )[lane] = symmetryAxisA.x;
\t\t\t\t( (float*)&constraint->symmetryAxisA.Y )[lane] = symmetryAxisA.y;
\t\t\t\t( (float*)&constraint->symmetryAxisA.Z )[lane] = symmetryAxisA.z;
\t\t\t\t( (float*)&constraint->symmetryAxisB.X )[lane] = symmetryAxisB.x;
\t\t\t\t( (float*)&constraint->symmetryAxisB.Y )[lane] = symmetryAxisB.y;
\t\t\t\t( (float*)&constraint->symmetryAxisB.Z )[lane] = symmetryAxisB.z;

\t\t\t\t// Body A data
'''
if text.count(pack_old) != 1:
    raise SystemExit(f'E2a2l lane packing anchor drifted: {text.count(pack_old)}')
text = text.replace(pack_old, pack_new, 1)

helper_anchor = '// Soft contact constraints with sub-stepping support\n'
helper = r'''// Component-wise vector blend. `mask` follows b3BlendW semantics.
static inline b3Vec3W b3BlendVW( b3Vec3W a, b3Vec3W b, b3FloatW mask )
{
	return (b3Vec3W){
		b3BlendW( a.X, b.X, mask ),
		b3BlendW( a.Y, b.Y, mask ),
		b3BlendW( a.Z, b.Z, mask ),
	};
}

// E2a2l diagnostic-only geometric rotation for an axisymmetric wheel lane.
// Ordinary lanes have a zero symmetry axis and return the exact original full
// delta-rotation result. Wheel lanes instead rotate the prepared world-space
// anchor by the minimum rotation that carries the wheel's start-of-step axis to
// its current axis. Pure roll about that axis therefore contributes no geometric
// separation, while any rotation that changes the axis direction is preserved.
//
// This affects ONLY separation prediction. Jacobians, angular velocity, friction,
// restitution, rolling resistance and impulse application continue using the
// original fixed anchors and full body state.
static inline b3Vec3W b3RotateAxisymmetricAnchorW( b3QuatW dq, b3Vec3W symmetryAxis, b3Vec3W anchor )
{
	b3Vec3W full = b3RotateVectorW( dq, anchor );
	b3FloatW one = b3SplatW( 1.0f );
	b3FloatW half = b3SplatW( 0.5f );
	b3FloatW two = b3SplatW( 2.0f );

	// A valid packed wheel axis is unit length; ordinary lanes are exactly zero.
	b3FloatW axisLengthSquared = b3DotW( symmetryAxis, symmetryAxis );
	b3FloatW wheelMask = b3GreaterThanW( axisLengthSquared, b3SplatW( 0.5f ) );

	b3Vec3W axisEnd = b3RotateVectorW( dq, symmetryAxis );
	b3FloatW cosine = b3SymClampW( b3DotW( symmetryAxis, axisEnd ), one );
	b3FloatW onePlusCosine = b3AddW( one, cosine );

	// Unit-vector shortest-arc quaternion q = normalize([cross(a,b), 1+dot(a,b)]).
	// Near antiparallel axes do not have a unique shortest arc, so those lanes
	// conservatively fall back to the original full body delta rotation.
	b3FloatW epsilon = b3SplatW( 1.0e-5f );
	b3FloatW safeOnePlusCosine = b3MaxW( onePlusCosine, epsilon );
	b3FloatW inverseVectorScale = b3DivW( one, b3SqrtW( b3MulW( two, safeOnePlusCosine ) ) );
	b3QuatW geometricRotation;
	geometricRotation.V = b3MulSVW( inverseVectorScale, b3CrossW( symmetryAxis, axisEnd ) );
	geometricRotation.S = b3SqrtW( b3MulW( half, safeOnePlusCosine ) );

	b3Vec3W geometric = b3RotateVectorW( geometricRotation, anchor );
	b3FloatW directionValidMask = b3GreaterThanW( onePlusCosine, epsilon );
	geometric = b3BlendVW( full, geometric, directionValidMask );
	return b3BlendVW( full, geometric, wheelMask );
}

'''
if text.count(helper_anchor) != 1:
    raise SystemExit(f'E2a2l helper insertion anchor drifted: {text.count(helper_anchor)}')
text = text.replace(helper_anchor, helper + helper_anchor, 1)

solve_old = '''\t\t\t// Moving anchors for current separation
\t\t\t// todo speed this up using matrices
\t\t\tb3Vec3W rsA = b3RotateVectorW( bA.dq, rA );
\t\t\tb3Vec3W rsB = b3RotateVectorW( bB.dq, rB );
'''
solve_new = '''\t\t\t// Moving anchors for current separation. E2a2l changes only the
\t\t\t// geometric rotation of explicitly axisymmetric wheel lanes.
\t\t\tb3Vec3W rsA = b3RotateAxisymmetricAnchorW( bA.dq, c->symmetryAxisA, rA );
\t\t\tb3Vec3W rsB = b3RotateAxisymmetricAnchorW( bB.dq, c->symmetryAxisB, rB );
'''
if text.count(solve_old) != 1:
    raise SystemExit(f'E2a2l active convex solve anchor drifted: {text.count(solve_old)}')
text = text.replace(solve_old, solve_new, 1)

path.write_text(text, encoding='utf-8')
print('E2A2L_WHEEL_SYMMETRY_SEPARATION_PATCH_OK')
