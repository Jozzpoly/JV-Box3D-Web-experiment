from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2q-patch-coupled-two-point-lcp.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

header_anchor = '#define FIXED_ANCHORS 1\n'
if text.count(header_anchor) != 1:
    raise SystemExit(f'E2a2q expected exactly one FIXED_ANCHORS anchor, found {text.count(header_anchor)}')

counter_code = '''#define FIXED_ANCHORS 1

// E2a2q DIAGNOSTIC ONLY. The experiment runs with workerCount=1.
// These counters prove whether the coupled pair path actually executed.
static int e2a2q_pairSolveCalls = 0;

void b3E2a2qResetPairSolveCounter( void )
{
    e2a2q_pairSolveCalls = 0;
}

int b3E2a2qGetPairSolveCounter( void )
{
    return e2a2q_pairSolveCalls;
}
'''
text = text.replace(header_anchor, counter_code, 1)

block_marker = '\t\t// E2a2p DIAGNOSTIC ONLY: simultaneous/Jacobi solve for the first two normal points.\n'
block_start = text.find(block_marker)
if block_start < 0:
    raise SystemExit('E2a2q requires normalized E2a2p simultaneous block first')
block_end_marker = '\n\t\t// Preserve the pinned sequential path for any points beyond the first pair.\n'
block_end = text.find(block_end_marker, block_start)
if block_end < 0:
    raise SystemExit('E2a2q could not isolate E2a2p first-pair block')
block = text[block_start:block_end]

old_start_marker = '\t\t\tb3FloatW negImpulse0 = b3AddW(\n'
old_end_marker = '\n\t\t\tcp0->normalImpulses = newImpulse0;\n'
old_start = block.find(old_start_marker)
old_end = block.find(old_end_marker, old_start)
if old_start < 0 or old_end < 0:
    raise SystemExit('E2a2q could not isolate E2a2p impulse computation')

