from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2m-patch-tilt-lock-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

runner_start_marker = 'static val e2a2RunFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
runner_start = text.find(runner_start_marker)
runner_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', runner_start)
if runner_start < 0 or runner_end < 0:
    raise SystemExit('E2a2m could not locate E2a2 runner')

runner = text[runner_start:runner_end]

# Telemetry-only augmentation applied to both free and tilt-locked variants.
state_anchor = '    b3Vec3 finalAngularVelocity = b3Body_GetAngularVelocity( wheelBody );\n    float mass = b3Body_GetMass( wheelBody );\n'
state_insert = (
    '    b3Vec3 finalAngularVelocity = b3Body_GetAngularVelocity( wheelBody );\n'
    '    b3Quat finalRotation = b3Body_GetRotation( wheelBody );\n'
    '    b3Vec3 finalAxisWorld = b3RotateVector( finalRotation, b3Vec3_axisZ );\n'
    '    float finalAxisTiltDeg = acosf( b3ClampFloat( fabsf( finalAxisWorld.z ), 0.0f, 1.0f ) ) * B3_RAD_TO_DEG;\n'
    '    float mass = b3Body_GetMass( wheelBody );\n'
)
if runner.count(state_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one final state anchor, found {runner.count(state_anchor)}')
runner = runner.replace(state_anchor, state_insert)

result_anchor = '    result.set( "finalAngularZ", finalAngularVelocity.z );\n'
result_insert = (
    '    result.set( "finalAngularX", finalAngularVelocity.x );\n'
    '    result.set( "finalAngularY", finalAngularVelocity.y );\n'
    '    result.set( "finalAngularZ", finalAngularVelocity.z );\n'
    '    result.set( "finalAxisTiltDeg", finalAxisTiltDeg );\n'
)
if runner.count(result_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one final result anchor, found {runner.count(result_anchor)}')
runner = runner.replace(result_anchor, result_insert)

runner_locked = runner.replace('e2a2RunFlatP75GroundCarrier', 'e2a2mRunFlatP75GroundCarrierTiltLocked', 1)
lock_anchor = '    wheelBodyDef.allowFastRotation = true;\n'
lock_insert = (
    lock_anchor +
    '    // E2a2m causal diagnostic: suppress only off-axis tilt while preserving axial roll Z.\n'
    '    wheelBodyDef.motionLocks.angularX = true;\n'
    '    wheelBodyDef.motionLocks.angularY = true;\n'
)
if runner_locked.count(lock_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one allowFastRotation anchor, found {runner_locked.count(lock_anchor)}')
runner_locked = runner_locked.replace(lock_anchor, lock_insert)

text = text[:runner_start] + runner + '\n\n' + runner_locked + text[runner_end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
binding_replacement = binding_anchor + (
    '\tfunction( "e2a2mRunFlatP75GroundCarrierTiltLocked", &e2a2mRunFlatP75GroundCarrierTiltLocked );\n'
)
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2m expected exactly one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E2A2M_TILT_LOCK_BINDINGS_PATCH_OK')
