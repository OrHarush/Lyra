import { AsyncLocalStorage } from 'async_hooks';
import mongoose from 'mongoose';

const WRITE_METHODS = [
  'insertOne',
  'insertMany',
  'updateOne',
  'updateMany',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'findOneAndDelete',
  'bulkWrite',
  'drop',
  'rename',
] as const;

const WRITE_PIPELINE_STAGES = ['$out', '$merge'];

const readOnlyScope = new AsyncLocalStorage<true>();

export class ReadOnlyViolationError extends Error {
  constructor(operation: string) {
    super(`Write operation "${operation}" attempted inside a read-only MCP request`);
    this.name = 'ReadOnlyViolationError';
  }
}

const assertWritable = (operation: string) => {
  if (readOnlyScope.getStore()) {
    throw new ReadOnlyViolationError(operation);
  }
};

const hasWriteStage = (pipeline: unknown) =>
  Array.isArray(pipeline) &&
  pipeline.some(
    stage =>
      typeof stage === 'object' &&
      stage !== null &&
      WRITE_PIPELINE_STAGES.some(name => name in stage)
  );

type CollectionMethod = (this: unknown, ...args: unknown[]) => unknown;

// Patched at the driver's Collection so every model, repository and raw query is covered no
// matter how or when it was defined. Outside a read-only scope the original method runs untouched.
const installDriverGuard = () => {
  const prototype = mongoose.mongo.Collection.prototype as unknown as Record<
    string,
    CollectionMethod
  >;

  WRITE_METHODS.forEach(method => {
    const original = prototype[method];

    prototype[method] = function guardedWrite(...args: unknown[]) {
      assertWritable(method);

      return original.apply(this, args);
    };
  });

  const originalAggregate = prototype.aggregate;

  prototype.aggregate = function guardedAggregate(...args: unknown[]) {
    if (hasWriteStage(args[0])) {
      assertWritable('aggregate with $out/$merge');
    }

    return originalAggregate.apply(this, args);
  };
};

installDriverGuard();

export const runReadOnly = <T>(work: () => Promise<T>): Promise<T> => readOnlyScope.run(true, work);

export const isInReadOnlyScope = () => readOnlyScope.getStore() === true;
