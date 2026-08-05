import type {
  M6SceneRenderFrameV1,
  M6SceneRenderPassFactoryV1,
  M6SceneRenderPassV1,
} from "./m6-scene-render-pass.js";
import {
  createVehicleVisualRenderResourceV1,
  type VehicleVisualRenderResourceV1,
} from "./vehicle-visual-render-resource.js";
import {
  assertRigidLitNormalBaseColorCapabilityV1,
  type RigidLitNormalBaseColorCapabilityReceiptV1,
} from "./rigid-lit-normal-capability.js";
import {
  createRigidLitNormalRendererV1,
  type RigidLitNormalRendererV1,
} from "./rigid-lit-normal-renderer.js";
import { buildVehicleVisualDrawPlanV1 } from "../visual/rigid-mesh-draw-plan.js";
import type { VehicleVisualFetcherV1 } from "../visual/vehicle-visual-runtime-loader.js";

export interface VehicleVisualLitNormalFirstFrameReceiptV1 {
  readonly capability: RigidLitNormalBaseColorCapabilityReceiptV1;
  readonly generation: number;
  readonly stepIndex: number;
  readonly drawCommandCount: number;
  readonly primitiveDrawCount: number;
}

export interface VehicleVisualLitNormalPassOptionsV1 {
  readonly pageBaseUrl: string;
  readonly packageUrl: string;
  readonly fetcher?: VehicleVisualFetcherV1;
  readonly isVisible?: () => boolean;
  readonly onFirstFrame?: (
    receipt: VehicleVisualLitNormalFirstFrameReceiptV1,
  ) => void;
}

function abortError(): DOMException {
  return new DOMException(
    "Vehicle visual lit-normal pass was aborted.",
    "AbortError",
  );
}

export async function createVehicleVisualLitNormalPassV1(
  gl: WebGLRenderingContext,
  signal: AbortSignal,
  options: VehicleVisualLitNormalPassOptionsV1,
): Promise<M6SceneRenderPassV1> {
  if (signal.aborted) {
    throw abortError();
  }

  const resource = await createVehicleVisualRenderResourceV1(
    gl,
    options.pageBaseUrl,
    options.packageUrl,
    {
      signal,
      ...(options.fetcher === undefined ? {} : { fetcher: options.fetcher }),
      validateRuntime(runtime) {
        assertRigidLitNormalBaseColorCapabilityV1(runtime.cpuAsset);
      },
    },
  );
  const capability = assertRigidLitNormalBaseColorCapabilityV1(
    resource.runtime.cpuAsset,
  );
  if (signal.aborted) {
    resource.dispose();
    throw abortError();
  }

  let rigidRenderer: RigidLitNormalRendererV1 | null = null;
  try {
    rigidRenderer = createRigidLitNormalRendererV1(gl);
    if (signal.aborted) {
      throw abortError();
    }

    let disposed = false;
    let firstFramePublished = false;
    const ownedRenderer = rigidRenderer;
    const ownedResource: VehicleVisualRenderResourceV1 = resource;
    return Object.freeze({
      phase: "BEFORE_DEBUG_VEHICLE" as const,
      render(frame: M6SceneRenderFrameV1): void {
        if (disposed) {
          throw new Error(
            "Cannot render a disposed vehicle visual lit-normal pass.",
          );
        }
        if (options.isVisible?.() === false) {
          return;
        }
        if (frame.gl !== gl) {
          throw new Error(
            "Vehicle visual lit-normal pass received a different WebGL context.",
          );
        }

        const drawPlan = buildVehicleVisualDrawPlanV1(
          ownedResource.runtime,
          frame.trace.visualFrame,
        );
        const receipt = ownedRenderer.render(
          ownedResource.runtime.cpuAsset,
          ownedResource.gpuAsset,
          drawPlan,
          frame.viewProjection,
        );
        if (!firstFramePublished) {
          firstFramePublished = true;
          options.onFirstFrame?.(
            Object.freeze({
              capability,
              generation: frame.trace.generation,
              stepIndex: frame.trace.stepIndex,
              drawCommandCount: receipt.drawCommandCount,
              primitiveDrawCount: receipt.primitiveDrawCount,
            }),
          );
        }
      },
      dispose(): void {
        if (disposed) {
          return;
        }
        disposed = true;
        ownedRenderer.dispose();
        ownedResource.dispose();
      },
    });
  } catch (error: unknown) {
    rigidRenderer?.dispose();
    resource.dispose();
    throw error;
  }
}

export function createVehicleVisualLitNormalPassFactoryV1(
  options: VehicleVisualLitNormalPassOptionsV1,
): M6SceneRenderPassFactoryV1 {
  return (gl, signal) =>
    createVehicleVisualLitNormalPassV1(gl, signal, options);
}
