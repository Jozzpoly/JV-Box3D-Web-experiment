from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2af-patch-fixed-ground-wheel-motion-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2zRunStaticGroundRateSweep( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2af could not locate E2a2z runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2af could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2afRunFixedGroundWheelMotionTransition( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
clone = runner.replace(sig, new_sig, 1)

# Ground is genuinely fixed and never transformed after creation.
old_ground_rot = '''    float groundHalf = 0.5f * initialAngle;\n    b3Quat groundInitialRotation = { { sinf( groundHalf ), 0.0f, 0.0f }, cosf( groundHalf ) };\n'''
new_ground_rot = '''    b3Quat groundInitialRotation = b3Quat_identity;\n'''
if clone.count(old_ground_rot) != 1:
    raise SystemExit(f'E2a2af ground rotation anchor drifted: {clone.count(old_ground_rot)}')
clone = clone.replace(old_ground_rot, new_ground_rot, 1)

# Give the dynamic wheel the inverse initial crossing tilt. Its spin axis is rotated with
# the tilt so q follows approximately Rx(-a) * Rz(theta), preserving the same relative
# flat-carrier support crossing while the road remains fixed.
old_wheel = '''    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + 0.010f, 0.0f );\n    wheelBodyDef.angularVelocity = e1Vec( 0.0f, 0.0f, spinRadiansPerSecond );\n    wheelBodyDef.enableSleep = false;\n    wheelBodyDef.allowFastRotation = true;\n    wheelBodyDef.motionLocks.angularX = true;\n    wheelBodyDef.motionLocks.angularY = true;\n'''
new_wheel = '''    wheelBodyDef.position = e1Vec( 0.0f, supportRadius + 0.010f, 0.0f );\n    float wheelHalf = -0.5f * initialAngle;\n    wheelBodyDef.rotation = { { sinf( wheelHalf ), 0.0f, 0.0f }, cosf( wheelHalf ) };\n    wheelBodyDef.angularVelocity = e1Vec( 0.0f, spinRadiansPerSecond * sinf( initialAngle ), spinRadiansPerSecond * cosf( initialAngle ) );\n    wheelBodyDef.enableSleep = false;\n    wheelBodyDef.allowFastRotation = true;\n    wheelBodyDef.motionLocks.angularX = false;\n    wheelBodyDef.motionLocks.angularY = false;\n'''
if clone.count(old_wheel) != 1:
    raise SystemExit(f'E2a2af wheel definition anchor drifted: {clone.count(old_wheel)}')
clone = clone.replace(old_wheel, new_wheel, 1)

old_motion = '''        if ( step >= settleSteps && step < settleSteps + motionSteps )\n        {\n            int motionIndex = step - settleSteps + 1;\n            float targetAngle = initialAngle + commandedAngularX * dt * (float)motionIndex;\n            float targetHalf = 0.5f * targetAngle;\n            b3Quat targetRotation = { { sinf( targetHalf ), 0.0f, 0.0f }, cosf( targetHalf ) };\n            b3Body_SetTransform( groundBody, groundBodyDef.position, targetRotation );\n        }\n\n        b3World_Step( worldId, dt, subStepCount );\n'''
new_motion = '''        float commandedAngle = initialAngle;\n        float commandedTiltRate = 0.0f;\n        if ( step >= settleSteps && step < settleSteps + motionSteps )\n        {\n            int motionIndex = step - settleSteps;\n            commandedAngle = initialAngle + commandedAngularX * dt * (float)motionIndex;\n            commandedTiltRate = commandedAngularX;\n        }\n        else if ( step >= settleSteps + motionSteps )\n        {\n            commandedAngle = initialAngle + commandedAngularX * dt * (float)motionSteps;\n        }\n\n        // q_target family: Rx(-a) * Rz(theta). The corresponding world angular velocity is\n        // -aDot * X + Rx(-a) * (spin * Z). Re-commanding velocity does not teleport the body.\n        b3Vec3 wheelAngularVelocity = e1Vec(\n            -commandedTiltRate,\n            spinRadiansPerSecond * sinf( commandedAngle ),\n            spinRadiansPerSecond * cosf( commandedAngle ) );\n        b3Body_SetAngularVelocity( wheelBody, wheelAngularVelocity );\n\n        b3World_Step( worldId, dt, subStepCount );\n'''
if clone.count(old_motion) != 1:
    raise SystemExit(f'E2a2af static-ground motion anchor drifted: {clone.count(old_motion)}')
clone = clone.replace(old_motion, new_motion, 1)

old_angle = '''        b3Quat groundRotation = b3Body_GetRotation( groundBody );\n        b3Vec3 groundUp = b3RotateVector( groundRotation, b3Vec3_axisY );\n        float angle = atan2f( groundUp.z, groundUp.y );\n        float axial = fabsf( groundUp.z );\n'''
new_angle = '''        b3Quat wheelRotation = b3Body_GetRotation( wheelBody );\n        b3Vec3 groundUpWheelLocal = b3InvRotateVector( wheelRotation, b3Vec3_axisY );\n        float angle = atan2f( groundUpWheelLocal.z, groundUpWheelLocal.y );\n        float axial = fabsf( groundUpWheelLocal.z );\n'''
if clone.count(old_angle) != 1:
    raise SystemExit(f'E2a2af telemetry angle anchor drifted: {clone.count(old_angle)}')
clone = clone.replace(old_angle, new_angle, 1)

# Final ground remains identity; report actual final relative angle from wheel-local ground normal.
old_final = '''    b3Quat finalGroundRotation = b3Body_GetRotation( groundBody );\n    b3Vec3 finalGroundUp = b3RotateVector( finalGroundRotation, b3Vec3_axisY );\n    float finalGroundAngle = atan2f( finalGroundUp.z, finalGroundUp.y );\n'''
new_final = '''    b3Quat finalWheelRotation = b3Body_GetRotation( wheelBody );\n    b3Vec3 finalGroundUpWheelLocal = b3InvRotateVector( finalWheelRotation, b3Vec3_axisY );\n    float finalGroundAngle = atan2f( finalGroundUpWheelLocal.z, finalGroundUpWheelLocal.y );\n'''
if clone.count(old_final) != 1:
    raise SystemExit(f'E2a2af final telemetry anchor drifted: {clone.count(old_final)}')
clone = clone.replace(old_final, new_final, 1)

# Remove inherited static-ground SetTransform claims and replace with explicit external-validity metadata.
old_meta = '''    result.set( "groundBodyStatic", true );\n    result.set( "groundMotionMode", "SET_TRANSFORM_BEFORE_STEP" );\n    result.set( "groundTransformSetCount", motionSteps );\n    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'''
new_meta = '''    result.set( "groundBodyStatic", true );\n    result.set( "groundMotionMode", "FIXED_IDENTITY_NO_TRANSFORM" );\n    result.set( "groundTransformSetCount", 0 );\n    result.set( "wheelMotionMode", "DYNAMIC_BODY_ANGULAR_VELOCITY_COMMAND" );\n    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'''
if clone.count(old_meta) != 1:
    raise SystemExit(f'E2a2af result metadata anchor drifted: {clone.count(old_meta)}')
clone = clone.replace(old_meta, new_meta, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2zRunStaticGroundRateSweep", &e2a2zRunStaticGroundRateSweep );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2af binding anchor drifted: {text.count(binding_anchor)}')
text = text.replace(binding_anchor, binding_anchor + '\tfunction( "e2a2afRunFixedGroundWheelMotionTransition", &e2a2afRunFixedGroundWheelMotionTransition );\n', 1)

path.write_text(text, encoding='utf-8')
print('E2A2AF_FIXED_GROUND_WHEEL_MOTION_BINDING_PATCH_OK')
