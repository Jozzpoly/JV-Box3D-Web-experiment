// Wheel-mode5 RQ2C4 hard-relax direct guide.
//
// The physical scenario is intentionally the exact RQ2C3 function. RQ2C4
// changes only the transient ParallelJoint scalar-guide solve/relax semantics
// in the vendor patch. This wrapper changes evidence identity only.

static val rq2c4RunOuterP75HardRelaxGuide( float yawDegrees )
{
    val result = rq2c3RunOuterP75DirectGuide( yawDegrees );
    if ( result["valid"].as<bool>() )
    {
        result.set( "apparatus", "RQ2C4_DIRECT_PARALLEL_LOCAL_Z_ENGINE_NATIVE_HARD_RELAX" );
        result.set( "linearGuideRelaxation", "USE_BIAS_SOFT_SOLVE_HARD_RELAX" );
    }
    return result;
}
