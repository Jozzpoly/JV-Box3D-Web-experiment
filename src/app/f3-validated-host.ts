import { F2ContactHost, type F2ContactHostOptions } from "./f2-contact-host.js";
import {
  loadPinnedNativeFactoryReceipt,
  type NativeFactorySnapshot,
} from "../config/native-factory-receipt.js";

export interface F3ValidatedHostDependencies {
  readonly loadReceipt: () => Promise<NativeFactorySnapshot>;
  readonly startPhysics: (options: F2ContactHostOptions) => Promise<F2ContactHost>;
}

const DEFAULT_DEPENDENCIES: F3ValidatedHostDependencies = {
  loadReceipt: () => loadPinnedNativeFactoryReceipt(),
  startPhysics: (options) => F2ContactHost.start(options),
};

export class F3ValidatedHost {
  readonly #receipt: NativeFactorySnapshot;
  readonly #physics: F2ContactHost;
  #disposed = false;

  private constructor(receipt: NativeFactorySnapshot, physics: F2ContactHost) {
    this.#receipt = receipt;
    this.#physics = physics;
  }

  static async start(
    options: F2ContactHostOptions,
    dependencies: F3ValidatedHostDependencies = DEFAULT_DEPENDENCIES,
  ): Promise<F3ValidatedHost> {
    const receipt = await dependencies.loadReceipt();
    const physics = await dependencies.startPhysics(options);
    return new F3ValidatedHost(receipt, physics);
  }

  get receipt(): NativeFactorySnapshot {
    this.#assertActive();
    return this.#receipt;
  }

  get physics(): F2ContactHost {
    this.#assertActive();
    return this.#physics;
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#physics.dispose();
  }

  #assertActive(): void {
    if (this.#disposed) {
      throw new Error("F3ValidatedHost has been disposed.");
    }
  }
}
