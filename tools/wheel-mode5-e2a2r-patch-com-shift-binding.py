from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2r-patch-com-shift-binding.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

runner_sig = 'static val e2a2RunFlatP75GroundCarrier( int phaseIndex, float spinRadiansPerSecond, bool warmStarting )\n'
runner_start = text.find(runner_sig)
if runner_start < 0:
    raise SystemExit('E2a2r could not locate E2a2 base runner')

next_runner = text.find('\nstatic val ', runner_start + len(runner_sig))
namespace_end = text.find('\n} // namespace\n\nEMSCRIPTEN_BINDINGS( box3d )\n', runner_start)
if namespace_end < 0:
    raise SystemExit('E2a2r could not locate namespace end')
runner_end = next_runner if 0 <= next_runner < namespace_end else namespace_end
runner = text[runner_start:runner_end]

asym_sig = 'static val e2a2rRunFlatP75GroundCarrierComShifted( int phaseIndex, float spinRadiansPerSecond, bool warmStarting, float comShiftZ )\n'
asym = runner.replace(runner_sig, asym_sig, 1)
if asym == runner:
    raise SystemExit('E2a2r function rename failed')

validation_anchor = '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false )\n'
validation_replacement = (
    '    if ( phaseIndex < 0 || phaseIndex >= 256 || b3IsValidFloat( spinRadiansPerSecond ) == false ||\n'
    '         b3IsValidFloat( comShiftZ ) == false || fabsf( comShiftZ ) > 0.10f )\n'
)
if asym.count(validation_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one validation anchor, found {asym.count(validation_anchor)}')
asym = asym.replace(validation_anchor, validation_replacement, 1)

shape_anchor = '    b3ShapeId wheelShape = b3CreateWheelShape( wheelBody, &wheelShapeDef, &wheel );\n\n'
shape_insert = shape_anchor + (
    '    // E2a2r diagnostic-only dynamic asymmetry: preserve mass and inertia but\n'
    '    // translate the body COM along the wheel axis relative to the unchanged\n'
    '    // symmetric flat support geometry. +50 mm remains well inside the\n'
    '    // +/-126.465 mm support interval, so a two-point static load split is\n'
    '    // physically possible without changing manifold geometry.\n'
    '    b3MassData massDataBeforeShift = b3Body_GetMassData( wheelBody );\n'
    '    b3MassData massDataAfterShift = massDataBeforeShift;\n'
    '    massDataAfterShift.center.z += comShiftZ;\n'
    '    b3Body_SetMassData( wheelBody, massDataAfterShift );\n'
    '    massDataAfterShift = b3Body_GetMassData( wheelBody );\n\n'
)
if asym.count(shape_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one wheel-shape anchor, found {asym.count(shape_anchor)}')
asym = asym.replace(shape_anchor, shape_insert, 1)

result_anchor = '    result.set( "mass", mass );\n'
result_insert = result_anchor + (
    '    result.set( "requestedComShiftZ", comShiftZ );\n'
    '    result.set( "originalLocalCenterZ", massDataBeforeShift.center.z );\n'
    '    result.set( "appliedLocalCenterZ", massDataAfterShift.center.z );\n'
)
if asym.count(result_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one mass result anchor, found {asym.count(result_anchor)}')
asym = asym.replace(result_anchor, result_insert, 1)

text = text[:runner_end] + '\n\n' + asym + text[runner_end:]

binding_anchor = '\tfunction( "e2a2RunFlatP75GroundCarrier", &e2a2RunFlatP75GroundCarrier );\n'
if text.count(binding_anchor) != 1:
    raise SystemExit(f'E2a2r expected exactly one E2a2 binding anchor, found {text.count(binding_anchor)}')
text = text.replace(
    binding_anchor,
    binding_anchor + '\tfunction( "e2a2rRunFlatP75GroundCarrierComShifted", &e2a2rRunFlatP75GroundCarrierComShifted );\n',
    1,
)

path.write_text(text, encoding='utf-8')
print('E2A2R_COM_SHIFT_BINDING_PATCH_OK')
