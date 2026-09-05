from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python tools/wheel-mode5/rq2c4/patch-rq2c4-parallel-hard-relax.py <vendor-box3d-root>')

root = Path(sys.argv[1])
joint_h = root / 'src/joint.h'
joint_c = root / 'src/joint.c'
parallel_c = root / 'src/parallel_joint.c'

for path in (joint_h, joint_c, parallel_c):
    if not path.is_file():
        raise SystemExit(f'RQ2C4 expected pinned Box3D file missing: {path}')


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'RQ2C4 {label}: expected anchor once, got {count}')
    return text.replace(old, new, 1)

# ParallelJoint now receives the same solve/relax phase signal already passed to
# prismatic/revolute/spherical/weld/wheel joints.
text = joint_h.read_text(encoding='utf-8')
text = replace_once(
    text,
    'void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context );',
    'void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context, bool useBias );',
    'joint.h solve prototype',
)
joint_h.write_text(text, encoding='utf-8')

text = joint_c.read_text(encoding='utf-8')
text = replace_once(
    text,
    'case b3_parallelJoint:\n\t\t\tb3SolveParallelJoint( joint, context );\n\t\t\tbreak;',
    'case b3_parallelJoint:\n\t\t\tb3SolveParallelJoint( joint, context, useBias );\n\t\t\tbreak;',
    'joint.c ParallelJoint dispatch',
)
joint_c.write_text(text, encoding='utf-8')

text = parallel_c.read_text(encoding='utf-8')
text = replace_once(
    text,
    'void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context )',
    'void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context, bool useBias )',
    'parallel_joint.c solve signature',
)

old = '''\t\tfloat c = b3Dot( d, axis );
\t\tfloat k = mA + mB + b3Dot( sA, b3MulMV( iA, sA ) ) + b3Dot( sB, b3MulMV( iB, sB ) );
\t\tfloat mass = k > 0.0f ? 1.0f / k : 0.0f;
\t\tfloat bias = base->constraintSoftness.biasRate * c;
\t\tfloat massScale = base->constraintSoftness.massScale;
\t\tfloat impulseScale = base->constraintSoftness.impulseScale;

\t\tb3Vec3 vRel = b3Sub( b3Sub( b3Add( vB, b3Cross( wB, rB ) ), vA ), b3Cross( wA, b3Add( rA, d ) ) );
'''
new = '''\t\tfloat c = b3Dot( d, axis );
\t\tfloat k = mA + mB + b3Dot( sA, b3MulMV( iA, sA ) ) + b3Dot( sB, b3MulMV( iB, sB ) );
\t\tfloat mass = k > 0.0f ? 1.0f / k : 0.0f;

\t\t// Match pinned hard equality semantics: positional bias/softness in the
\t\t// biased solve, then exact velocity equality in the relax pass.
\t\tfloat bias = 0.0f;
\t\tfloat massScale = 1.0f;
\t\tfloat impulseScale = 0.0f;
\t\tif ( useBias )
\t\t{
\t\t\tbias = base->constraintSoftness.biasRate * c;
\t\t\tmassScale = base->constraintSoftness.massScale;
\t\t\timpulseScale = base->constraintSoftness.impulseScale;
\t\t}

\t\tb3Vec3 vRel = b3Sub( b3Sub( b3Add( vB, b3Cross( wB, rB ) ), vA ), b3Cross( wA, b3Add( rA, d ) ) );
'''
text = replace_once(text, old, new, 'parallel_joint.c scalar guide solve/relax semantics')
parallel_c.write_text(text, encoding='utf-8')

# Fail closed if this patch broadens beyond the intended solve lifecycle wiring.
final_h = joint_h.read_text(encoding='utf-8')
final_joint = joint_c.read_text(encoding='utf-8')
final_parallel = parallel_c.read_text(encoding='utf-8')
assert final_h.count('b3SolveParallelJoint( b3JointSim* base, b3StepContext* context, bool useBias )') == 1
assert final_joint.count('b3SolveParallelJoint( joint, context, useBias );') == 1
assert final_parallel.count('void b3SolveParallelJoint( b3JointSim* base, b3StepContext* context, bool useBias )') == 1
assert final_parallel.count('if ( useBias )') >= 1
assert final_parallel.count('if ( joint->enableLinearAxisGuide )') == 2

print('RQ2C4_PARALLEL_HARD_RELAX_PATCH_OK')
