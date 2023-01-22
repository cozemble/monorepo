export interface HeadAndTail<T> {
  head: T
  tail: T[]
}

function headAndTail<T>(head: T, tail: T[]): HeadAndTail<T> {
  return {
    head,
    tail,
  }
}

export const headAndTailFns = {
  newInstance<T = any>(head: T, tail: T[]): HeadAndTail<T> {
    return headAndTail<T>(head, tail)
  },
  fromArray<T = any>(array: T[]): HeadAndTail<T> {
    if (array.length === 0) {
      throw new Error('Cannot create HeadAndTail from empty array')
    }
    return headAndTail<T>(array[0], array.slice(1))
  },
}
