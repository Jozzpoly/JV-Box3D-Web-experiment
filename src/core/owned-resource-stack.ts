export type Disposer = () => void;

export interface DisposalFailure {
  readonly label: string;
  readonly error: unknown;
}

export interface DisposalReport {
  readonly disposedCount: number;
  readonly failures: readonly DisposalFailure[];
}

interface ResourceEntry {
  readonly label: string;
  readonly dispose: Disposer;
}

export class OwnedResourceStack {
  readonly #entries: ResourceEntry[] = [];
  #disposed = false;

  get size(): number {
    return this.#entries.length;
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  defer(label: string, dispose: Disposer): void {
    if (this.#disposed) {
      throw new Error(`Cannot register resource '${label}' on a disposed stack.`);
    }

    this.#entries.push({ label, dispose });
  }

  adopt<T>(label: string, value: T, dispose: (value: T) => void): T {
    this.defer(label, () => dispose(value));
    return value;
  }

  transfer(): OwnedResourceStack {
    if (this.#disposed) {
      throw new Error("Cannot transfer a disposed resource stack.");
    }

    const target = new OwnedResourceStack();
    target.#entries.push(...this.#entries);
    this.#entries.length = 0;
    this.#disposed = true;
    return target;
  }

  dispose(): DisposalReport {
    if (this.#disposed) {
      return { disposedCount: 0, failures: [] };
    }

    this.#disposed = true;
    const failures: DisposalFailure[] = [];
    let disposedCount = 0;

    while (this.#entries.length > 0) {
      const entry = this.#entries.pop();
      if (entry === undefined) {
        continue;
      }

      try {
        entry.dispose();
      } catch (error: unknown) {
        failures.push({ label: entry.label, error });
      } finally {
        disposedCount += 1;
      }
    }

    return { disposedCount, failures };
  }
}

export interface ResourceTransaction<T> {
  readonly value: T;
  readonly resources: OwnedResourceStack;
}

export function runResourceTransaction<T>(
  build: (resources: OwnedResourceStack) => T,
): ResourceTransaction<T> {
  const staging = new OwnedResourceStack();

  try {
    const value = build(staging);
    return { value, resources: staging.transfer() };
  } catch (error: unknown) {
    staging.dispose();
    throw error;
  }
}
