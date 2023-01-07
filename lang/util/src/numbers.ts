export function toDecimalPlaces(n: number, places: number): number {
  const factorOfTen = Math.pow(10, places)
  return Math.round(n * factorOfTen) / factorOfTen
}

export const numbers = {
  toDecimalPlaces,
}
