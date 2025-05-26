export type ConverterApi<T, R> = (data: Array<T>) => Array<R>

export interface KeyMap<K> {
  [key: string]: K
}

export interface WithFilter<K, T> {
  filter: T;
  data: K;
}

export type RequireOne<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X]
} & {
  [P in K]-?: T[P]
}

export interface ValueUnit<T> {
  value: number
  unit: T
}

export type InitItemWithIndex<T> = (index: number) => T
