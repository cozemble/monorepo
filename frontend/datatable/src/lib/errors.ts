export type Check<V> = (v: V | null) => string[]

export function notNull<V>(): Check<V> {
  return (v: V | null) => {
    if (v === null || v === undefined) {
      return ['Null']
    }
    return []
  }
}

export function required<V>(): Check<V> {
  return (v: V | null) => {
    if (v === null || v === undefined || v === '') {
      return ['Required']
    }
    return []
  }
}

export function cantBeOneOf<V>(exclusions: any[], message: string): Check<V> {
  return (v: V | null) => {
    if (v === null || v === undefined) {
      return []
    }
    if (exclusions.includes(v)) {
      return [message]
    }
    return []
  }
}

export function conditionalErrorChecks<V>(
  v: V,
  condition: Check<V>,
  ...checks: Check<V>[]
): string[] {
  if (condition(v).length === 0) {
    return checks.flatMap((check) => check(v))
  }
  return []
}
