from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2aj-patch-fixed-ground-component-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2afRunFixedGroundWheelMotionTransition( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2aj could not locate E2a2af fixed-ground runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2aj could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2ajRunFixedGroundReprojectionComponents( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2aj function rename failed')

setup_anchor = '    const float angularSpeed = crossingAngularSpeed;\n'
setup_replacement = (
    setup_anchor
    + '    b3E2a2aj_ResetTelemetry();\n'
    + '    b3E2a2aj_SetEnabled( true );\n'
    + '    val componentSamples = val::array();\n'
    + '    int lastComponentSequence = 0;\n'
)
if clone.count(setup_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one setup anchor, found {clone.count(setup_anchor)}')
clone = clone.replace(setup_anchor, setup_replacement, 1)

step_anchor = '        b3World_Step( worldId, dt, subStepCount );\n'
sample_block = r'''        b3World_Step( worldId, dt, subStepCount );

        int componentSequence = b3E2a2aj_GetSequence();
        if ( componentSequence != lastComponentSequence && step >= settleSteps )
        {
            val sample = val::object();
            sample.set( "step", step );
            sample.set( "motionStep", step - settleSteps );
            sample.set( "sequence", componentSequence );
            sample.set( "sequenceDelta", componentSequence - lastComponentSequence );
            int pointCount = b3E2a2aj_GetPointCount();
            sample.set( "pointCount", pointCount );
            val baseSeparations = val::array();
            val centerDots = val::array();
            val anchorADots = val::array();
            val anchorBDots = val::array();
            val recomposedDots = val::array();
            val reprojections = val::array();
            val recycledSeparations = val::array();
            for ( int i = 0; i < 4; ++i )
            {
                baseSeparations.call<void>( "push", b3E2a2aj_GetBaseSeparation( i ) );
                centerDots.call<void>( "push", b3E2a2aj_GetCenterDot( i ) );
                anchorADots.call<void>( "push", b3E2a2aj_GetAnchorADot( i ) );
                anchorBDots.call<void>( "push", b3E2a2aj_GetAnchorBDot( i ) );
                recomposedDots.call<void>( "push", b3E2a2aj_GetRecomposedDot( i ) );
                reprojections.call<void>( "push", b3E2a2aj_GetReprojection( i ) );
                recycledSeparations.call<void>( "push", b3E2a2aj_GetRecycledSeparation( i ) );
            }
            sample.set( "baseSeparations", baseSeparations );
            sample.set( "centerDots", centerDots );
            sample.set( "anchorADots", anchorADots );
            sample.set( "anchorBDots", anchorBDots );
            sample.set( "recomposedDots", recomposedDots );
            sample.set( "reprojections", reprojections );
            sample.set( "recycledSeparations", recycledSeparations );
            componentSamples.call<void>( "push", sample );
            lastComponentSequence = componentSequence;
        }
'''
if clone.count(step_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one world-step anchor, found {clone.count(step_anchor)}')
clone = clone.replace(step_anchor, sample_block, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "componentTelemetryEnabled", true );\n'
    + '    result.set( "componentTelemetryCallCount", b3E2a2aj_GetCallCount() );\n'
    + '    result.set( "componentSamples", componentSamples );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

return_anchor = '    return result;\n'
return_pos = clone.rfind(return_anchor)
if return_pos < 0:
    raise SystemExit('E2a2aj could not locate final return')
clone = clone[:return_pos] + '    b3E2a2aj_SetEnabled( false );\n' + clone[return_pos:]

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2afRunFixedGroundWheelMotionTransition", &e2a2afRunFixedGroundWheelMotionTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one E2a2af binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2ajRunFixedGroundReprojectionComponents", &e2a2ajRunFixedGroundReprojectionComponents );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AJ_FIXED_GROUND_COMPONENT_BINDING_PATCH_OK')
