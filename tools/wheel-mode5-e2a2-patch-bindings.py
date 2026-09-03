from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

include_anchor = '#include "e1_annular_profile.h"\n'
if text.count(include_anchor) != 1:
    raise SystemExit('E2a2 include anchor drifted; apply after E1 patch')
text = text.replace(include_anchor, include_anchor + '#include "e2a2_flat_support.h"\n')

runner_start_marker = 'static val e2aRunOuterP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
runner_start = text.find(runner_start_marker)
runner_end = text.find('\n' + namespace_end, runner_start)
if runner_start < 0 or runner_end < 0:
    raise SystemExit('E2a2 could not locate the already-patched E2a runner')
runner = text[runner_start:runner_end]
runner2 = runner.replace('e2aRunOuterP75GroundCarrier', 'e2a2RunFlatP75GroundCarrier', 1)
runner2 = runner2.replace('e2aMakeOuterCarrier', 'e2a2MakeFlatCarrier')
if runner2 == runner or 'e2aMakeOuterCarrier' in runner2:
    raise SystemExit('E2a2 runner specialization failed')

helper = r'''

// E2a2 deliberately represents ONLY the true broad flat-ground support segment
// recovered from the P75 outer profile. This is not a full wheel: shoulders,
// bore, inner surface, finite obstacles, side contacts and full tire mass are
// outside this carrier's authority.
static bool e2a2MakeFlatCarrier( b3Wheel* wheelOut, int* rawProfileCountOut, int* effectiveProfileCountOut )
{
    b3Vec2 profile[2] = {
        { E2A2_FLAT_AXIAL_MIN, E2A2_FLAT_RADIUS },
        { E2A2_FLAT_AXIAL_MAX, E2A2_FLAT_RADIUS },
    };
    if ( rawProfileCountOut != nullptr )
    {
        *rawProfileCountOut = 2;
    }

    b3Wheel wheel = b3MakeWheelProfile( e1Vec( 0.0f, 0.0f, 0.0f ), b3Vec3_axisZ, profile, 2, 0.0f );
    b3Vec2 effective[B3_MAX_WHEEL_PROFILE_POINTS];
    int effectiveCount = b3GetWheelProfile( &wheel, effective );
    if ( effectiveProfileCountOut != nullptr )
    {
        *effectiveProfileCountOut = effectiveCount;
    }
    if ( effectiveCount != 2 )
    {
        return false;
    }
    *wheelOut = wheel;
    return true;
}

static val e2a2FlatP75CarrierInfo()
{
    val result = val::object();
    b3Wheel wheel = {};
    int rawCount = 0;
    int effectiveCount = 0;
    if ( e2a2MakeFlatCarrier( &wheel, &rawCount, &effectiveCount ) == false )
    {
        result.set( "valid", false );
        result.set( "rawProfileCount", rawCount );
        result.set( "effectiveProfileCount", effectiveCount );
        return result;
    }

    b3Vec2 profile[B3_MAX_WHEEL_PROFILE_POINTS];
    int count = b3GetWheelProfile( &wheel, profile );
    b3Vec3 supportDown = b3ComputeWheelSupport( &wheel, e1Vec( 0.0f, -1.0f, 0.0f ) );

    val profileJs = val::array();
    for ( int i = 0; i < count; ++i )
    {
        val p = val::object();
        p.set( "axial", profile[i].x );
        p.set( "radius", profile[i].y );
        profileJs.set( i, p );
    }

    result.set( "valid", true );
    result.set( "rawProfileCount", rawCount );
    result.set( "effectiveProfileCount", effectiveCount );
    result.set( "sourceLeftStation", E2A2_FLAT_LEFT_STATION );
    result.set( "sourceRightStation", E2A2_FLAT_RIGHT_STATION );
    result.set( "plateauAxialMin", profile[0].x );
    result.set( "plateauAxialMax", profile[1].x );
    result.set( "supportRadiusDown", -supportDown.y );
    result.set( "supportAxialDown", supportDown.z );
    result.set( "wheelRadius", wheel.radius );
    result.set( "wheelHalfWidth", wheel.halfWidth );
    result.set( "profile", profileJs );
    return result;
}
'''

insert = helper + '\n' + runner2
text = text[:runner_end] + '\n' + insert + text[runner_end:]

binding_anchor = '\tfunction( "e2aRunOuterP75GroundCarrier", &e2aRunOuterP75GroundCarrier );\n'
binding_replacement = binding_anchor + (
    '\tfunction( "e2a2FlatP75CarrierInfo", &e2a2FlatP75CarrierInfo );\n'
    '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
)
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2 binding anchor drifted; apply after E2a patch')
text = text.replace(binding_anchor, binding_replacement)

path.write_text(text, encoding='utf-8')
print('E2A2_BINDINGS_PATCH_OK')
