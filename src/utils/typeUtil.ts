export type PartialPick<T, F extends keyof T> = Omit<T, F> &
  Partial<Pick<T, F>>;
