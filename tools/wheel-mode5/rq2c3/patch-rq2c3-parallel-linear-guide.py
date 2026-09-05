from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c3/patch-rq2c3-parallel-linear-guide.py <vendor-box3d-root>')

root = Path(sys.argv[1])
joint_h = root / 'src/joint.h'
parallel_c = root / 'src/parallel_joint.c'
box3d_h = root / 'include/box3d/box3d.h'

for path in (joint_h, parallel_c, box3d_h):
    if not path.is_file():
        raise SystemExit(f'RQ2C3 expected pinned Box3D file missing: {path}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'RQ2C3 {label}: expected anchor once, got {count}')
    return text.replace(old, new, 1)


def replace_once_after(text: str, marker: str, old: str, new: str, label: str) -> str:
    index = text.find(marker)
    if index < 0:
        raise SystemExit(f'RQ2C3 {label}: marker missing')
    head = text[:index]
    tail = text[index:]
    count = tail.count(old)
    if count != 1:
        raise SystemExit(f'RQ2C3 {label}: expected scoped anchor once, got {count}')
    return head + tail.replace(old, new, 1)

# ---------------------------------------------------------------------------
# Internal ParallelJoint state. Existing creation zero-initializes this struct,
# so the new guide is default-off and historical ParallelJoint semantics remain
# unchanged unless explicitly enabled by the research suite.
# ---------------------------------------------------------------------------
text = joint_h.read_text(encoding='utf-8')
old = '''typedef struct b3ParallelJoint
{
\tfloat hertz;
\tfloat dampingRatio;
\tfloat maxTorque;

\tb3Vec2 perpImpulse;
\tb3Vec3 perpAxisX;
\tb3Vec3 perpAxisY;

\tb3Quat quatA;
\tb3Quat quatB;
\tint indexA;
\tint indexB;
\tb3Softness softness;
} b3ParallelJoint;
'''
new = '''typedef struct b3ParallelJoint
{
\tfloat hertz;
\tfloat dampingRatio;
\tfloat maxTorque;

\tb3Vec2 perpImpulse;
\tb3Vec3 perpAxisX;
\tb3Vec3 perpAxisY;

\t// Experimental RQ2C3 scalar guide. Constrains translation along frame A local +Z.
\tfloat linearGuideImpulse;
\tb3Vec3 linearGuideAnchorA;
\tb3Vec3 linearGuideAnchorB;
\tb3Vec3 linearGuideDeltaCenter;
\tb3Vec3 linearGuideAxis;

\tb3Quat quatA;
\tb3Quat quatB;
\tint indexA;
\tint indexB;
\tb3Softness softness;
\tbool enableLinearAxisGuide;
} b3ParallelJoint;
'''
text = replace_once(text, old, new, 'joint.h ParallelJoint state')
joint_h.write_text(text, encoding='utf-8')

# ---------------------------------------------------------------------------
# Public declaration used only by the transient research composition. No
# b3ParallelJointDef fields are added, avoiding create/recording format changes.
# ---------------------------------------------------------------------------
text = box3d_h.read_text(encoding='utf-8')
old = '''/// Get the maximum spring torque, usually in newton-meters
B3_API float b3ParallelJoint_GetMaxTorque( b3JointId jointId );

/** @} */ // parallel_joint
'''
new = '''/// Get the maximum spring torque, usually in newton-meters
B3_API float b3ParallelJoint_GetMaxTorque( b3JointId jointId );

/// Experimental RQ2C3 research hook. When enabled, constrain relative anchor
/// translation along joint frame A local +Z while leaving the perpendicular
/// plane free. Default is disabled because ParallelJoint state is zero-initialized.
B3_API void b3ParallelJoint_EnableLinearAxisGuide( b3JointId jointId, bool enable );

/** @} */ // parallel_joint
'''
text = replace_once(text, old, new, 'box3d.h ParallelJoint declaration')
box3d_h.write_text(text, encoding='utf-8')

# ---------------------------------------------------------------------------
# Solver implementation.
# ---------------------------------------------------------------------------
text = parallel_c.read_text(encoding='utf-8')

old = '''float b3ParallelJoint_GetMaxTorque( b3JointId jointId )
{
\tb3JointSim* base = b3GetJointSimCheckType( jointId, b3_parallelJoint );
\treturn base->parallelJoint.maxTorque;
}
'''
new = '''float b3ParallelJoint_GetMaxTorque( b3JointId jointId )
{
\tb3JointSim* base = b3GetJointSimCheckType( jointId, b3_parallelJoint );
\treturn base->parallelJoint.maxTorque;
}

void b3ParallelJoint_EnableLinearAxisGuide( b3JointId jointId, bool enable )
{
\tb3JointSim* base = b3GetJointSimCheckType( jointId, b3_parallelJoint );
\tb3ParallelJoint* joint = &base->parallelJoint;
\tif ( enable != joint->enableLinearAxisGuide )
\t{
\t\tjoint->linearGuideImpulse = 0.0f;
\t}
\tjoint->enableLinearAxisGuide = enable;
}
'''
text = replace_once(text, old, new, 'parallel_joint.c enable hook')

old = '''\tjoint->quatA = b3MulQuat( bodySimA->transform.q, base->localFrameA.q );
\tjoint->quatB = b3MulQuat( bodySimB->transform.q, base->localFrameB.q );

\tb3Quat relQ = b3InvMulQuat( joint->quatA, joint->quatB );
'''
new = '''\tjoint->quatA = b3MulQuat( bodySimA->transform.q, base->localFrameA.q );
\tjoint->quatB = b3MulQuat( bodySimB->transform.q, base->localFrameB.q );

\t// RQ2C3 linear-axis guide preparation. These caches mirror the prismatic
\t// axial-constraint geometry but use ParallelJoint frame A local +Z.
\tjoint->linearGuideAnchorA = b3RotateVector( bodySimA->transform.q, b3Sub( base->localFrameA.p, bodySimA->localCenter ) );
\tjoint->linearGuideAnchorB = b3RotateVector( bodySimB->transform.q, b3Sub( base->localFrameB.p, bodySimB->localCenter ) );
\tjoint->linearGuideDeltaCenter = b3SubPos( bodySimB->center, bodySimA->center );
\tjoint->linearGuideAxis = b3RotateVector( joint->quatA, b3Vec3_axisZ );

\tb3Quat relQ = b3InvMulQuat( joint->quatA, joint->quatB );
'''
text = replace_once(text, old, new, 'parallel_joint.c prepare caches')

old = '''\tif ( context->enableWarmStarting == false )
\t{
\t\tjoint->perpImpulse = (b3Vec2){ 0.0f, 0.0f };
\t}
'''
new = '''\tif ( context->enableWarmStarting == false )
\t{
\t\tjoint->perpImpulse = (b3Vec2){ 0.0f, 0.0f };
\t\tjoint->linearGuideImpulse = 0.0f;
\t}
'''
text = replace_once(text, old, new, 'parallel_joint.c warm-start reset')

old = '''void b3WarmStartParallelJoint( b3JointSim* base, b3StepContext* context )
{
\tB3_ASSERT( base->type == b3_parallelJoint );

\tb3Matrix3 iA = base->invIA;
\tb3Matrix3 iB = base->invIB;

\t// dummy state for static bodies
\tb3BodyState dummyState = b3_identityBodyState;

\tb3ParallelJoint* joint = &base->parallelJoint;

\tb3BodyState* stateA = joint->indexA == B3_NULL_INDEX ? &dummyState : context->states + joint->indexA;
\tb3BodyState* stateB = joint->indexB == B3_NULL_INDEX ? &dummyState : context->states + joint->indexB;

\tb3Vec3 wA = stateA->angularVelocity;
\tb3Vec3 wB = stateB->angularVelocity;

\tb3Vec3 angularImpulse = b3Blend2( joint->perpImpulse.x, joint->perpAxisX, joint->perpImpulse.y, joint->perpAxisY );

\twA = b3Sub( wA, b3MulMV( iA, angularImpulse ) );
\twB = b3Add( wB, b3MulMV( iB, angularImpulse ) );

\tif ( stateA->flags & b3_dynamicFlag )
\t{
\t\tstateA->angularVelocity = wA;
\t}

\tif ( stateB->flags & b3_dynamicFlag )
\t{
\t\tstateB->angularVelocity = wB;
\t}
}
'''
new = '''void b3WarmStartParallelJoint( b3JointSim* base, b3StepContext* context )
{
\tB3_ASSERT( base->type == b3_parallelJoint );

\tfloat mA = base->invMassA;
\tfloat mB = base->invMassB;
\tb3Matrix3 iA = base->invIA;
\tb3Matrix3 iB = base->invIB;

\t// dummy state for static bodies
\tb3BodyState dummyState = b3_identityBodyState;

\tb3ParallelJoint* joint = &base->parallelJoint;

\tb3BodyState* stateA = joint->indexA == B3_NULL_INDEX ? &dummyState : context->states + joint->indexA;
\tb3BodyState* stateB = joint->indexB == B3_NULL_INDEX ? &dummyState : context->states + joint->indexB;

\tb3Vec3 vA = stateA->linearVelocity;
\tb3Vec3 vB = stateB->linearVelocity;
\tb3Vec3 wA = stateA->angularVelocity;
\tb3Vec3 wB = stateB->angularVelocity;

\tif ( joint->enableLinearAxisGuide )
\t{
\t\tb3Vec3 rA = b3RotateVector( stateA->deltaRotation, joint->linearGuideAnchorA );
\t\tb3Vec3 rB = b3RotateVector( stateB->deltaRotation, joint->linearGuideAnchorB );
\t\tb3Vec3 d = b3Add( b3Add( b3Sub( stateB->deltaPosition, stateA->deltaPosition ), joint->linearGuideDeltaCenter ), b3Sub( rB, rA ) );
\t\tb3Vec3 axis = b3RotateVector( stateA->deltaRotation, joint->linearGuideAxis );
\t\tb3Vec3 sA = b3Cross( b3Add( rA, d ), axis );
\t\tb3Vec3 sB = b3Cross( rB, axis );

\t\tb3Vec3 P = b3MulSV( joint->linearGuideImpulse, axis );
\t\tb3Vec3 LA = b3MulSV( joint->linearGuideImpulse, sA );
\t\tb3Vec3 LB = b3MulSV( joint->linearGuideImpulse, sB );
\t\tvA = b3MulSub( vA, mA, P );
\t\twA = b3Sub( wA, b3MulMV( iA, LA ) );
\t\tvB = b3MulAdd( vB, mB, P );
\t\twB = b3Add( wB, b3MulMV( iB, LB ) );
\t}

\tb3Vec3 angularImpulse = b3Blend2( joint->perpImpulse.x, joint->perpAxisX, joint->perpImpulse.y, joint->perpAxisY );

\twA = b3Sub( wA, b3MulMV( iA, angularImpulse ) );
\twB = b3Add( wB, b3MulMV( iB, angularImpulse ) );

\tif ( stateA->flags & b3_dynamicFlag )
\t{
\t\tstateA->linearVelocity = vA;
\t\tstateA->angularVelocity = wA;
\t}

\tif ( stateB->flags & b3_dynamicFlag )
\t{
\t\tstateB->linearVelocity = vB;
\t\tstateB->angularVelocity = wB;
\t}
}
'''
text = replace_once(text, old, new, 'parallel_joint.c warm-start function')

solve_marker = 'void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context )\n'

old = '''\tb3Matrix3 iA = base->invIA;
\tb3Matrix3 iB = base->invIB;
'''
new = '''\tfloat mA = base->invMassA;
\tfloat mB = base->invMassB;
\tb3Matrix3 iA = base->invIA;
\tb3Matrix3 iB = base->invIB;
'''
text = replace_once_after(text, solve_marker, old, new, 'parallel_joint.c solve masses')

old = '''\tb3Vec3 wA = stateA->angularVelocity;
\tb3Vec3 wB = stateB->angularVelocity;

\tbool fixedRotation = base->fixedRotation;
'''
new = '''\tb3Vec3 vA = stateA->linearVelocity;
\tb3Vec3 vB = stateB->linearVelocity;
\tb3Vec3 wA = stateA->angularVelocity;
\tb3Vec3 wB = stateB->angularVelocity;

\tbool fixedRotation = base->fixedRotation;
'''
text = replace_once_after(text, solve_marker, old, new, 'parallel_joint.c solve velocities')

angular_anchor = '''\tif ( fixedRotation == false && joint->maxTorque > 0.0f )
'''
linear_block = '''\tif ( joint->enableLinearAxisGuide )
\t{
\t\tb3Vec3 rA = b3RotateVector( stateA->deltaRotation, joint->linearGuideAnchorA );
\t\tb3Vec3 rB = b3RotateVector( stateB->deltaRotation, joint->linearGuideAnchorB );
\t\tb3Vec3 d = b3Add( b3Add( b3Sub( stateB->deltaPosition, stateA->deltaPosition ), joint->linearGuideDeltaCenter ), b3Sub( rB, rA ) );
\t\tb3Vec3 axis = b3RotateVector( stateA->deltaRotation, joint->linearGuideAxis );
\t\tb3Vec3 sA = b3Cross( b3Add( rA, d ), axis );
\t\tb3Vec3 sB = b3Cross( rB, axis );

\t\tfloat c = b3Dot( d, axis );
\t\tfloat k = mA + mB + b3Dot( sA, b3MulMV( iA, sA ) ) + b3Dot( sB, b3MulMV( iB, sB ) );
\t\tfloat mass = k > 0.0f ? 1.0f / k : 0.0f;
\t\tfloat bias = base->constraintSoftness.biasRate * c;
\t\tfloat massScale = base->constraintSoftness.massScale;
\t\tfloat impulseScale = base->constraintSoftness.impulseScale;

\t\tb3Vec3 vRel = b3Sub( b3Sub( b3Add( vB, b3Cross( wB, rB ) ), vA ), b3Cross( wA, b3Add( rA, d ) ) );
\t\tfloat cdot = b3Dot( vRel, axis );
\t\tfloat oldImpulse = joint->linearGuideImpulse;
\t\tfloat deltaImpulse = -massScale * mass * ( cdot + bias ) - impulseScale * oldImpulse;
\t\tjoint->linearGuideImpulse = oldImpulse + deltaImpulse;

\t\tb3Vec3 P = b3MulSV( deltaImpulse, axis );
\t\tb3Vec3 LA = b3MulSV( deltaImpulse, sA );
\t\tb3Vec3 LB = b3MulSV( deltaImpulse, sB );
\t\tvA = b3MulSub( vA, mA, P );
\t\twA = b3Sub( wA, b3MulMV( iA, LA ) );
\t\tvB = b3MulAdd( vB, mB, P );
\t\twB = b3Add( wB, b3MulMV( iB, LB ) );
\t}

'''
text = replace_once_after(text, solve_marker, angular_anchor, linear_block + angular_anchor, 'parallel_joint.c scalar solve insertion')

old = '''\tif ( stateA->flags & b3_dynamicFlag )
\t{
\t\tstateA->angularVelocity = wA;
\t}

\tif ( stateB->flags & b3_dynamicFlag )
\t{
\t\tstateB->angularVelocity = wB;
\t}
'''
new = '''\tif ( stateA->flags & b3_dynamicFlag )
\t{
\t\tstateA->linearVelocity = vA;
\t\tstateA->angularVelocity = wA;
\t}

\tif ( stateB->flags & b3_dynamicFlag )
\t{
\t\tstateB->linearVelocity = vB;
\t\tstateB->angularVelocity = wB;
\t}
'''
text = replace_once_after(text, solve_marker, old, new, 'parallel_joint.c solve state writeback')

parallel_c.write_text(text, encoding='utf-8')

# Final structural checks make accidental broad patching fail closed.
assert 'b3ParallelJoint_EnableLinearAxisGuide' in box3d_h.read_text(encoding='utf-8')
assert 'enableLinearAxisGuide' in joint_h.read_text(encoding='utf-8')
final_parallel = parallel_c.read_text(encoding='utf-8')
assert final_parallel.count('b3ParallelJoint_EnableLinearAxisGuide') == 1
assert final_parallel.count('if ( joint->enableLinearAxisGuide )') == 2
assert final_parallel.count('joint->linearGuideImpulse = 0.0f;') >= 2

print('RQ2C3_PARALLEL_LINEAR_GUIDE_PATCH_OK')
