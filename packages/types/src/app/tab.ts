export interface Tab<T> {
  id?: string
  text: string
  value: T
}

export interface TabMap {
  [key: string]: Tab<string>
}
