export type Computation<T> = T;

export type DeepComputation<T> = Computation<{
  [K in keyof T]: T[K] extends object ? DeepComputation<T[K]> : Computation<T[K]>;
}>;
