from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-rq2c0b-set-mount-240.py <bindings.cpp>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# RQ2c0b is a single predeclared stiffness follow-up after RQ2c0a missed the
# unchanged 100 urad axle-tilt gate at 120 Hz. No threshold is relaxed and no
# other body/shape/contact/solver/material parameter changes.
old_name = 'rq2c0aRunOuterP75ParallelMount'
new_name = 'rq2c0bRunOuterP75ParallelMount240'
if text.count(old_name) != 2:
    raise SystemExit(f'RQ2c0b expected function+binding occurrences=2, got {text.count(old_name)}')
text = text.replace(old_name, new_name)

old_scope = 'RQ2c0a fixed flat road; donor dynamic outer P75 wheel profile; linear-Z guide + local-axis ParallelJoint mount; no bore/inner/side validation'
new_scope = 'RQ2c0b fixed flat road; donor dynamic outer P75 wheel profile; linear-Z guide + local-axis ParallelJoint mount at 240 Hz; no bore/inner/side validation'
if text.count(old_scope) != 1:
    raise SystemExit('RQ2c0b scope anchor drifted')
text = text.replace(old_scope, new_scope)

old_hertz = '    axleJointDef.hertz = 120.0f;\n'
new_hertz = '    axleJointDef.hertz = 240.0f;\n'
if text.count(old_hertz) != 1:
    raise SystemExit(f'RQ2c0b hertz anchor drifted: expected 1, got {text.count(old_hertz)}')
text = text.replace(old_hertz, new_hertz)

old_result = '    result.set( "mountHertz", 120.0f );\n'
new_result = '    result.set( "mountHertz", 240.0f );\n'
if text.count(old_result) != 1:
    raise SystemExit('RQ2c0b mountHertz result anchor drifted')
text = text.replace(old_result, new_result)

old_comment = '''    // Principled hard-like laboratory setting: with dt=1/240 and 4 substeps,
    // 120 Hz equals the engine's 0.125/h contact-stiffness scale. Critical
    // damping avoids selecting stiffness by searching for a desired outcome.
'''
new_comment = '''    // RQ2c0b predeclared follow-up: exactly 2x the principled 120 Hz starting
    // point after that candidate missed the unchanged 100 urad tilt gate.
    // Critical damping and every other apparatus parameter remain unchanged.
'''
if text.count(old_comment) != 1:
    raise SystemExit('RQ2c0b mount comment anchor drifted')
text = text.replace(old_comment, new_comment)

if 'wheelBodyDef.motionLocks.angularX = true' in text[text.index(new_name):text.index(new_name)+16000]:
    raise SystemExit('RQ2c0b challenge unexpectedly regained angular world-axis lock X')
if 'wheelBodyDef.motionLocks.angularY = true' in text[text.index(new_name):text.index(new_name)+16000]:
    raise SystemExit('RQ2c0b challenge unexpectedly regained angular world-axis lock Y')

path.write_text(text, encoding='utf-8')
print('RQ2C0B_MOUNT_240_PATCH_OK')
