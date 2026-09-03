from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2e-patch-bindings.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_marker = 'static val e2a2dRunFlatP75GroundCarrierLockedSubsteps( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )\n'
namespace_end = '} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n'
start = text.find(start_marker)
end = text.find('\n' + namespace_end, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2e could not locate E2a2d runner')
runner = text[start:end]

sphere = runner.replace(
    'e2a2dRunFlatP75GroundCarrierLockedSubsteps( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )',
    'e2a2eRunMatchedSphereGroundControl( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, bool contactRecycling, float timeStep, int requestedStepCount, int requestedSubStepCount )',
    1,
)

shape_block = '''    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = 0.0f;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;
    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );
'''

sphere_block = '''    b3ShapeDef wheelShapeDef = b3DefaultShapeDef();
    wheelShapeDef.baseMaterial.friction = 0.0f;
    wheelShapeDef.baseMaterial.restitution = 0.0f;
    wheelShapeDef.density = 1.0f;

    // First create the exact P75 plateau carrier only to capture its rigid-body
    // mass/inertia. Then replace the collision shape with a sphere and restore
    // those mass data. The control therefore changes contact geometry semantics,
    // not the body's mass/inertia or motion locks.
    b3ShapeId referenceWheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );
    if ( b3Shape_IsValid( referenceWheelShape ) == false )
    {
        b3DestroyWorld( worldId );
        result.set( "valid", false );
        return result;
    }
    b3MassData referenceMassData = b3Body_GetMassData( wheelBody );
    b3DestroyShape( referenceWheelShape, true );

    b3Sphere sphereShape = {};
    sphereShape.center = e1Vec( 0.0f, 0.0f, 0.0f );
    sphereShape.radius = supportRadius;
    b3ShapeId wheelShape = b3CreateSphereShape( wheelBody, &wheelShapeDef, &sphereShape );
    b3Body_SetMassData( wheelBody, referenceMassData );
'''

if sphere.count(shape_block) != 1:
    raise SystemExit('E2a2e shape block drifted')
sphere = sphere.replace(shape_block, sphere_block)

result_anchor = '    result.set( "attitudeLocked", true );\n'
if sphere.count(result_anchor) != 1:
    raise SystemExit('E2a2e result anchor drifted')
sphere = sphere.replace(result_anchor, result_anchor +
    '    result.set( "shapeControl", "matchedSphere" );\n'
    '    result.set( "sphereRadius", supportRadius );\n')

text = text[:end] + '\n' + sphere + text[end:]

binding_anchor = '\tfunction( "e2a2dRunFlatP75GroundCarrierLockedSubsteps", &e2a2dRunFlatP75GroundCarrierLockedSubsteps );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit('E2a2e binding anchor drifted')
text = text.replace(binding_anchor, binding_anchor +
    '\tfunction( "e2a2eRunMatchedSphereGroundControl", &e2a2eRunMatchedSphereGroundControl );\n')

path.write_text(text, encoding='utf-8')
print('E2A2E_BINDINGS_PATCH_OK')