replacement = '''            // E2a2q DIAGNOSTIC ONLY: coupled 2x2 normal mini-LCP.
            // K follows the pinned 3D normal Jacobian exactly. For K01=0 this
            // reduces to the existing scalar soft-step update for each point.
            b3FloatW b0 = b3AddW( b3MulW( pointMassScale0, vn0 ), bias0 );
            b3FloatW b1 = b3AddW( b3MulW( pointMassScale1, vn1 ), bias1 );

            // Keep the exact uncoupled simultaneous/Jacobi result as a fallback
            // for one-point lanes, inactive second points, or poor conditioning.
            b3FloatW negImpulse0 = b3AddW( b3MulW( cp0->normalMasses, b0 ),
                                           b3MulW( pointImpulseScale0, cp0->normalImpulses ) );
            b3FloatW negImpulse1 = b3AddW( b3MulW( cp1->normalMasses, b1 ),
                                           b3MulW( pointImpulseScale1, cp1->normalImpulses ) );
            b3FloatW scalarImpulse0 = b3MaxW( b3SubW( cp0->normalImpulses, negImpulse0 ), b3ZeroW() );
            b3FloatW scalarImpulse1 = b3MaxW( b3SubW( cp1->normalImpulses, negImpulse1 ), b3ZeroW() );

            b3Vec3W rnA0 = b3CrossW( rA0, c->normal );
            b3Vec3W rnA1 = b3CrossW( rA1, c->normal );
            b3Vec3W rnB0 = b3CrossW( rB0, c->normal );
            b3Vec3W rnB1 = b3CrossW( rB1, c->normal );
            b3FloatW massSum = b3AddW( c->invMassA, c->invMassB );

            b3FloatW k00 = b3AddW( massSum,
                b3AddW( b3DotW( rnA0, b3MulMVW( c->invIA, rnA0 ) ),
                         b3DotW( rnB0, b3MulMVW( c->invIB, rnB0 ) ) ) );
            b3FloatW k11 = b3AddW( massSum,
                b3AddW( b3DotW( rnA1, b3MulMVW( c->invIA, rnA1 ) ),
                         b3DotW( rnB1, b3MulMVW( c->invIB, rnB1 ) ) ) );
            b3FloatW k01 = b3AddW( massSum,
                b3AddW( b3DotW( rnA0, b3MulMVW( c->invIA, rnA1 ) ),
                         b3DotW( rnB0, b3MulMVW( c->invIB, rnB1 ) ) ) );

            b3FloatW det = b3SubW( b3MulW( k00, k11 ), b3MulW( k01, k01 ) );
            b3FloatW active0 = b3GreaterThanW( cp0->normalMasses, b3ZeroW() );
            b3FloatW active1 = b3GreaterThanW( cp1->normalMasses, b3ZeroW() );
            b3FloatW activePair = b3AndW( active0, active1 );
            b3FloatW detGood = b3GreaterThanW( det, epsilonW );
            b3FloatW maxDiag = b3MaxW( k00, k11 );
            b3FloatW conditionGood = b3GreaterThanW(
                b3MulW( b3SplatW( 1000.0f ), det ), b3MulW( maxDiag, maxDiag ) );
            b3FloatW pairEligible = b3AndW( activePair, b3AndW( detGood, conditionGood ) );

            // Direct vectorization of the pinned scalar soft update:
            // x = (1 - impulseScale) * a - K^-1 * b.
            // Therefore the LCP residual is w = K*x + q with
            // q = b - K*((1-impulseScale)*a).
            b3FloatW a0 = cp0->normalImpulses;
            b3FloatW a1 = cp1->normalImpulses;
            b3FloatW alpha0 = b3MulW( b3SubW( oneW, pointImpulseScale0 ), a0 );
            b3FloatW alpha1 = b3MulW( b3SubW( oneW, pointImpulseScale1 ), a1 );
            b3FloatW q0 = b3SubW( b0, b3AddW( b3MulW( k00, alpha0 ), b3MulW( k01, alpha1 ) ) );
            b3FloatW q1 = b3SubW( b1, b3AddW( b3MulW( k01, alpha0 ), b3MulW( k11, alpha1 ) ) );

            b3FloatW safeDet = b3MaxW( det, epsilonW );
            b3FloatW safeK00 = b3MaxW( k00, epsilonW );
            b3FloatW safeK11 = b3MaxW( k11, epsilonW );
            b3FloatW nonnegative = b3SplatW( -1.0e-6f );

            // Case 1: w0 = 0, w1 = 0.
            b3FloatW c1x0 = b3DivW( b3SubW( b3MulW( k01, q1 ), b3MulW( k11, q0 ) ), safeDet );
            b3FloatW c1x1 = b3DivW( b3SubW( b3MulW( k01, q0 ), b3MulW( k00, q1 ) ), safeDet );
            b3FloatW valid1 = b3AndW( b3GreaterThanW( c1x0, nonnegative ),
                                      b3GreaterThanW( c1x1, nonnegative ) );

            // Case 2: w0 = 0, x1 = 0.
            b3FloatW c2x0 = b3DivW( b3NegW( q0 ), safeK00 );
            b3FloatW c2w1 = b3AddW( b3MulW( k01, c2x0 ), q1 );
            b3FloatW valid2 = b3AndW( b3GreaterThanW( c2x0, nonnegative ),
                                      b3GreaterThanW( c2w1, nonnegative ) );

            // Case 3: x0 = 0, w1 = 0.
            b3FloatW c3x1 = b3DivW( b3NegW( q1 ), safeK11 );
            b3FloatW c3w0 = b3AddW( b3MulW( k01, c3x1 ), q0 );
            b3FloatW valid3 = b3AndW( b3GreaterThanW( c3x1, nonnegative ),
                                      b3GreaterThanW( c3w0, nonnegative ) );

            // Case 4: x0 = 0, x1 = 0.
            b3FloatW valid4 = b3AndW( b3GreaterThanW( q0, nonnegative ),
                                      b3GreaterThanW( q1, nonnegative ) );
            b3FloatW anyValid = b3OrW( b3OrW( valid1, valid2 ), b3OrW( valid3, valid4 ) );

            // Priority matches total enumeration: case 1, then 2, then 3, then 4.
            b3FloatW lcp0 = b3ZeroW();
            b3FloatW lcp1 = b3ZeroW();
            lcp1 = b3BlendW( lcp1, c3x1, valid3 );
            lcp0 = b3BlendW( lcp0, c2x0, valid2 );
            lcp0 = b3BlendW( lcp0, c1x0, valid1 );
            lcp1 = b3BlendW( lcp1, c1x1, valid1 );
            lcp0 = b3MaxW( lcp0, b3ZeroW() );
            lcp1 = b3MaxW( lcp1, b3ZeroW() );

            b3FloatW blockMask = b3AndW( pairEligible, anyValid );
            if ( b3AnyTrueW( blockMask ) )
            {
                e2a2q_pairSolveCalls += 1;
            }

            b3FloatW newImpulse0 = b3BlendW( scalarImpulse0, lcp0, blockMask );
            b3FloatW newImpulse1 = b3BlendW( scalarImpulse1, lcp1, blockMask );
            b3FloatW deltaImpulse0 = b3SubW( newImpulse0, cp0->normalImpulses );
            b3FloatW deltaImpulse1 = b3SubW( newImpulse1, cp1->normalImpulses );
'''

block = block[:old_start] + replacement + block[old_end:]
text = text[:block_start] + block + text[block_end:]

path.write_text(text, encoding='utf-8')
print('E2A2Q_COUPLED_TWO_POINT_LCP_PATCH_OK')
