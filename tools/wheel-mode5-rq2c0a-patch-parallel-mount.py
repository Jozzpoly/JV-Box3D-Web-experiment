from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq2c0a-patch-parallel-mount.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# RQ2c0a deliberately clones the already-composed RQ0 planar-axle helper.
# The single primary apparatus change is angular guidance:
#   old: wheel body world-axis angular X/Y locks
#   new: static local-axis reference + b3ParallelJoint
# Linear Z remains locked in both cases so lateral guidance is not changed in
# the same experiment. Longitudinal X, vertical Y and axle spin Z remain free.
comment_marker = '// RQ0 representative steady-rolling baseline.'
function_signature = 'static val rq0RunOuterP75SteadyRolling( float speedMetersPerSecond, float friction, bool matchedSpin )'

if text.count(comment_marker) != 1 or text.count(function_signature) != 1:
    raise SystemExit('RQ2c0a requires exactly one composed RQ0 helper')

block_start = text.index(comment_marker)
function_start = text.index(function_signature, block_start)
brace_start = text.index('{', function_start)

depth = 0
function_end = None
for i in range(brace_start, len(text)):
    ch = text[i]
    if ch == '{':
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            function_end = i + 1
            break

if function_end is None:
    raise SystemExit('RQ2c0a could not find the end of the RQ0 helper')

source = text[block_start:function_end]
clone = source.replace('rq0RunOuterP75SteadyRolling', 'rq2c0aRunOuterP75ParallelMount')
clone = clone.replace('// RQ0 representative steady-rolling baseline.', '// RQ2c0a local-axis mount equivalence probe.')

old_mount = '''    // RQ0 apparatus correction: emulate an ideal planar axle guide without
    // teleporting the body or changing contact/recycler semantics. The wheel
    // remains dynamic in longitudinal X, vertical Y and spin around axle Z.
    wheelBodyDef.motionLocks.linearZ = true;
    wheelBodyDef.motionLocks.angularX = true;
    wheelBodyDef.motionLocks.angularY = true;
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );
'''
new_mount = '''    // RQ2c0a keeps the inherited lateral linear-Z guide so this experiment
    // changes only angular mounting semantics. The wheel itself has no angular
    // world-axis locks. A ParallelJoint aligns its LOCAL axle Z with a static
    // reference Z while leaving translation and spin around that Z unconstrained.
    wheelBodyDef.motionLocks.linearZ = true;
    b3BodyId wheelBody = b3CreateBody( worldId, &wheelBodyDef );

    b3BodyDef axleReferenceDef = b3DefaultBodyDef();
    axleReferenceDef.position = wheelBodyDef.position;
    b3BodyId axleReferenceBody = b3CreateBody( worldId, &axleReferenceDef );

    b3ParallelJointDef axleJointDef = b3DefaultParallelJointDef();
    axleJointDef.base.bodyIdA = axleReferenceBody;
    axleJointDef.base.bodyIdB = wheelBody;
    // Principled hard-like laboratory setting: with dt=1/240 and 4 substeps,
    // 120 Hz equals the engine's 0.125/h contact-stiffness scale. Critical
    // damping avoids selecting stiffness by searching for a desired outcome.
    axleJointDef.hertz = 120.0f;
    axleJointDef.dampingRatio = 1.0f;
    axleJointDef.maxTorque = FLT_MAX;
    b3JointId axleJoint = b3CreateParallelJoint( worldId, &axleJointDef );
'''
if clone.count(old_mount) != 1:
    raise SystemExit(f'RQ2c0a planar mount anchor drifted: expected 1, got {clone.count(old_mount)}')
clone = clone.replace(old_mount, new_mount)

old_valid = '''    if ( b3Shape_IsValid( groundShape ) == false || b3Shape_IsValid( wheelShape ) == false )
'''
new_valid = '''    if ( b3Joint_IsValid( axleJoint ) == false || b3Shape_IsValid( groundShape ) == false ||
         b3Shape_IsValid( wheelShape ) == false )
'''
if clone.count(old_valid) != 1:
    raise SystemExit('RQ2c0a validity anchor drifted')
clone = clone.replace(old_valid, new_valid)

old_metrics = '''    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsVz = 0.0f;
    float settledMaxAbsSlip = 0.0f;
'''
new_metrics = '''    float settledMaxAbsVy = 0.0f;
    float settledMaxAbsVz = 0.0f;
    float settledMaxAbsOmegaX = 0.0f;
    float settledMaxAbsOmegaY = 0.0f;
    float settledMaxAxisTilt = 0.0f;
    float settledMaxAbsSlip = 0.0f;
'''
if clone.count(old_metrics) != 1:
    raise SystemExit('RQ2c0a metric declaration anchor drifted')
