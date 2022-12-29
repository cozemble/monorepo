function intBetween(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function elementOfArray<T>(array: T[]): T {
  if(array.length === 0) {
    throw new Error("asked to provide random element of empty array")
  }
  return array[intBetween(0, array.length - 1)]
}

export const random = {
  intBetween,
  elementOfArray
}
