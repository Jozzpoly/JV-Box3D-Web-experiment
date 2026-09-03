from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: python wheel-mode5-e2a2p-patch-simultaneous-two-point-solve.py <contact_solver.c>')

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start_anchor = '''\t\t// todo_erin use the max point count of the four manifolds
\t\tfor ( int pointIndex = 0; pointIndex < B3_MAX_MANIFOLD_POINTS; ++pointIndex )
\t\t{
'''
end_anchor = '''
\t\t// No friction when applying bias
'''
start = text.find(start_anchor)
end = text.find(end_anchor, start)
if start < 0 or end < 0:
    raise SystemExit('E2a2p could not isolate convex normal-impulse solve loop')
if text.find(start_anchor, start + 1) >= 0 and text.find(start_anchor, start + 1) < end:
    raise SystemExit('E2a2p found ambiguous normal-impulse solve loop')

old = text[start:end]
if 'b3Vec3W ds = b3AddVW( dp, b3SubVW( rB, rA ) );' not in old:
    raise SystemExit('E2a2p requires E2a2k-r2 no-rotational-separation counterfactual to be applied first')

new = r'''\t\t// E2a2p DIAGNOSTIC ONLY: simultaneous/Jacobi solve for the first two normal points.
\t\t// Both impulses are computed from the same pre-point body state and then applied together.
\t\t// This removes sequential point-order feedback but is NOT a production block/LCP solver.
\t\t{
\t\t\tb3ContactConstraintPointWide* cp0 = c->points + 0;
\t\t\tb3ContactConstraintPointWide* cp1 = c->points + 1;

\t\t\tb3Vec3W rA0 = cp0->anchorAs;
\t\t\tb3Vec3W rB0 = cp0->anchorBs;
\t\t\tb3Vec3W rA1 = cp1->anchorAs;
\t\t\tb3Vec3W rB1 = cp1->anchorBs;

\t\t\t// E2a2p runs after the E2a2k-r2 no-rotational-separation isolation.
\t\t\tb3Vec3W ds0 = b3AddVW( dp, b3SubVW( rB0, rA0 ) );
\t\t\tb3Vec3W ds1 = b3AddVW( dp, b3SubVW( rB1, rA1 ) );
\t\t\tb3FloatW s0 = b3AddW( b3DotW( c->normal, ds0 ), cp0->baseSeparations );
\t\t\tb3FloatW s1 = b3AddW( b3DotW( c->normal, ds1 ), cp1->baseSeparations );

\t\t\tb3FloatW mask0 = b3GreaterThanW( s0, b3ZeroW() );
\t\t\tb3FloatW mask1 = b3GreaterThanW( s1, b3ZeroW() );
\t\t\tb3FloatW specBias0 = b3MulW( s0, inv_h );
\t\t\tb3FloatW specBias1 = b3MulW( s1, inv_h );
\t\t\tb3FloatW softBias0 = b3MaxW( b3MulW( biasRate, s0 ), contactSpeed );
\t\t\tb3FloatW softBias1 = b3MaxW( b3MulW( biasRate, s1 ), contactSpeed );
\t\t\tb3FloatW bias0 = b3BlendW( softBias0, specBias0, mask0 );
\t\t\tb3FloatW bias1 = b3BlendW( softBias1, specBias1, mask1 );

\t\t\tb3FloatW pointMassScale0 = b3BlendW( massScale, oneW, mask0 );
\t\t\tb3FloatW pointMassScale1 = b3BlendW( massScale, oneW, mask1 );
\t\t\tb3FloatW pointImpulseScale0 = b3BlendW( impulseScale, b3ZeroW(), mask0 );
\t\t\tb3FloatW pointImpulseScale1 = b3BlendW( impulseScale, b3ZeroW(), mask1 );

\t\t\t// Critically, both relative velocities use the same pre-point bA/bB state.
\t\t\tb3Vec3W vrA0 = b3AddVW( bA.v, b3CrossW( bA.w, rA0 ) );
\t\t\tb3Vec3W vrB0 = b3AddVW( bB.v, b3CrossW( bB.w, rB0 ) );
\t\t\tb3Vec3W vrA1 = b3AddVW( bA.v, b3CrossW( bA.w, rA1 ) );
\t\t\tb3Vec3W vrB1 = b3AddVW( bB.v, b3CrossW( bB.w, rB1 ) );
\t\t\tb3FloatW vn0 = b3DotW( b3SubVW( vrB0, vrA0 ), c->normal );
\t\t\tb3FloatW vn1 = b3DotW( b3SubVW( vrB1, vrA1 ), c->normal );

\t\t\tb3FloatW negImpulse0 = b3AddW(
\t\t\t\tb3MulW( cp0->normalMasses, b3AddW( b3MulW( pointMassScale0, vn0 ), bias0 ) ),
\t\t\t\tb3MulW( pointImpulseScale0, cp0->normalImpulses ) );
\t\t\tb3FloatW negImpulse1 = b3AddW(
\t\t\t\tb3MulW( cp1->normalMasses, b3AddW( b3MulW( pointMassScale1, vn1 ), bias1 ) ),
\t\t\t\tb3MulW( pointImpulseScale1, cp1->normalImpulses ) );

\t\t\tb3FloatW newImpulse0 = b3MaxW( b3SubW( cp0->normalImpulses, negImpulse0 ), b3ZeroW() );
\t\t\tb3FloatW newImpulse1 = b3MaxW( b3SubW( cp1->normalImpulses, negImpulse1 ), b3ZeroW() );
\t\t\tb3FloatW deltaImpulse0 = b3SubW( newImpulse0, cp0->normalImpulses );
\t\t\tb3FloatW deltaImpulse1 = b3SubW( newImpulse1, cp1->normalImpulses );

\t\t\tcp0->normalImpulses = newImpulse0;
\t\t\tcp1->normalImpulses = newImpulse1;
\t\t\tcp0->totalNormalImpulses = b3AddW( cp0->totalNormalImpulses, newImpulse0 );
\t\t\tcp1->totalNormalImpulses = b3AddW( cp1->totalNormalImpulses, newImpulse1 );

\t\t\ttotalNormalImpulse = b3AddW( totalNormalImpulse, b3AddW( newImpulse0, newImpulse1 ) );
\t\t\ttotalTwistLimit = b3AddW( totalTwistLimit,
\t\t\t\tb3AddW( b3MulW( cp0->leverArms, newImpulse0 ), b3MulW( cp1->leverArms, newImpulse1 ) ) );

\t\t\tb3Vec3W P0 = b3MulSVW( deltaImpulse0, c->normal );
\t\t\tb3Vec3W P1 = b3MulSVW( deltaImpulse1, c->normal );
\t\t\tb3Vec3W P = b3AddVW( P0, P1 );
\t\t\tb3Vec3W LA = b3AddVW( b3CrossW( rA0, P0 ), b3CrossW( rA1, P1 ) );
\t\t\tb3Vec3W LB = b3AddVW( b3CrossW( rB0, P0 ), b3CrossW( rB1, P1 ) );

\t\t\tbA.w = b3MulSubMVW( bA.w, c->invIA, LA );
\t\t\tbA.v = b3MulSubSVW( bA.v, c->invMassA, P );
\t\t\tbB.w = b3MulAddMVW( bB.w, c->invIB, LB );
\t\t\tbB.v = b3MulAddSVW( bB.v, c->invMassB, P );
\t\t}

\t\t// Preserve the pinned sequential path for any points beyond the first pair.
\t\tfor ( int pointIndex = 2; pointIndex < B3_MAX_MANIFOLD_POINTS; ++pointIndex )
\t\t{
\t\t\tb3ContactConstraintPointWide* cp = c->points + pointIndex;
\t\t\tb3Vec3W rA = cp->anchorAs;
\t\t\tb3Vec3W rB = cp->anchorBs;
\t\t\tb3Vec3W ds = b3AddVW( dp, b3SubVW( rB, rA ) );
\t\t\tb3FloatW s = b3AddW( b3DotW( c->normal, ds ), cp->baseSeparations );
\t\t\tb3FloatW mask = b3GreaterThanW( s, b3ZeroW() );
\t\t\tb3FloatW specBias = b3MulW( s, inv_h );
\t\t\tb3FloatW softBias = b3MaxW( b3MulW( biasRate, s ), contactSpeed );
\t\t\tb3FloatW bias = b3BlendW( softBias, specBias, mask );
\t\t\tb3FloatW pointMassScale = b3BlendW( massScale, oneW, mask );
\t\t\tb3FloatW pointImpulseScale = b3BlendW( impulseScale, b3ZeroW(), mask );
\t\t\tb3Vec3W vrA = b3AddVW( bA.v, b3CrossW( bA.w, rA ) );
\t\t\tb3Vec3W vrB = b3AddVW( bB.v, b3CrossW( bB.w, rB ) );
\t\t\tb3FloatW vn = b3DotW( b3SubVW( vrB, vrA ), c->normal );
\t\t\tb3FloatW negImpulse = b3AddW(
\t\t\t\tb3MulW( cp->normalMasses, b3AddW( b3MulW( pointMassScale, vn ), bias ) ),
\t\t\t\tb3MulW( pointImpulseScale, cp->normalImpulses ) );
\t\t\tb3FloatW newImpulse = b3MaxW( b3SubW( cp->normalImpulses, negImpulse ), b3ZeroW() );
\t\t\tb3FloatW deltaImpulse = b3SubW( newImpulse, cp->normalImpulses );
\t\t\tcp->normalImpulses = newImpulse;
\t\t\tcp->totalNormalImpulses = b3AddW( cp->totalNormalImpulses, newImpulse );
\t\t\ttotalNormalImpulse = b3AddW( totalNormalImpulse, newImpulse );
\t\t\ttotalTwistLimit = b3AddW( totalTwistLimit, b3MulW( cp->leverArms, newImpulse ) );
\t\t\tb3Vec3W P = b3MulSVW( deltaImpulse, c->normal );
\t\t\tbA.w = b3MulSubMVW( bA.w, c->invIA, b3CrossW( rA, P ) );
\t\t\tbA.v = b3MulSubSVW( bA.v, c->invMassA, P );
\t\t\tbB.w = b3MulAddMVW( bB.w, c->invIB, b3CrossW( rB, P ) );
\t\t\tbB.v = b3MulAddSVW( bB.v, c->invMassB, P );
\t\t}
'''

text = text[:start] + new + text[end:]
path.write_text(text, encoding='utf-8')
print('E2A2P_SIMULTANEOUS_TWO_POINT_SOLVE_PATCH_OK')
