from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2ah-patch-fixed-ground-shadow-fresh-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

sig = 'static val e2a2afRunFixedGroundWheelMotionTransition( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
start = text.find(sig)
if start < 0:
    raise SystemExit('E2a2ah could not locate E2a2af fixed-ground runner')
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', start)
if namespace_end < 0:
    raise SystemExit('E2a2ah could not locate namespace end')
runner = text[start:namespace_end]

new_sig = 'static val e2a2ahRunFixedGroundShadowFreshDiagnostic( float spinRadiansPerSecond, int direction, float recycleDistance, float crossingAngularSpeed )\n'
clone = runner.replace(sig, new_sig, 1)
if clone == runner:
    raise SystemExit('E2a2ah function rename failed')

setup_anchor = '    const float angularSpeed = crossingAngularSpeed;\n'
setup_replacement = (
    setup_anchor
    + '    b3E2a2ah_ResetShadowFreshTelemetry();\n'
    + '    b3E2a2ah_SetShadowFreshEnabled( true );\n'
    + '    val shadowSamples = val::array();\n'
    + '    int lastShadowSequence = 0;\n'
)
if clone.count(setup_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one setup anchor, found {clone.count(setup_anchor)}')
clone = clone.replace(setup_anchor, setup_replacement, 1)

step_anchor = '        b3World_Step( worldId, dt, subStepCount );\n'
sample_block = r'''        b3World_Step( worldId, dt, subStepCount );

        int shadowSequence = b3E2a2ah_GetShadowSequence();
        // The validated fixed-road 2->1 transition can occur in the post-motion
        // settling tail (around step 430, while the command window ends at 420).
        // Capture every changed shadow sample from the start of motion onward so
        // the diagnostic spans the actual transition without changing simulation.
        if ( shadowSequence != lastShadowSequence && step >= settleSteps )
        {
            val sample = val::object();
            sample.set( "step", step );
            sample.set( "motionStep", step - settleSteps );
            sample.set( "sequence", shadowSequence );
            sample.set( "sequenceDelta", shadowSequence - lastShadowSequence );
            sample.set( "freshTouching", b3E2a2ah_GetShadowFreshTouching() != 0 );
            sample.set( "freshPointCount", b3E2a2ah_GetShadowFreshPointCount() );
            sample.set( "recycledPointCount", b3E2a2ah_GetShadowRecycledPointCount() );
            sample.set( "matchedPointCount", b3E2a2ah_GetShadowMatchedPointCount() );

            val activeFeatures = val::array();
            val freshFeatures = val::array();
            val baseSeparations = val::array();
            val reprojections = val::array();
            val recycledSeparations = val::array();
            val matchedFreshSeparations = val::array();
            for ( int i = 0; i < 4; ++i )
            {
                activeFeatures.call<void>( "push", b3E2a2ah_GetShadowActiveFeature( i ) );
                freshFeatures.call<void>( "push", b3E2a2ah_GetShadowFreshFeature( i ) );
                baseSeparations.call<void>( "push", b3E2a2ah_GetShadowBaseSeparation( i ) );
                reprojections.call<void>( "push", b3E2a2ah_GetShadowReprojection( i ) );
                recycledSeparations.call<void>( "push", b3E2a2ah_GetShadowRecycledSeparation( i ) );
                matchedFreshSeparations.call<void>( "push", b3E2a2ah_GetShadowMatchedFreshSeparation( i ) );
            }
            sample.set( "activeFeatures", activeFeatures );
            sample.set( "freshFeatures", freshFeatures );
            sample.set( "baseSeparations", baseSeparations );
            sample.set( "reprojections", reprojections );
            sample.set( "recycledSeparations", recycledSeparations );
            sample.set( "matchedFreshSeparations", matchedFreshSeparations );
            shadowSamples.call<void>( "push", sample );
            lastShadowSequence = shadowSequence;
        }
'''
if clone.count(step_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one world-step anchor, found {clone.count(step_anchor)}')
clone = clone.replace(step_anchor, sample_block, 1)

result_anchor = '    result.set( "crossingAngularSpeed", crossingAngularSpeed );\n'
result_replacement = (
    result_anchor
    + '    result.set( "shadowFreshEnabled", true );\n'
    + '    result.set( "shadowFreshCallCount", b3E2a2ah_GetShadowCallCount() );\n'
    + '    result.set( "shadowSamples", shadowSamples );\n'
)
if clone.count(result_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one result anchor, found {clone.count(result_anchor)}')
clone = clone.replace(result_anchor, result_replacement, 1)

return_anchor = '    return result;\n'
return_pos = clone.rfind(return_anchor)
if return_pos < 0:
    raise SystemExit('E2a2ah could not locate final return')
clone = clone[:return_pos] + '    b3E2a2ah_SetShadowFreshEnabled( false );\n' + clone[return_pos:]

text = text[:namespace_end] + '\n' + clone + text[namespace_end:]

binding_anchor = '\tfunction( "e2a2afRunFixedGroundWheelMotionTransition", &e2a2afRunFixedGroundWheelMotionTransition );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2ah expected one E2a2af binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2ahRunFixedGroundShadowFreshDiagnostic", &e2a2ahRunFixedGroundShadowFreshDiagnostic );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2AH_FIXED_GROUND_SHADOW_FRESH_BINDING_PATCH_OK')
