from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('usage: python wheel-mode5-e2a2aj-patch-reprojection-components.py <physics_world.c> <bindings.cpp>')

physics_path = Path(sys.argv[1])
bindings_path = Path(sys.argv[2])
physics = physics_path.read_text(encoding='utf-8')
bindings = bindings_path.read_text(encoding='utf-8')

# E2a2aj is diagnostic-only and is applied after E2a2ah. It decomposes the
# already-observed recycled reprojection term without changing the live manifold.
global_anchor = 'static float b3_e2a2ahShadowMatchedFreshSeparation[4];\n'
global_patch = global_anchor + '''static float b3_e2a2ajCenterDot[4];\nstatic float b3_e2a2ajAnchorADot[4];\nstatic float b3_e2a2ajAnchorBDot[4];\nstatic float b3_e2a2ajRecomposedDot[4];\n'''
if physics.count(global_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one E2a2ah global anchor, found {physics.count(global_anchor)}')
physics = physics.replace(global_anchor, global_patch, 1)

# E2a2ah clears its point telemetry both in the public reset helper and before
# recording a new recycled sample. Clear the decomposition alongside both sites.
reset_anchor = '\t\tb3_e2a2ahShadowMatchedFreshSeparation[i] = 0.0f;\n'
reset_patch = reset_anchor + '''\t\tb3_e2a2ajCenterDot[i] = 0.0f;\n\t\tb3_e2a2ajAnchorADot[i] = 0.0f;\n\t\tb3_e2a2ajAnchorBDot[i] = 0.0f;\n\t\tb3_e2a2ajRecomposedDot[i] = 0.0f;\n'''
reset_count = physics.count(reset_anchor)
if reset_count != 2:
    raise SystemExit(f'E2a2aj expected two E2a2ah reset anchors, found {reset_count}')
physics = physics.replace(reset_anchor, reset_patch)

getter_anchor = 'float b3E2a2ah_GetShadowMatchedFreshSeparation( int index ) { return index >= 0 && index < 4 ? b3_e2a2ahShadowMatchedFreshSeparation[index] : 0.0f; }\n'
getter_patch = getter_anchor + '''float b3E2a2aj_GetCenterDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajCenterDot[index] : 0.0f; }\nfloat b3E2a2aj_GetAnchorADot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajAnchorADot[index] : 0.0f; }\nfloat b3E2a2aj_GetAnchorBDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajAnchorBDot[index] : 0.0f; }\nfloat b3E2a2aj_GetRecomposedDot( int index ) { return index >= 0 && index < 4 ? b3_e2a2ajRecomposedDot[index] : 0.0f; }\n'''
if physics.count(getter_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one getter anchor, found {physics.count(getter_anchor)}')
physics = physics.replace(getter_anchor, getter_patch, 1)

calc_anchor = '''\t\t\t\t\t\t\tb3Vec3 rA = b3MulMV( matrixA, mp->anchorA );\n\t\t\t\t\t\t\tb3Vec3 rB = b3MulMV( matrixB, mp->anchorB );\n\t\t\t\t\t\t\tb3Vec3 dp = b3Add( dc, b3Sub( rB, rA ) );\n\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n'''
calc_patch = '''\t\t\t\t\t\t\tb3Vec3 rA = b3MulMV( matrixA, mp->anchorA );\n\t\t\t\t\t\t\tb3Vec3 rB = b3MulMV( matrixB, mp->anchorB );\n\t\t\t\t\t\t\tb3Vec3 dp = b3Add( dc, b3Sub( rB, rA ) );\n\t\t\t\t\t\t\tfloat e2a2ajCenterDot = b3Dot( dc, normal );\n\t\t\t\t\t\t\tfloat e2a2ajAnchorADot = -b3Dot( rA, normal );\n\t\t\t\t\t\t\tfloat e2a2ajAnchorBDot = b3Dot( rB, normal );\n\t\t\t\t\t\t\tfloat e2a2ajRecomposedDot = e2a2ajCenterDot + e2a2ajAnchorADot + e2a2ajAnchorBDot;\n\t\t\t\t\t\t\tif ( b3_e2a2ahShadowFreshEnabled && pointIndex < 4 )\n\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\tb3_e2a2ajCenterDot[pointIndex] = e2a2ajCenterDot;\n\t\t\t\t\t\t\t\tb3_e2a2ajAnchorADot[pointIndex] = e2a2ajAnchorADot;\n\t\t\t\t\t\t\t\tb3_e2a2ajAnchorBDot[pointIndex] = e2a2ajAnchorBDot;\n\t\t\t\t\t\t\t\tb3_e2a2ajRecomposedDot[pointIndex] = e2a2ajRecomposedDot;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tmp->separation = mp->baseSeparation + b3Dot( dp, normal );\n'''
if physics.count(calc_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one recycler calculation anchor, found {physics.count(calc_anchor)}')
physics = physics.replace(calc_anchor, calc_patch, 1)

extern_anchor = 'float b3E2a2ah_GetShadowMatchedFreshSeparation( int index );\n'
extern_patch = extern_anchor + '''float b3E2a2aj_GetCenterDot( int index );\nfloat b3E2a2aj_GetAnchorADot( int index );\nfloat b3E2a2aj_GetAnchorBDot( int index );\nfloat b3E2a2aj_GetRecomposedDot( int index );\n'''
if bindings.count(extern_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one extern anchor, found {bindings.count(extern_anchor)}')
bindings = bindings.replace(extern_anchor, extern_patch, 1)

array_anchor = '            val matchedFreshSeparations = val::array();\n'
array_patch = array_anchor + '''            val centerDots = val::array();\n            val anchorADots = val::array();\n            val anchorBDots = val::array();\n            val recomposedDots = val::array();\n'''
if bindings.count(array_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one array anchor, found {bindings.count(array_anchor)}')
bindings = bindings.replace(array_anchor, array_patch, 1)

push_anchor = '                matchedFreshSeparations.call<void>( "push", b3E2a2ah_GetShadowMatchedFreshSeparation( i ) );\n'
push_patch = push_anchor + '''                centerDots.call<void>( "push", b3E2a2aj_GetCenterDot( i ) );\n                anchorADots.call<void>( "push", b3E2a2aj_GetAnchorADot( i ) );\n                anchorBDots.call<void>( "push", b3E2a2aj_GetAnchorBDot( i ) );\n                recomposedDots.call<void>( "push", b3E2a2aj_GetRecomposedDot( i ) );\n'''
if bindings.count(push_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one push anchor, found {bindings.count(push_anchor)}')
bindings = bindings.replace(push_anchor, push_patch, 1)

set_anchor = '            sample.set( "matchedFreshSeparations", matchedFreshSeparations );\n'
set_patch = set_anchor + '''            sample.set( "centerDots", centerDots );\n            sample.set( "anchorADots", anchorADots );\n            sample.set( "anchorBDots", anchorBDots );\n            sample.set( "recomposedDots", recomposedDots );\n'''
if bindings.count(set_anchor) != 1:
    raise SystemExit(f'E2a2aj expected one sample-set anchor, found {bindings.count(set_anchor)}')
bindings = bindings.replace(set_anchor, set_patch, 1)

physics_path.write_text(physics, encoding='utf-8')
bindings_path.write_text(bindings, encoding='utf-8')
print('E2A2AJ_REPROJECTION_COMPONENT_PATCH_OK')