clone = clone.replace(old_metrics, new_metrics)

old_sample = '''            b3Vec3 p = b3Body_GetPosition( wheelBody );
            b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
            b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
            float slip = v.x + w.z * supportRadius;
'''
new_sample = '''            b3Vec3 p = b3Body_GetPosition( wheelBody );
            b3Vec3 v = b3Body_GetLinearVelocity( wheelBody );
            b3Vec3 w = b3Body_GetAngularVelocity( wheelBody );
            b3Quat q = b3Body_GetRotation( wheelBody );
            b3Vec3 axleAxis = b3RotateVector( q, b3Vec3_axisZ );
            float axisCosine = b3MaxFloat( -1.0f, b3MinFloat( 1.0f, axleAxis.z ) );
            float axisTilt = acosf( axisCosine );
            float slip = v.x + w.z * supportRadius;
'''
if clone.count(old_sample) != 1:
    raise SystemExit('RQ2c0a sample anchor drifted')
clone = clone.replace(old_sample, new_sample)

old_accum = '''            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
'''
new_accum = '''            settledMaxAbsVy = b3MaxFloat( settledMaxAbsVy, fabsf( v.y ) );
            settledMaxAbsVz = b3MaxFloat( settledMaxAbsVz, fabsf( v.z ) );
            settledMaxAbsOmegaX = b3MaxFloat( settledMaxAbsOmegaX, fabsf( w.x ) );
            settledMaxAbsOmegaY = b3MaxFloat( settledMaxAbsOmegaY, fabsf( w.y ) );
            settledMaxAxisTilt = b3MaxFloat( settledMaxAxisTilt, axisTilt );
            settledMaxAbsSlip = b3MaxFloat( settledMaxAbsSlip, fabsf( slip ) );
'''
if clone.count(old_accum) != 1:
    raise SystemExit('RQ2c0a metric accumulation anchor drifted')
clone = clone.replace(old_accum, new_accum)

old_scope = 'RQ0 fixed flat road; donor dynamic outer P75 wheel profile; planar axle locks; no bore/inner/side validation'
new_scope = 'RQ2c0a fixed flat road; donor dynamic outer P75 wheel profile; linear-Z guide + local-axis ParallelJoint mount; no bore/inner/side validation'
if clone.count(old_scope) != 1:
    raise SystemExit(f'RQ2c0a scope anchor drifted: expected 1, got {clone.count(old_scope)}')
clone = clone.replace(old_scope, new_scope)

old_results = '''    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsVz", settledMaxAbsVz );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
'''
new_results = '''    result.set( "settledMaxAbsVy", settledMaxAbsVy );
    result.set( "settledMaxAbsVz", settledMaxAbsVz );
    result.set( "settledMaxAbsOmegaX", settledMaxAbsOmegaX );
    result.set( "settledMaxAbsOmegaY", settledMaxAbsOmegaY );
    result.set( "settledMaxAxisTilt", settledMaxAxisTilt );
    result.set( "mountHertz", 120.0f );
    result.set( "mountDampingRatio", 1.0f );
    result.set( "settledMaxAbsSlip", settledMaxAbsSlip );
'''
if clone.count(old_results) != 1:
    raise SystemExit('RQ2c0a result anchor drifted')
clone = clone.replace(old_results, new_results)

# Strong composition guard: cloned helper must not retain the angular world locks.
if 'rq2c0aRunOuterP75ParallelMount' not in clone:
    raise SystemExit('RQ2c0a clone rename failed')
if 'wheelBodyDef.motionLocks.angularX = true' in clone or 'wheelBodyDef.motionLocks.angularY = true' in clone:
    raise SystemExit('RQ2c0a clone still contains angular world-axis locks')
if clone.count('b3CreateParallelJoint') != 1:
    raise SystemExit('RQ2c0a clone must contain exactly one ParallelJoint')

namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
if text.count(namespace_end) != 1:
    raise SystemExit('RQ2c0a namespace-end anchor drifted')
text = text.replace(namespace_end, clone + '\n\n' + namespace_end)

binding_anchor = '\tfunction( "rq0RunOuterP75SteadyRolling", &rq0RunOuterP75SteadyRolling );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('RQ2c0a RQ0 binding anchor drifted')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "rq2c0aRunOuterP75ParallelMount", &rq2c0aRunOuterP75ParallelMount );\n',
)

path.write_text(text, encoding='utf-8')
print('RQ2C0A_PARALLEL_MOUNT_PATCH_OK')
