export type Option<T = any> = (t: T) => T

export const options = {
  apply<T = any>(t: T, ...options: Option[]): T {
    return options.reduce((t, option) => option(t), t)
  },
}
