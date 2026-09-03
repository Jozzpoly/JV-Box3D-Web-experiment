from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2y-patch-static-ground-transform-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2vRunDynamicSupportTransitionRecycleControl( float spinRadiansPerSecond, int direction, float recycleDistance )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2y could not locate E2a2v runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2y could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2yRunStaticGroundTransformTransition( float spinRadiansPerSecond, int direction, float recycleDistance )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2y function rename failed')

old_type = '    groundBodyDef.type = b3_kinematicBody;\n'
new_type = '    groundBodyDef.type = b3_staticBody;\n'
if clone.count(old_type) != 1:
    raise SystemExit(f'E2a2y expected one kinematic body type, found {clone.count(old_type)}')
clone = clone.replace(old_type, new_type, 1)

old_motion = '''        if ( step == settleSteps )
        {
            b3Body_SetAngularVelocity( groundBody, e1Vec( commandedAngularX, 0.0f, 0.0f ) );
        }
        if ( step == settleSteps + motionSteps )
        {
            b3Body_SetAngularVelocity( groundBody, b3Vec3_zero );
        }

        b3World_Step( worldId, dt, subStepCount );
'''
new_motion = '''        if ( step >= settleSteps && step < settleSteps + motionSteps )
        {
            int motionIndex = step - settleSteps + 1;
            float targetAngle = initialAngle + commandedAngularX * dt * (float)motionIndex;
            float targetHalf = 0.5f * targetAngle;
            b3Quat targetRotation = { { sinf( targetHalf ), 0.0f, 0.0f }, cosf( targetHalf ) };
            b3Body_SetTransform( groundBody, e1Pos( 0.0, -0.10, 0.0 ), targetRotation );
        }

        b3World_Step( worldId, dt, subStepCount );
'''
if clone.count(old_motion) != 1:
    raise SystemExit(f'E2a2y expected one kinematic motion block, found {clone.count(old_motion)}')
clone = clone.replace(old_motion, new_motion, 1)

result_anchor = '    result.set( "requestedRecycleDistance", recycleDistance );\n'
result_replacement = (
    result_anchor
    + '    result.set( "groundBodyStatic", true );\n'
    + '    result.set( "groundMotionMode", "SET_TRANSFORM_BEFORE_STEP" );\n'
    + '    result.set( "groundTransformSetCount", motionSteps );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2y expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2vRunDynamicSupportTransitionRecycleControl", &e2a2vRunDynamicSupportTransitionRecycleControl );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2y expected one binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2yRunStaticGroundTransformTransition", &e2a2yRunStaticGroundTransformTransition );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2Y_STATIC_GROUND_TRANSFORM_BINDING_PATCH_OK')
